import { api } from "./api";

export interface ChatMessageItem {
    message_id: string;
    order_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type: string;
    timestamp: string;
}

export interface ChatMessageListResponse {
    items: ChatMessageItem[];
    total: number;
}

export async function getOrderChatMessages(
    orderId: string,
    params: {
        page?: number;
        per_page?: number;
    } = {},
): Promise<ChatMessageListResponse> {
    const response = await api.get<ChatMessageListResponse>(
        `/chat/orders/${orderId}/messages`,
        { params },
    );
    return response.data;
}
