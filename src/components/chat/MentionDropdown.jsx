import { useEffect, useRef } from 'react';
import ChatAvatar from './ChatAvatar';

/**
 * MentionDropdown - floating autocomplete for @mentions.
 * Shows filtered team members, supports keyboard navigation.
 */
export default function MentionDropdown({ members, activeIndex, onSelect, onClose, avatarMap }) {
  const listRef = useRef(null);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.children[activeIndex];
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!members || members.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
      <div ref={listRef} className="py-1">
        {members.map((member, i) => (
          <button
            key={member.id}
            type="button"
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              i === activeIndex
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent textarea blur
              onSelect(member);
            }}
          >
            <ChatAvatar
              userName={member.name}
              userColor={member.color}
              authUserId={member.authUserId}
              avatarMap={avatarMap}
              size="w-6 h-6"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block">{member.name}</span>
              {member.role && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">{member.role}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
