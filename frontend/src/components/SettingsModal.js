import React, { useState } from 'react';

const SettingsModal = ({ user, onClose, onUpdate }) => {
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'dark',
    default_search_engine: user?.preferences?.default_search_engine || 'google',
    clock_format: user?.preferences?.clock_format || '12h',
    language: user?.preferences?.language || 'bn'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass p-6 rounded-2xl max-w-md w-full settings-modal">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            সেটিংস
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              থিম
            </label>
            <select
              name="theme"
              value={preferences.theme}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all"
            >
              <option value="dark" className="bg-gray-800 text-white">গাঢ়</option>
              <option value="light" className="bg-gray-800 text-white">হালকা</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              ডিফল্ট সার্চ ইঞ্জিন
            </label>
            <select
              name="default_search_engine"
              value={preferences.default_search_engine}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all"
            >
              <option value="google" className="bg-gray-800 text-white">Google</option>
              <option value="bing" className="bg-gray-800 text-white">Bing</option>
              <option value="duckduckgo" className="bg-gray-800 text-white">DuckDuckGo</option>
              <option value="youtube" className="bg-gray-800 text-white">YouTube</option>
              <option value="wikipedia" className="bg-gray-800 text-white">Wikipedia</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              ঘড়ির ফরম্যাট
            </label>
            <select
              name="clock_format"
              value={preferences.clock_format}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all"
            >
              <option value="12h" className="bg-gray-800 text-white">12 ঘণ্টা</option>
              <option value="24h" className="bg-gray-800 text-white">24 ঘণ্টা</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              ভাষা
            </label>
            <select
              name="language"
              value={preferences.language}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all"
            >
              <option value="bn" className="bg-gray-800 text-white">বাংলা</option>
              <option value="en" className="bg-gray-800 text-white">English</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass border border-white/20 text-white py-3 px-4 
                       rounded-xl hover:bg-white/10 transition-all"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 
                       text-white py-3 px-4 rounded-xl hover:from-indigo-600 
                       hover:to-purple-700 transition-all disabled:opacity-50 
                       disabled:cursor-not-allowed"
            >
              {loading ? 'সেভ করা হচ্ছে...' : 'সেভ করুন'}
            </button>
          </div>
        </form>

        {/* User Information */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-white/80 text-sm font-medium mb-2">অ্যাকাউন্ট তথ্য</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">নাম:</span>
              <span className="text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ইমেইল:</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">সদস্য হয়েছেন:</span>
              <span className="text-white">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;