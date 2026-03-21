import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, X, Package, Tag, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import { notificationService, type Notification, type NotificationType } from '../../services/notificationService';
import './NotificationDropdown.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return <Package size={16} className="notif-icon-order" />;
    case 'promotion':
      return <Tag size={16} className="notif-icon-promotion" />;
    case 'review':
      return <Star size={16} className="notif-icon-review" />;
    case 'system':
      return <Info size={16} className="notif-icon-system" />;
    default:
      return <Bell size={16} />;
  }
};

const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="notif-dropdown"
          ref={dropRef}
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="notif-header">
            <h3 className="notif-title">
              <Bell size={18} />
              Thông báo
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </h3>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllAsRead}>
                  <Check size={14} /> Đánh dấu đã đọc
                </button>
              )}
              <button className="notif-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={48} strokeWidth={1} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notif-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notif-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notif-content">
                    <p className="notif-item-title">{notification.title}</p>
                    <p className="notif-message">{notification.message}</p>
                    <span className="notif-time">
                      {notificationService.formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notif-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="Xóa thông báo"
                  >
                    <Trash2 size={14} />
                  </button>
                  {!notification.read && <span className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notif-footer">
              <Link to="/profile?tab=notifications" className="notif-view-all" onClick={onClose}>
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
