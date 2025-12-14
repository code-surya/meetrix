import { getToken } from '@/services/storage/localStorage';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || 
                 import.meta.env.VITE_API_URL?.replace(/^https?/, 'ws') ||
                 `${protocol}//${window.location.host}`;
    this.url = `${host}/cable`;
  }

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const token = getToken();
        if (!token) {
          reject(new Error('No authentication token'));
          this.isConnecting = false;
          return;
        }

        // Add token to connection URL
        const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Subscribe to notifications channel
          this.subscribeToNotifications();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.ws = null;

          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private subscribeToNotifications() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      command: 'subscribe',
      identifier: JSON.stringify({
        channel: 'NotificationsChannel'
      })
    };

    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(data: any) {
    // Handle ActionCable message format
    if (data.type === 'ping') {
      // Respond to ping
      return;
    }

    if (data.type === 'confirm_subscription') {
      console.log('Subscribed to notifications channel');
      return;
    }

    if (data.type === 'reject_subscription') {
      console.error('Failed to subscribe to notifications channel');
      return;
    }

    if (data.message) {
      const { type, notification, notification_count, unread_count } = data.message;

      switch (type) {
        case 'new_notification':
          this.emit('new_notification', notification);
          break;
        case 'notification_updated':
          this.emit('notification_updated', notification);
          break;
        case 'notification_count':
          this.emit('notification_count', { unread_count });
          break;
        case 'all_notifications_read':
          this.emit('all_notifications_read', { count: 0 });
          break;
        default:
          this.emit('message', data.message);
      }
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.shouldReconnect) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect().catch(console.error);
      }
    }, delay);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  send(command: string, data: any = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    const message = {
      command,
      identifier: JSON.stringify({
        channel: 'NotificationsChannel'
      }),
      data: JSON.stringify(data)
    };

    this.ws.send(JSON.stringify(message));
  }

  markAsRead(notificationId: number) {
    this.send('message', {
      action: 'mark_as_read',
      notification_id: notificationId
    });
  }

  markAllAsRead() {
    this.send('message', {
      action: 'mark_all_as_read'
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketClient = new WebSocketClient();
export default websocketClient;

