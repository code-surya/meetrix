# frozen_string_literal: true

class NotificationBroadcastService
  def self.broadcast_to_user(user, notification)
    return unless user.present? && notification.present?

    # Broadcast via ActionCable
    NotificationsChannel.broadcast_to(
      user,
      {
        type: 'new_notification',
        notification: serialize_notification(notification)
      }
    )

    # Also send push notification if enabled
    send_push_notification(user, notification) if user.push_notifications_enabled?
  end

  def self.broadcast_notification_update(user, notification)
    return unless user.present? && notification.present?

    NotificationsChannel.broadcast_to(
      user,
      {
        type: 'notification_updated',
        notification: serialize_notification(notification)
      }
    )
  end

  def self.broadcast_notification_count(user)
    return unless user.present?

    unread_count = user.notifications.unread.count

    NotificationsChannel.broadcast_to(
      user,
      {
        type: 'notification_count',
        unread_count: unread_count
      }
    )
  end

  private

  def self.serialize_notification(notification)
    {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      read: notification.read,
      read_at: notification.read_at,
      action_url: notification.action_url,
      metadata: notification.metadata,
      created_at: notification.created_at.iso8601,
      notifiable_type: notification.notifiable_type,
      notifiable_id: notification.notifiable_id
    }
  end

  def self.send_push_notification(user, notification)
    # Integrate with push notification service (FCM, APNS)
    # PushNotificationService.send(user, notification.title, notification.message)
  end
end

