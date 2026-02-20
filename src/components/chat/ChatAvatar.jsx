/**
 * ChatAvatar - Shows profile photo or color + initial fallback.
 */
export default function ChatAvatar({ userName, userColor, authUserId, avatarMap, size = 'w-7 h-7' }) {
  const avatarUrl = authUserId && avatarMap ? avatarMap[authUserId] : null;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={userName}
        className={`${size} rounded-full object-cover flex-shrink-0 mt-0.5`}
        title={userName}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}
      style={{ backgroundColor: userColor || '#64748b' }}
      title={userName}
    >
      {(userName || '?')[0].toUpperCase()}
    </div>
  );
}
