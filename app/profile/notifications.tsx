import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/profile";
import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    socketClient,
    type NotificationItem,
} from "@/services";
import { useNotificationStore } from "@/store/zustand/notification.store";

function formatDate(value: string): string {
    return new Date(value).toLocaleString();
}

export default function NotificationsScreen() {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
    const decrementUnread = useNotificationStore((state) => state.decrementUnread);

    const fetchHistory = useCallback(async (silent = false) => {
        if (silent) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setErrorMessage("");
        try {
            const response = await getNotifications({
                page: 1,
                per_page: 100,
            });
            setItems(response.items);
            setUnreadCount(response.unread_count);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load notifications",
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [setUnreadCount]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        const onRealtimeNotification = (payload: NotificationItem) => {
            setItems((prev) => [payload, ...prev]);
        };

        socketClient.on("notification.new", onRealtimeNotification);
        return () => {
            socketClient.off("notification.new", onRealtimeNotification);
        };
    }, []);

    const openNotification = async (item: NotificationItem) => {
        if (!item.is_read) {
            try {
                await markNotificationAsRead(item.id);
                setItems((prev) =>
                    prev.map((entry) =>
                        entry.id === item.id ? { ...entry, is_read: true } : entry,
                    ),
                );
                decrementUnread(1);
            } catch {}
        }

        const orderId =
            typeof item.data?.order_id === "string" ? item.data.order_id : null;
        if (orderId) {
            router.push({
                pathname: "/order/tracking",
                params: { orderId },
            });
        }
    };

    const markAllRead = async () => {
        setIsMarkingAll(true);
        try {
            await markAllNotificationsAsRead();
            setItems((prev) => prev.map((entry) => ({ ...entry, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to mark all as read",
            );
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader
                title="Notification"
                rightAction={
                    <Pressable
                        onPress={markAllRead}
                        disabled={isMarkingAll || unreadCount === 0}
                        className={`rounded-lg border border-neutral-300 px-3 py-1.5 ${
                            isMarkingAll || unreadCount === 0 ? "opacity-50" : ""
                        }`}
                    >
                        <Text className="text-xs font-semibold text-neutral-700">
                            Read all
                        </Text>
                    </Pressable>
                }
            />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#2563EB" />
                </View>
            ) : null}

            {!isLoading && errorMessage ? (
                <View className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <Text className="text-sm text-red-600">{errorMessage}</Text>
                </View>
            ) : null}

            {!isLoading && !errorMessage ? (
                <FlashList
                    data={items}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => fetchHistory(true)}
                        />
                    }
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    ListEmptyComponent={
                        <View className="rounded-xl border border-neutral-200 bg-white p-4">
                            <Text className="text-sm text-neutral-500">
                                No notifications yet.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => openNotification(item)}
                            className={`mb-3 rounded-xl border p-4 ${
                                item.is_read
                                    ? "border-neutral-200 bg-white"
                                    : "border-primary-200 bg-primary-50"
                            }`}
                        >
                            <Text className="text-sm font-semibold text-neutral-900">
                                {item.title}
                            </Text>
                            <Text className="mt-1 text-sm text-neutral-600">
                                {item.body}
                            </Text>
                            <Text className="mt-2 text-xs text-neutral-500">
                                {formatDate(item.created_at)}
                            </Text>
                        </Pressable>
                    )}
                />
            ) : null}
        </SafeAreaView>
    );
}
