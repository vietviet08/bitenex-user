import { io, Socket } from 'socket.io-client';
import { getFreshAccessToken } from './authTokens';

const SOCKET_URL =
    process.env.EXPO_PUBLIC_SOCKET_URL ?? process.env.EXPO_PUBLIC_WEBSOCKET_URL;

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
  'call.invited': (data: CallEventData) => void;
  'call.accepted': (data: CallEventData) => void;
  'call.rejected': (data: CallEventData) => void;
  'call.ended': (data: CallEventData) => void;
  'call.missed': (data: CallEventData) => void;

  'notification.new': (data: NotificationData) => void;
}

export interface OrderEventData {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface OrderStatusEventData {
  orderId?: string;
  order_id?: string;
  previousStatus?: string;
  newStatus?: string;
  status?: string;
  timestamp: string;
}

export interface DriverLocationData {
  driverId?: string;
  driver_id?: string;
  orderId?: string;
  order_id?: string;
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
  id: string;
  order_id: string;
  conversation_type: 'USER_DRIVER' | 'MERCHANT_DRIVER';
  sender_user_id: string;
  sender_role: 'USER' | 'DRIVER' | 'MERCHANT' | 'ADMIN';
  sender_name: string | null;
  sender_avatar_url: string | null;
  content: string;
  message_type: 'text';
  created_at: string;
}

export interface CallEventData {
  id: string;
  order_id: string;
  caller_user_id: string;
  callee_user_id: string;
  caller_role: 'USER' | 'DRIVER';
  callee_role: 'USER' | 'DRIVER';
  channel_name: string;
  status: 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'ENDED' | 'MISSED';
  started_at: string;
  accepted_at: string | null;
  ended_at: string | null;
  expires_at: string;
  ended_by: string | null;
  end_reason: string | null;
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
  private connectPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private didRetryWithFreshToken = false;
  private activeRooms = new Set<string>();
  private readonly maxReconnectAttempts = 8;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    if (this.socket && !this.socket.connected && !this.connectPromise) {
      this.socket.connect();
      return;
    }

    if (this.socket && this.connectPromise) {
      return this.connectPromise;
    }

    if (!SOCKET_URL) {
      console.warn('[Socket] WebSocket URL not configured, skipping connection');
      return;
    }

    const token = await getFreshAccessToken();
    
    if (!token) {
      console.warn('[Socket] No token available, skipping connection');
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      this.setupDefaultListeners();

      this.connectPromise = new Promise((resolve, reject) => {
        const socket = this.socket;
        if (!socket) {
          resolve();
          return;
        }

        const cleanup = () => {
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleConnectError);
        };

        const handleConnect = () => {
          cleanup();
          this.connectPromise = null;
          resolve();
        };

        const handleConnectError = (error: Error) => {
          cleanup();
          this.connectPromise = null;
          reject(error);
        };

        socket.once('connect', handleConnect);
        socket.once('connect_error', handleConnectError);
        socket.connect();
      });

      await this.connectPromise;
    } catch (error) {
      this.connectPromise = null;
      console.warn(
        '[Socket] Failed to initialize connection:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.didRetryWithFreshToken = false;
      this.rejoinActiveRooms();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      if (this.reconnectAttempts === 0) {
        console.warn('[Socket] Connection error (server may not support Socket.IO):', error.message);
      }
      this.reconnectAttempts++;
      if (!this.didRetryWithFreshToken) {
        this.didRetryWithFreshToken = true;
        void this.reconnectWithFreshToken();
      }
    });

    this.socket.on('chat.message', (data) => {
      console.log('[Socket] chat.message received:', data);
    });
  }

  private async reconnectWithFreshToken(): Promise<void> {
    const freshToken = await getFreshAccessToken();
    if (!freshToken || !this.socket) return;

    this.socket.auth = { token: freshToken };
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectPromise = null;
      this.activeRooms.clear();
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
    this.activeRooms.add(room);
    if (this.socket?.connected) {
      this.socket.emit('join', { room });
    }
  }

  leaveRoom(room: string): void {
    this.activeRooms.delete(room);
    if (this.socket?.connected) {
      this.socket.emit('leave', { room });
    }
  }

  private rejoinActiveRooms(): void {
    if (!this.socket?.connected) return;
    for (const room of this.activeRooms) {
      this.socket.emit('join', { room });
    }
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
