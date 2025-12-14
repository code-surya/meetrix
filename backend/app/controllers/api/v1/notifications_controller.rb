# frozen_string_literal: true

module Api
  module V1
    class NotificationsController < BaseController
      before_action :authenticate_user!
      before_action :set_notification, only: [:show, :mark_read, :destroy]

      # GET /api/v1/notifications
      def index
        notifications = current_user.notifications.recent
        notifications = notifications.unread if params[:unread] == 'true'
        notifications = notifications.page(params[:page] || 1).per(params[:per_page] || 50)

        render_success(
          data: {
            notifications: notifications.map { |n| notification_serializer(n) },
            pagination: pagination_meta(notifications),
            unread_count: current_user.notifications.unread.count
          }
        )
      end

      # GET /api/v1/notifications/:id
      def show
        authorize @notification
        render_success(
          data: {
            notification: notification_serializer(@notification, detailed: true)
          }
        )
      end

      # PATCH /api/v1/notifications/:id/read
      def mark_read
        authorize @notification
        @notification.mark_as_read!

        # Broadcast update
        NotificationBroadcastService.broadcast_notification_count(current_user)

        render_success(
          data: {
            notification: notification_serializer(@notification)
          },
          message: 'Notification marked as read'
        )
      end

      # PATCH /api/v1/notifications/mark_all_read
      def mark_all_read
        current_user.notifications.unread.update_all(
          read: true,
          read_at: Time.current
        )

        # Broadcast update
        NotificationBroadcastService.broadcast_notification_count(current_user)

        render_success(message: 'All notifications marked as read')
      end

      # GET /api/v1/notifications/unread
      def unread
        notifications = current_user.notifications.unread.recent
        unread_count = notifications.count

        render_success(
          data: {
            notifications: notifications.map { |n| notification_serializer(n) },
            unread_count: unread_count
          }
        )
      end

      # DELETE /api/v1/notifications/:id
      def destroy
        authorize @notification
        @notification.destroy

        render_success(message: 'Notification deleted')
      end

      private

      def set_notification
        @notification = Notification.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found(message: 'Notification not found')
      end

      def notification_serializer(notification, detailed: false)
        data = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          notification_type: notification.notification_type,
          read: notification.read,
          read_at: notification.read_at,
          action_url: notification.action_url,
          created_at: notification.created_at
        }

        if detailed
          data.merge!(
            metadata: notification.metadata,
            notifiable_type: notification.notifiable_type,
            notifiable_id: notification.notifiable_id
          )
        end

        data
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
end

