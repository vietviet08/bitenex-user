import { tokenService } from "./tokenService";

const SOCKET_URL =
    process.env.EXPO_PUBLIC_WEBSOCKET_URL;

export interface SocketEvents {
    connect: () => void;
    disconnect: (reason: string) => void;
    connect_error: (error: Error) => void;
    error: (data: { code?: string; message?: string }) => void;
    pong: (data: { timestamp: string }) => void;

    "order.status_changed": (data: OrderStatusEventData) => void;
    "chat.message": (data: ChatMessageData) => void;
    "chat.typing": (data: ChatTypingData) => void;
    "notification.new": (data: NotificationData) => void;
}

export interface OrderStatusEventData {
    order_id: string;
    order_number?: string;
    previous_status: string | null;
    new_status: string;
    merchant_id?: string;
    user_id?: string;
    reason?: string | null;
    updated_at: string;
}

export interface ChatMessageData {
    message_id: string;
    order_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type?: string;
    timestamp: string;
}

export interface ChatTypingData {
    order_id: string;
    sender_id: string;
    receiver_id: string;
    is_typing: boolean;
    timestamp: string;
}

export interface NotificationData {
    id: string;
    user_id: string;
    type: string;
    channel: string;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    is_read: boolean;
    is_sent: boolean;
    created_at: string;
    updated_at: string;
}

class SocketClient {
    private socket: WebSocket | null = null;
    private listeners = new Map<string, Set<(payload: unknown) => void>>();
    private isConnecting = false;
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private manuallyClosed = false;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelayMs = 2000;

    private emitLocal(event: string, payload?: unknown): void {
        const handlers = this.listeners.get(event);
        if (!handlers || handlers.size === 0) return;
        handlers.forEach((handler) => {
            try {
                handler(payload);
            } catch (error) {
                console.warn(`[Socket] Listener failed for ${event}:`, error);
            }
        });
    }

    private buildSocketUrl(token: string): string {
        let normalized = SOCKET_URL || "";
        if (!normalized.includes("/ws")) {
            normalized = `${normalized.replace(/\/$/, "")}/api/v1/ws`;
        }
        const separator = normalized.includes("?") ? "&" : "?";
        return `${normalized}${separator}token=${encodeURIComponent(token)}`;
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private scheduleReconnect(): void {
        if (this.manuallyClosed) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn("[Socket] Max reconnection attempts reached");
            return;
        }

        this.reconnectAttempts += 1;
        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, this.reconnectDelayMs);
    }

    private handleMessage(raw: string): void {
        try {
            const parsed = JSON.parse(raw) as {
                event?: string;
                data?: unknown;
            };
            if (!parsed?.event) return;
            this.emitLocal(parsed.event, parsed.data);
        } catch (error) {
            console.warn("[Socket] Failed to parse message:", error);
        }
    }

    async connect(): Promise<void> {
        if (this.isConnected || this.isConnecting) {
            return;
        }

        if (!SOCKET_URL) {
            console.warn("[Socket] WebSocket URL not configured, skipping connection");
            return;
        }

        const token = await tokenService.getToken();
        if (!token) {
            return;
        }

        try {
            this.manuallyClosed = false;
            this.isConnecting = true;
            const ws = new WebSocket(this.buildSocketUrl(token));

            ws.onopen = () => {
                this.socket = ws;
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.clearReconnectTimer();
                this.emitLocal("connect");
            };

            ws.onmessage = (event) => {
                if (typeof event.data === "string") {
                    this.handleMessage(event.data);
                }
            };

            ws.onerror = () => {
                this.isConnecting = false;
                this.emitLocal("connect_error", new Error("WebSocket connection error"));
            };

            ws.onclose = (event) => {
                this.socket = null;
                this.isConnecting = false;
                const reason = event.reason || "connection_closed";
                this.emitLocal("disconnect", reason);
                this.scheduleReconnect();
            };
        } catch (error) {
            this.isConnecting = false;
            console.error("[Socket] Failed to initialize connection:", error);
        }
    }

    disconnect(): void {
        this.manuallyClosed = true;
        this.isConnecting = false;
        this.clearReconnectTimer();
        if (!this.socket) return;
        this.socket.close();
        this.socket = null;
        this.emitLocal("disconnect", "manual_disconnect");
    }

    on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
        const key = event as string;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)?.add(callback as (payload: unknown) => void);
    }

    off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
        const key = event as string;
        const handlers = this.listeners.get(key);
        if (!handlers) return;

        if (callback) {
            handlers.delete(callback as (payload: unknown) => void);
        } else {
            handlers.clear();
        }

        if (handlers.size === 0) {
            this.listeners.delete(key);
        }
    }

    emit(event: string, data?: unknown): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        this.socket.send(
            JSON.stringify({
                event,
                data: data ?? {},
            }),
        );
    }

    joinRoom(room: string): void {
        this.emit("join", { room });
    }

    leaveRoom(room: string): void {
        this.emit("leave", { room });
    }

    get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    get socketId(): string | undefined {
        return undefined;
    }
}

export const socketClient = new SocketClient();

export default socketClient;
