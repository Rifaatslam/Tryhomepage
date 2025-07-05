from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI(title="Browser Homepage API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/browser_homepage")
client = AsyncIOMotorClient(MONGO_URL)
db = client.browser_homepage

# Auth setup
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    name: str
    preferences: dict = {}
    created_at: datetime

class BookmarkCreate(BaseModel):
    title: str
    url: str
    icon: str = "🔗"
    category: str = "general"

class Bookmark(BaseModel):
    id: str
    user_id: str
    title: str
    url: str
    icon: str
    category: str
    order: int
    created_at: datetime

class UserPreferences(BaseModel):
    theme: str = "dark"
    default_search_engine: str = "google"
    clock_format: str = "12h"
    language: str = "bn"

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

# Default bookmarks for new users
DEFAULT_BOOKMARKS = [
    {"title": "Google", "url": "https://www.google.com", "icon": "🔍", "category": "search"},
    {"title": "YouTube", "url": "https://www.youtube.com", "icon": "▶️", "category": "entertainment"},
    {"title": "Gmail", "url": "https://mail.google.com", "icon": "📧", "category": "email"},
    {"title": "Wikipedia", "url": "https://en.wikipedia.org", "icon": "📚", "category": "education"},
    {"title": "Translate", "url": "https://translate.google.com", "icon": "🌐", "category": "tools"},
    {"title": "Facebook", "url": "https://www.facebook.com", "icon": "📘", "category": "social"},
]

# API Routes
@app.get("/")
async def root():
    return {"message": "Browser Homepage API is running"}

@app.post("/api/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password_hash": hashed_password,
        "preferences": {
            "theme": "dark",
            "default_search_engine": "google",
            "clock_format": "12h",
            "language": "bn"
        },
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create default bookmarks
    bookmarks = []
    for i, bookmark in enumerate(DEFAULT_BOOKMARKS):
        bookmark_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": bookmark["title"],
            "url": bookmark["url"],
            "icon": bookmark["icon"],
            "category": bookmark["category"],
            "order": i,
            "created_at": datetime.utcnow()
        }
        bookmarks.append(bookmark_doc)
    
    await db.bookmarks.insert_many(bookmarks)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await db.users.update_one(
        {"email": user.email},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user", response_model=User)
async def get_user(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        preferences=current_user.get("preferences", {}),
        created_at=current_user["created_at"]
    )

@app.get("/api/bookmarks", response_model=List[Bookmark])
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    bookmarks = await db.bookmarks.find({"user_id": current_user["id"]}).sort("order", 1).to_list(100)
    return [Bookmark(**bookmark) for bookmark in bookmarks]

@app.post("/api/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark: BookmarkCreate, current_user: dict = Depends(get_current_user)):
    # Get the current max order
    last_bookmark = await db.bookmarks.find_one(
        {"user_id": current_user["id"]},
        sort=[("order", -1)]
    )
    next_order = (last_bookmark["order"] + 1) if last_bookmark else 0
    
    bookmark_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "title": bookmark.title,
        "url": bookmark.url,
        "icon": bookmark.icon,
        "category": bookmark.category,
        "order": next_order,
        "created_at": datetime.utcnow()
    }
    
    await db.bookmarks.insert_one(bookmark_doc)
    return Bookmark(**bookmark_doc)

@app.delete("/api/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bookmarks.delete_one({"id": bookmark_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"message": "Bookmark deleted successfully"}

@app.put("/api/user/preferences")
async def update_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"preferences": preferences.dict()}}
    )
    return {"message": "Preferences updated successfully"}

@app.get("/api/search-engines")
async def get_search_engines():
    return {
        "google": {"name": "Google", "url": "https://www.google.com/search?q="},
        "youtube": {"name": "YouTube", "url": "https://www.youtube.com/results?search_query="},
        "wikipedia": {"name": "Wikipedia", "url": "https://en.wikipedia.org/wiki/"},
        "bing": {"name": "Bing", "url": "https://www.bing.com/search?q="},
        "duckduckgo": {"name": "DuckDuckGo", "url": "https://duckduckgo.com/?q="},
        "translate_bn": {"name": "Google Translate (Bengali)", "url": "https://translate.google.com/?sl=auto&tl=bn&text="},
        "translate_en": {"name": "Google Translate (English)", "url": "https://translate.google.com/?sl=auto&tl=en&text="},
        "bdnews": {"name": "BDNews24", "url": "https://bangla.bdnews24.com/search/?query="}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)