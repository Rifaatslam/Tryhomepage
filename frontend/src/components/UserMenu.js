import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = ({ user, onSettings, onAddBookmark }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="glass p-3 rounded-xl text-white hover:bg-white/20 
                 transition-all btn-hover flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 
                      rounded-full flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{user?.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-lg 
                      border border-white/20 user-menu z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-white/70 text-sm border-b border-white/10">
              {user?.email}
            </div>
            
            <button
              onClick={() => {
                onAddBookmark();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>বুকমার্ক যোগ করুন</span>
            </button>
            
            <button
              onClick={() => {
                onSettings();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <span>⚙️</span>
              <span>সেটিংস</span>
            </button>
            
            <hr className="border-white/10 my-2" />
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default UserMenu;