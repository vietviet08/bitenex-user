import { api } from "./api";

export type ChatConversationType = "USER_DRIVER" | "MERCHANT_DRIVER";
export type ChatMessageType = "text" | "image";

export interface ChatMessage {
    id: string;
    order_id: string;
    conversation_type: ChatConversationType;
    sender_user_id: string;
    sender_role: "USER" | "DRIVER" | "MERCHANT" | "ADMIN";
    sender_name: string | null;
    sender_avatar_url: string | null;
    content: string;
    message_type: ChatMessageType;
    media_url: string | null;
    created_at: string;
}

export interface ChatMessageListResponse {
    items: ChatMessage[];
    total: number;
}

export async function getOrderChatMessages(
    orderId: string,
    conversationType: ChatConversationType,
): Promise<ChatMessageListResponse> {
    const response = await api.get<ChatMessageListResponse>(
        `/chats/orders/${orderId}/messages`,
        { params: { conversation_type: conversationType, page: 1, per_page: 100 } },
    );
    return response.data;
}

export async function sendOrderChatMessage(
    orderId: string,
    conversationType: ChatConversationType,
    content: string,
    options?: { messageType?: ChatMessageType; mediaUrl?: string | null },
): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(
        `/chats/orders/${orderId}/messages`,
        {
            conversation_type: conversationType,
            content,
            message_type: options?.messageType ?? "text",
            media_url: options?.mediaUrl ?? null,
        },
    );
    return response.data;
}
