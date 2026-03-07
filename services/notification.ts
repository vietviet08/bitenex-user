import { api } from "./api";

export interface NotificationItem {
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

export interface NotificationListResponse {
    items: NotificationItem[];
    total: number;
    unread_count: number;
}

export async function getNotifications(params?: {
    unread_only?: boolean;
    page?: number;
    per_page?: number;
}): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>("/notifications", {
        params,
    });
    return response.data;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await api.post("/notifications/read-all");
}
