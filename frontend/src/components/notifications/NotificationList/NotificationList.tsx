import { useNotifications } from '@/context/NotificationContext';
import { Loading } from '@/components/common/Loading/Loading';
import NotificationItem from '@/components/notifications/NotificationItem/NotificationItem';
import { formatDate } from '@/utils/formatters';
import './NotificationList.css';

interface NotificationListProps {
  onClose?: () => void;
}

const NotificationList = ({ onClose }: NotificationListProps) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
            aria-label="Mark all as read"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="notification-loading">
          <Loading size="small" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="notification-empty">
          <p>No notifications</p>
        </div>
      ) : (
        <div className="notification-content">
          {unreadNotifications.length > 0 && (
            <div className="notification-section">
              <h4 className="section-title">New</h4>
              {unreadNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClose={onClose}
                />
              ))}
            </div>
          )}

          {readNotifications.length > 0 && (
            <div className="notification-section">
              {unreadNotifications.length > 0 && (
                <h4 className="section-title">Earlier</h4>
              )}
              {readNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="notification-footer">
        <button
          className="view-all-btn"
          onClick={() => {
            window.location.href = '/notifications';
            onClose?.();
          }}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationList;

