import React, { useState } from 'react';

const SearchForm = ({ searchEngines }) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('google');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && searchEngines[selectedEngine]) {
      const url = searchEngines[selectedEngine].url + encodeURIComponent(query.trim());
      window.open(url, '_blank');
      setQuery('');
    }
  };

  return (
    <div className="search-form">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Engine Selector */}
        <div>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                     text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                     transition-all input-focus"
          >
            {Object.entries(searchEngines).map(([key, engine]) => (
              <option key={key} value={key} className="bg-gray-800 text-white">
                {engine.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="এখানে লিখুন..."
            className="w-full px-6 py-4 text-lg rounded-2xl glass border border-white/20 
                     text-white placeholder-white/60 focus:outline-none focus:ring-2 
                     focus:ring-white/50 transition-all duration-300 input-focus pr-16"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                     p-3 rounded-xl hover:scale-110 transition-all duration-300 
                     shadow-lg btn-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;