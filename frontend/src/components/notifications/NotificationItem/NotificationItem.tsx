import { Link } from 'react-router-dom';
import { Notification } from '@/types/notification';
import { formatDate } from '@/utils/formatters';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onClose?: () => void;
}

const NotificationItem = ({ notification, onRead, onClose }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    onClose?.();
  };

  const getIcon = () => {
    switch (notification.notification_type) {
      case 'booking_confirmed':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'event_reminder':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M10 5V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'event_cancelled':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getTypeColor = () => {
    switch (notification.notification_type) {
      case 'booking_confirmed':
        return 'var(--success, #28a745)';
      case 'event_reminder':
        return 'var(--warning, #ffc107)';
      case 'event_cancelled':
        return 'var(--error, #dc3545)';
      default:
        return 'var(--primary, #007bff)';
    }
  };

  const content = (
    <div
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-icon" style={{ color: getTypeColor() }}>
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-header-row">
          <h4 className="notification-title">{notification.title}</h4>
          {!notification.read && <span className="unread-dot"></span>}
        </div>
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">
          {formatDate(notification.created_at)}
        </span>
      </div>
    </div>
  );

  if (notification.action_url) {
    return (
      <Link to={notification.action_url} className="notification-link">
        {content}
      </Link>
    );
  }

  return content;
};

export default NotificationItem;

