import React, { useState } from 'react';

const BookmarkGrid = ({ bookmarks, onDeleteBookmark }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleBookmarkClick = (url) => {
    window.open(url, '_blank');
  };

  const handleDeleteClick = (e, bookmarkId) => {
    e.stopPropagation();
    setShowDeleteConfirm(bookmarkId);
  };

  const confirmDelete = (bookmarkId) => {
    onDeleteBookmark(bookmarkId);
    setShowDeleteConfirm(null);
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass p-8 rounded-2xl inline-block">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-white/70 text-lg">কোন বুকমার্ক নেই</p>
          <p className="text-white/50 text-sm mt-2">নতুন বুকমার্ক যোগ করুন</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-grid">
      {bookmarks.map((bookmark, index) => (
        <div
          key={bookmark.id}
          className={`bookmark-card glass p-4 rounded-xl text-white text-center 
                    hover:bg-white/25 transition-all cursor-pointer relative group
                    animate-slide-up animate-delay-${(index % 3) * 100}`}
          onClick={() => handleBookmarkClick(bookmark.url)}
        >
          <div className="text-3xl mb-2">{bookmark.icon}</div>
          <div className="font-medium text-sm truncate">{bookmark.title}</div>
          
          {/* Delete Button */}
          <button
            onClick={(e) => handleDeleteClick(e, bookmark.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                     transition-opacity bg-red-500 hover:bg-red-600 
                     text-white rounded-full w-6 h-6 flex items-center justify-center
                     text-xs"
          >
            ×
          </button>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl max-w-sm w-full">
            <h3 className="text-white text-lg font-semibold mb-4">
              নিশ্চিত করুন
            </h3>
            <p className="text-white/70 mb-6">
              আপনি কি এই বুকমার্কটি মুছে ফেলতে চান?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 
                         rounded-xl transition-colors"
              >
                হ্যাঁ, মুছুন
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 glass border border-white/20 text-white py-2 px-4 
                         rounded-xl hover:bg-white/10 transition-colors"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;