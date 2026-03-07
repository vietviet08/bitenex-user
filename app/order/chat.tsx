import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { FlashList, FlashListRef } from "@shopify/flash-list";

import { ChatBubble, ChatInput, type Message } from "@/components/tracking";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/useAuth";
import { getOrderChatMessages, socketClient, type ChatMessageData } from "@/services";

function formatChatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatScreen() {
    const params = useLocalSearchParams<{ orderId?: string }>();
    const orderId =
        typeof params.orderId === "string" && params.orderId.trim()
            ? params.orderId.trim()
            : "";

    const { user } = useAuth();
    const listRef = useRef<FlashListRef<Message>>(null);
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState("");

    useEffect(() => {
        if (!orderId) {
            setIsLoadingHistory(false);
            return;
        }

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            setHistoryError("");
            try {
                const response = await getOrderChatMessages(orderId, {
                    page: 1,
                    per_page: 200,
                });
                setMessages((prev) => {
                    const merged = [...response.items, ...prev];
                    const byId = new Map<string, ChatMessageData>();
                    for (const item of merged) {
                        byId.set(item.message_id, item);
                    }
                    return Array.from(byId.values());
                });
            } catch (error) {
                setHistoryError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load chat history",
                );
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [orderId]);

    useEffect(() => {
        const onMessage = (payload: ChatMessageData) => {
            if (payload.order_id !== orderId) return;
            setMessages((prev) => {
                if (prev.some((item) => item.message_id === payload.message_id)) {
                    return prev;
                }
                return [...prev, payload];
            });
            setTimeout(() => {
                listRef.current?.scrollToEnd({ animated: true });
            }, 100);
        };

        socketClient.on("chat.message", onMessage);
        return () => {
            socketClient.off("chat.message", onMessage);
        };
    }, [orderId]);

    const uiMessages = useMemo<Message[]>(
        () =>
            [...messages]
                .sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                )
                .map((message) => ({
                    id: message.message_id,
                    senderId: message.sender_id,
                    content: message.content,
                    timestamp: formatChatTime(message.timestamp),
                    type: "text",
                    isMe: message.sender_id === user?.id,
                })),
        [messages, user?.id],
    );

    const handleSend = useCallback(
        (text: string) => {
            if (!orderId) return;
            socketClient.emit("chat.send", {
                order_id: orderId,
                content: text,
            });
        },
        [orderId],
    );

    const renderItem = useCallback(
        ({ item }: { item: Message }) => (
            <ChatBubble
                message={item}
                senderAvatar="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=120"
            />
        ),
        [],
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
            <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
                <Pressable
                    onPress={() => router.back()}
                    className="-ml-2 rounded-full p-2 active:bg-gray-100"
                >
                    <IconSymbol name="arrow-back" size={24} color="#212121" />
                </Pressable>
                <View className="ml-2 flex-1">
                    <Text className="font-bold text-text-primary">Merchant Chat</Text>
                    <Text className="text-xs text-text-secondary">
                        {orderId ? `Order ${orderId}` : "Order chat"}
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View className="flex-1 px-4 pt-4">
                    <FlashList
                        ref={listRef}
                        data={uiMessages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            isLoadingHistory ? (
                                <View className="items-center py-6">
                                    <ActivityIndicator color="#2563EB" />
                                </View>
                            ) : historyError ? (
                                <View className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <Text className="text-sm text-red-600">
                                        {historyError}
                                    </Text>
                                </View>
                            ) : (
                                <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <Text className="text-sm text-neutral-500">
                                        Start chat with merchant for this order.
                                    </Text>
                                </View>
                            )
                        }
                    />
                </View>
                <ChatInput onSend={handleSend} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
