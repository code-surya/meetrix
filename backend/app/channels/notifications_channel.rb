# frozen_string_literal: true

class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user

    stream_for current_user
    Rails.logger.info "User #{current_user.id} subscribed to notifications channel"
  end

  def unsubscribed
    Rails.logger.info "User #{current_user&.id} unsubscribed from notifications channel"
  end

  def mark_as_read(data)
    return unless current_user

    notification = current_user.notifications.find_by(id: data['notification_id'])
    return unless notification

    notification.mark_as_read!
    
    transmit({
      type: 'notification_read',
      notification_id: notification.id,
      read: true
    })
  end

  def mark_all_as_read
    return unless current_user

    current_user.notifications.unread.update_all(
      read: true,
      read_at: Time.current
    )

    transmit({
      type: 'all_notifications_read',
      count: 0
    })
  end

  private

  def current_user
    @current_user ||= find_verified_user
  end

  def find_verified_user
    # Extract token from connection params or headers
    token = connection.params[:token] || extract_token_from_headers

    return nil unless token

    decoded = JwtService.decode(token)
    return nil unless decoded

    User.find_by(id: decoded['user_id'])
  end

  def extract_token_from_headers
    # ActionCable connection headers
    auth_header = connection.request.headers['Authorization'] ||
                  connection.request.headers['authorization']

    return nil unless auth_header

    auth_header.split(' ').last if auth_header.start_with?('Bearer ')
  end
end

