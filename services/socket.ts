/**
 * Socket.IO client for realtime communication
 * Handles order tracking, driver location updates, chat
 */

import { io, Socket } from 'socket.io-client';
import { tokenService } from './api';

// Environment config
const SOCKET_URL =
    process.env.EXPO_PUBLIC_WEBSOCKET_URL;

// Socket event types for type safety
export interface SocketEvents {
  // Connection
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;

  // Order events
  'order.created': (data: OrderEventData) => void;
  'order.updated': (data: OrderEventData) => void;
  'order.status_changed': (data: OrderStatusEventData) => void;

  // Driver tracking
  'driver.location_updated': (data: DriverLocationData) => void;
  'driver.assigned': (data: DriverAssignedData) => void;

  // Chat
  'chat.message': (data: ChatMessageData) => void;

  // Notifications
  'notification.new': (data: NotificationData) => void;
}

// Event data types
export interface OrderEventData {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface OrderStatusEventData {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface DriverLocationData {
  driverId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface DriverAssignedData {
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  estimatedArrival: string;
}

export interface ChatMessageData {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Socket client singleton
class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = await tokenService.getToken();

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupDefaultListeners();
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Manually disconnected');
    }
  }

  // Subscribe to events with type safety
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket?.on(event as string, callback as any);
  }

  // Unsubscribe from events
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (callback) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket?.off(event as string, callback as any);
    } else {
      this.socket?.off(event as string);
    }
  }

  // Emit events
  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  // Join a room (for order tracking)
  joinRoom(room: string): void {
    this.socket?.emit('join', { room });
  }

  // Leave a room
  leaveRoom(room: string): void {
    this.socket?.emit('leave', { room });
  }

  // Check connection status
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Get socket ID
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

export default socketClient;
