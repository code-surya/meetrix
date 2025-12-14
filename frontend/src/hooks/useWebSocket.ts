import { useEffect, useState, useCallback, useRef } from 'react';
import websocketClient from '@/services/websocket/websocketClient';

interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

export const useWebSocket = (autoConnect: boolean = true): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      callbacksRef.current.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          websocketClient.off(event, callback);
        });
      });
      callbacksRef.current.clear();
    };
  }, [autoConnect]);

  const connect = useCallback(async () => {
    try {
      await websocketClient.connect();
      setIsConnected(true);

      // Listen for connection status changes
      websocketClient.on('connected', () => setIsConnected(true));
      websocketClient.on('disconnected', () => setIsConnected(false));
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketClient.disconnect();
    setIsConnected(false);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!callbacksRef.current.has(event)) {
      callbacksRef.current.set(event, new Set());
    }
    callbacksRef.current.get(event)!.add(callback);
    websocketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    callbacksRef.current.get(event)?.delete(callback);
    websocketClient.off(event, callback);
  }, []);

  // Update connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsConnected(websocketClient.isConnected());
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
  };
};

