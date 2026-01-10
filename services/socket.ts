import { io, Socket } from 'socket.io-client';
import { tokenService } from './tokenService';

const SOCKET_URL =
    process.env.EXPO_PUBLIC_WEBSOCKET_URL;

export interface SocketEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;

  'order.created': (data: OrderEventData) => void;
  'order.updated': (data: OrderEventData) => void;
  'order.status_changed': (data: OrderStatusEventData) => void;

  'driver.location_updated': (data: DriverLocationData) => void;
  'driver.assigned': (data: DriverAssignedData) => void;

  'chat.message': (data: ChatMessageData) => void;

  'notification.new': (data: NotificationData) => void;
}

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

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    if (!SOCKET_URL) {
      console.warn('[Socket] WebSocket URL not configured, skipping connection');
      return;
    }

    const token = await tokenService.getToken();
    
    if (!token) {
      console.warn('[Socket] No token available, skipping connection');
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: true,
        reconnection: false,
        reconnectionAttempts: 0,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 5000,
      });

      this.setupDefaultListeners();
    } catch (error) {
      console.error('[Socket] Failed to initialize connection:', error);
    }
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
      if (this.reconnectAttempts === 0) {
        console.warn('[Socket] Connection error (server may not support Socket.IO):', error.message);
      }
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[Socket] Max reconnection attempts reached, giving up');
        this.disconnect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Manually disconnected');
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    this.socket?.on(event as string, callback as any);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (callback) {
      this.socket?.off(event as string, callback as any);
    } else {
      this.socket?.off(event as string);
    }
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  joinRoom(room: string): void {
    this.socket?.emit('join', { room });
  }

  leaveRoom(room: string): void {
    this.socket?.emit('leave', { room });
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketClient = new SocketClient();

export default socketClient;
