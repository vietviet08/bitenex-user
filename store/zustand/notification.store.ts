import { create } from "zustand";

import { getNotifications } from "@/services/notification";

interface NotificationState {
    unreadCount: number;
    isLoading: boolean;
    setUnreadCount: (count: number) => void;
    refreshUnreadCount: () => Promise<void>;
    incrementUnread: () => void;
    decrementUnread: (count?: number) => void;
    clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    unreadCount: 0,
    isLoading: false,
    setUnreadCount: (count) =>
        set({
            unreadCount: Math.max(count, 0),
        }),

    refreshUnreadCount: async () => {
        if (get().isLoading) {
            return;
        }
        set({ isLoading: true });
        try {
            const response = await getNotifications({
                page: 1,
                per_page: 1,
            });
            get().setUnreadCount(response.unread_count);
        } catch {
            // Ignore fetch errors for badge state.
        } finally {
            set({ isLoading: false });
        }
    },

    incrementUnread: () =>
        set((state) => ({
            unreadCount: state.unreadCount + 1,
        })),

    decrementUnread: (count = 1) =>
        set((state) => ({
            unreadCount: Math.max(state.unreadCount - count, 0),
        })),

    clearUnread: () => set({ unreadCount: 0 }),
}));

export const useUnreadCount = () =>
    useNotificationStore((state) => state.unreadCount);
