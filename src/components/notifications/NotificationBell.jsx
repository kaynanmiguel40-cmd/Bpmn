import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../lib/notificationService';
import { NotificationPanel } from './NotificationPanel';

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    const [notifs, count] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escutar evento custom de nova notificacao
  useEffect(() => {
    const handleNewNotif = () => loadNotifications();
    window.addEventListener('notification-created', handleNewNotif);
    return () => window.removeEventListener('notification-created', handleNewNotif);
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    await loadNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notificacoes"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default NotificationBell;
