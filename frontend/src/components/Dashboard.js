import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Clock from './Clock';
import SearchForm from './SearchForm';
import BookmarkGrid from './BookmarkGrid';
import UserMenu from './UserMenu';
import AddBookmarkModal from './AddBookmarkModal';
import SettingsModal from './SettingsModal';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [searchEngines, setSearchEngines] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
    fetchSearchEngines();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/api/bookmarks');
      setBookmarks(response.data);
    } catch (error) {
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchEngines = async () => {
    try {
      const response = await api.get('/api/search-engines');
      setSearchEngines(response.data);
    } catch (error) {
      console.error('Failed to fetch search engines:', error);
    }
  };

  const handleAddBookmark = async (bookmarkData) => {
    try {
      const response = await api.post('/api/bookmarks', bookmarkData);
      setBookmarks([...bookmarks, response.data]);
      setShowAddBookmark(false);
    } catch (error) {
      setError('Failed to add bookmark');
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/api/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (error) {
      setError('Failed to delete bookmark');
    }
  };

  const handleUpdatePreferences = async (preferences) => {
    try {
      await api.put('/api/user/preferences', preferences);
      setShowSettings(false);
    } catch (error) {
      setError('Failed to update preferences');
    }
  };

  const categories = ['all', ...new Set(bookmarks.map(bookmark => bookmark.category))];
  const filteredBookmarks = selectedCategory === 'all' 
    ? bookmarks 
    : bookmarks.filter(bookmark => bookmark.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-white">
          <h1 className="text-2xl font-bold">আসসালামু আলাইকুম, {user?.name}!</h1>
          <p className="text-white/70">আপনার ব্যক্তিগত হোমপেজে স্বাগতম</p>
        </div>
        <UserMenu 
          user={user} 
          onSettings={() => setShowSettings(true)}
          onAddBookmark={() => setShowAddBookmark(true)}
        />
      </div>

      {error && (
        <div className="error-message mb-4">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Clock */}
        <Clock />

        {/* Search Form */}
        <SearchForm searchEngines={searchEngines} />

        {/* Category Filter */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'সব' : category}
            </button>
          ))}
        </div>

        {/* Bookmarks Grid */}
        <BookmarkGrid 
          bookmarks={filteredBookmarks}
          onDeleteBookmark={handleDeleteBookmark}
        />

        {/* Add Bookmark Button */}
        <div className="text-center">
          <button
            onClick={() => setShowAddBookmark(true)}
            className="glass px-6 py-3 rounded-xl text-white hover:bg-white/20 
                     transition-all btn-hover inline-flex items-center"
          >
            <span className="mr-2">+</span>
            নতুন বুকমার্ক যোগ করুন
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddBookmark && (
        <AddBookmarkModal
          onClose={() => setShowAddBookmark(false)}
          onAdd={handleAddBookmark}
        />
      )}

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdatePreferences}
        />
      )}
    </div>
  );
};

export default Dashboard;