import requests
import unittest
import json
import time
from datetime import datetime

class BrowserHomepageAPITest(unittest.TestCase):
    def setUp(self):
        # Get the backend URL from frontend .env file
        self.base_url = "http://localhost:8001"
        self.test_user = {
            "email": f"test2@example.com",
            "password": "testpass123",
            "name": "Test User 2"
        }
        self.token = None

    def test_01_api_root(self):
        """Test the API root endpoint"""
        print("\n🔍 Testing API root endpoint...")
        response = requests.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        print("✅ API root endpoint is working")

    def test_02_register_user(self):
        """Test user registration"""
        print("\n🔍 Testing user registration...")
        response = requests.post(
            f"{self.base_url}/api/register",
            json=self.test_user
        )
        
        # If user already exists, this will fail with 400
        if response.status_code == 400:
            print("⚠️ User already exists, proceeding with login test")
        else:
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("access_token", data)
            self.assertIn("token_type", data)
            self.assertEqual(data["token_type"], "bearer")
            self.token = data["access_token"]
            print("✅ User registration successful")

    def test_03_login_user(self):
        """Test user login"""
        print("\n🔍 Testing user login...")
        response = requests.post(
            f"{self.base_url}/api/login",
            json={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("token_type", data)
        self.assertEqual(data["token_type"], "bearer")
        self.token = data["access_token"]
        print("✅ User login successful")

    def test_04_get_user_profile(self):
        """Test getting user profile"""
        print("\n🔍 Testing get user profile...")
        if not self.token:
            self.test_03_login_user()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/api/user", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], self.test_user["email"])
        self.assertEqual(data["name"], self.test_user["name"])
        print("✅ User profile retrieved successfully")

    def test_05_get_bookmarks(self):
        """Test getting user bookmarks"""
        print("\n🔍 Testing get bookmarks...")
        if not self.token:
            self.test_03_login_user()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/api/bookmarks", headers=headers)
        self.assertEqual(response.status_code, 200)
        bookmarks = response.json()
        self.assertIsInstance(bookmarks, list)
        # Should have default bookmarks
        self.assertGreaterEqual(len(bookmarks), 1)
        print(f"✅ Retrieved {len(bookmarks)} bookmarks successfully")
        return bookmarks

    def test_06_create_bookmark(self):
        """Test creating a new bookmark"""
        print("\n🔍 Testing create bookmark...")
        if not self.token:
            self.test_03_login_user()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        new_bookmark = {
            "title": "Test Bookmark",
            "url": "https://example.com/test",
            "icon": "🧪",
            "category": "testing"
        }
        
        response = requests.post(
            f"{self.base_url}/api/bookmarks",
            json=new_bookmark,
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], new_bookmark["title"])
        self.assertEqual(data["url"], new_bookmark["url"])
        self.assertEqual(data["icon"], new_bookmark["icon"])
        self.assertEqual(data["category"], new_bookmark["category"])
        print("✅ Bookmark created successfully")
        return data["id"]

    def test_07_delete_bookmark(self):
        """Test deleting a bookmark"""
        print("\n🔍 Testing delete bookmark...")
        if not self.token:
            self.test_03_login_user()
            
        # First create a bookmark to delete
        bookmark_id = self.test_06_create_bookmark()
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.delete(
            f"{self.base_url}/api/bookmarks/{bookmark_id}",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ Bookmark deleted successfully")

    def test_08_update_preferences(self):
        """Test updating user preferences"""
        print("\n🔍 Testing update preferences...")
        if not self.token:
            self.test_03_login_user()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        preferences = {
            "theme": "light",
            "default_search_engine": "duckduckgo",
            "clock_format": "24h",
            "language": "en"
        }
        
        response = requests.put(
            f"{self.base_url}/api/user/preferences",
            json=preferences,
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ User preferences updated successfully")

    def test_09_get_search_engines(self):
        """Test getting search engines"""
        print("\n🔍 Testing get search engines...")
        response = requests.get(f"{self.base_url}/api/search-engines")
        self.assertEqual(response.status_code, 200)
        engines = response.json()
        self.assertIsInstance(engines, dict)
        self.assertIn("google", engines)
        self.assertIn("youtube", engines)
        print(f"✅ Retrieved {len(engines)} search engines successfully")

    def test_10_full_workflow(self):
        """Test a complete user workflow"""
        print("\n🔍 Testing full user workflow...")
        
        # 1. Login
        login_response = requests.post(
            f"{self.base_url}/api/login",
            json={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get user profile
        profile_response = requests.get(f"{self.base_url}/api/user", headers=headers)
        self.assertEqual(profile_response.status_code, 200)
        
        # 3. Get bookmarks
        bookmarks_response = requests.get(f"{self.base_url}/api/bookmarks", headers=headers)
        self.assertEqual(bookmarks_response.status_code, 200)
        initial_bookmarks_count = len(bookmarks_response.json())
        
        # 4. Create a new bookmark
        new_bookmark = {
            "title": "Workflow Test",
            "url": "https://example.com/workflow",
            "icon": "🔄",
            "category": "workflow"
        }
        create_response = requests.post(
            f"{self.base_url}/api/bookmarks",
            json=new_bookmark,
            headers=headers
        )
        self.assertEqual(create_response.status_code, 200)
        bookmark_id = create_response.json()["id"]
        
        # 5. Verify bookmark was added
        updated_bookmarks_response = requests.get(f"{self.base_url}/api/bookmarks", headers=headers)
        self.assertEqual(updated_bookmarks_response.status_code, 200)
        self.assertEqual(len(updated_bookmarks_response.json()), initial_bookmarks_count + 1)
        
        # 6. Delete the bookmark
        delete_response = requests.delete(
            f"{self.base_url}/api/bookmarks/{bookmark_id}",
            headers=headers
        )
        self.assertEqual(delete_response.status_code, 200)
        
        # 7. Verify bookmark was deleted
        final_bookmarks_response = requests.get(f"{self.base_url}/api/bookmarks", headers=headers)
        self.assertEqual(final_bookmarks_response.status_code, 200)
        self.assertEqual(len(final_bookmarks_response.json()), initial_bookmarks_count)
        
        print("✅ Full user workflow completed successfully")

if __name__ == "__main__":
    # Create a test suite
    test_suite = unittest.TestSuite()
    
    # Add tests in order
    test_suite.addTest(BrowserHomepageAPITest('test_01_api_root'))
    test_suite.addTest(BrowserHomepageAPITest('test_02_register_user'))
    test_suite.addTest(BrowserHomepageAPITest('test_03_login_user'))
    test_suite.addTest(BrowserHomepageAPITest('test_04_get_user_profile'))
    test_suite.addTest(BrowserHomepageAPITest('test_05_get_bookmarks'))
    test_suite.addTest(BrowserHomepageAPITest('test_06_create_bookmark'))
    test_suite.addTest(BrowserHomepageAPITest('test_07_delete_bookmark'))
    test_suite.addTest(BrowserHomepageAPITest('test_08_update_preferences'))
    test_suite.addTest(BrowserHomepageAPITest('test_09_get_search_engines'))
    test_suite.addTest(BrowserHomepageAPITest('test_10_full_workflow'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)