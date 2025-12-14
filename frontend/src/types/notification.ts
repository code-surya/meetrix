export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'event_reminder'
    | 'event_cancelled'
    | 'event_updated'
    | 'group_invitation'
    | 'payment_failed'
    | 'review_request'
    | 'general';
  read: boolean;
  read_at: string | null;
  action_url: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  notifiable_type?: string;
  notifiable_id?: number;
}

