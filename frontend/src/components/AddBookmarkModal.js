import React, { useState } from 'react';

const AddBookmarkModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: '🔗',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'general', 'search', 'social', 'entertainment', 'education', 
    'tools', 'news', 'shopping', 'email', 'work'
  ];

  const commonIcons = [
    '🔗', '🔍', '📧', '🎵', '🎮', '📚', '🛒', '📰', '💼', '🌐',
    '⚡', '🚀', '💡', '🎯', '🔥', '⭐', '🎨', '📱', '💻', '🎪'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate URL
    if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      setFormData({
        ...formData,
        url: 'https://' + formData.url
      });
    }

    try {
      await onAdd(formData);
    } catch (error) {
      setError('Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass p-6 rounded-2xl max-w-md w-full add-bookmark-form">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            নতুন বুকমার্ক যোগ করুন
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

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              নাম *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white placeholder-white/60 focus:outline-none focus:ring-2 
                       focus:ring-white/50 transition-all input-focus"
              placeholder="বুকমার্কের নাম"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white placeholder-white/60 focus:outline-none focus:ring-2 
                       focus:ring-white/50 transition-all input-focus"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              আইকন
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-16 px-3 py-2 rounded-lg glass border border-white/20 
                         text-white text-center focus:outline-none focus:ring-2 
                         focus:ring-white/50 transition-all"
                maxLength="2"
              />
              <span className="text-white/70 text-sm">বা নিচে থেকে বেছে নিন</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {commonIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({...formData, icon})}
                  className={`p-2 rounded-lg transition-all hover:bg-white/20 
                           ${formData.icon === icon ? 'bg-white/20' : 'bg-white/10'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              ক্যাটাগরি
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {category}
                </option>
              ))}
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
              {loading ? 'যোগ করা হচ্ছে...' : 'যোগ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkModal;