import { useState, useEffect, useMemo } from 'react';
import { useChatSummaries } from '../../hooks/queries';
import { getProfile } from '../../lib/profileService';
import { getUnreadCount } from '../../lib/commentService';
import ChatSidePanel from './ChatSidePanel';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState({});
  const { data: summaries = {} } = useChatSummaries();

  useEffect(() => {
    getProfile().then(p => p && setProfile(p));
  }, []);

  // Count total unread messages
  const unreadCount = useMemo(() => {
    return Object.entries(summaries).reduce(
      (sum, [orderId, s]) => sum + getUnreadCount(orderId, profile.id, s.count), 0
    );
  }, [summaries, profile.id]);

  return (
    <div className="print:hidden">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-slate-600 hover:bg-slate-700 rotate-90'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        }`}
        title="Chat da Equipe"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Side Panel */}
      <ChatSidePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userName={profile.name || ''}
        userId={profile.id || null}
      />
    </div>
  );
}
