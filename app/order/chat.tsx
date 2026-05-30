import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, FlashListRef } from "@shopify/flash-list";

import { ChatBubble, type Message } from "@/components/tracking/ChatBubble";
import { ChatInput } from "@/components/tracking/ChatInput";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    getOrderChatMessages,
    getOrderTracking,
    sendOrderChatMessage,
    socketClient,
    type ChatMessage,
    type OrderTrackingResponse,
} from "@/services";

function toBubble(message: ChatMessage): Message {
    return {
        id: message.id,
        senderId: message.sender_user_id,
        content: message.content,
        timestamp: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        type: "text",
        isMe: message.sender_role === "USER",
    };
}

export default function ChatScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const listRef = useRef<FlashListRef<Message>>(null);

    const appendMessage = useCallback((message: ChatMessage) => {
        setMessages((current) => {
            if (current.some((item) => item.id === message.id)) return current;
            return [...current, message];
        });
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    const loadChat = useCallback(async () => {
        if (!orderId) {
            setIsLoading(false);
            return;
        }
        try {
            const [trackingResult, chatResult] = await Promise.all([
                getOrderTracking(orderId),
                getOrderChatMessages(orderId, "USER_DRIVER"),
            ]);
            setTracking(trackingResult);
            setMessages(chatResult.items);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        loadChat();
    }, [loadChat]);

    useEffect(() => {
        if (!orderId) return;
        let isMounted = true;

        const handleMessage = (message: ChatMessage) => {
            if (message.order_id !== orderId || message.conversation_type !== "USER_DRIVER") return;
            appendMessage(message);
        };

        const subscribe = async () => {
            await socketClient.connect();
            if (!isMounted) return;
            socketClient.on("chat.message", handleMessage);
        };

        void subscribe();

        return () => {
            isMounted = false;
            socketClient.off("chat.message", handleMessage);
        };
    }, [appendMessage, orderId]);

    const bubbleData = useMemo(() => messages.map(toBubble), [messages]);

    const handleSend = useCallback(async (text: string) => {
        if (!orderId || isSending) return;
        setIsSending(true);
        try {
            appendMessage(await sendOrderChatMessage(orderId, "USER_DRIVER", text));
        } finally {
            setIsSending(false);
        }
    }, [appendMessage, isSending, orderId]);

    const renderItem = useCallback(
        ({ item }: { item: Message }) => <ChatBubble message={item} />,
        [],
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <IconSymbol name="arrow-back" size={24} color="#212121" />
                </Pressable>
                <View className="flex-1 flex-row items-center gap-3 ml-2">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                        {tracking?.driver_avatar_url ? (
                            <Image source={{ uri: tracking.driver_avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
                        ) : (
                            <IconSymbol name="person" size={20} color="#2563eb" />
                        )}
                    </View>
                    <View>
                        <Text className="font-bold text-text-primary">{tracking?.driver_name ?? "Tài xế"}</Text>
                        <Text className="text-sm text-green-500">{tracking?.driver_id ? "Đã nhận đơn" : "Đang chờ"}</Text>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            ) : (
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={0}
                >
                    <View className="flex-1 px-4 pt-4">
                        {bubbleData.length === 0 ? (
                            <View className="flex-1 items-center justify-center px-6">
                                <Text className="text-text-secondary text-center">Chưa có tin nhắn.</Text>
                            </View>
                        ) : (
                            <FlashList
                                ref={listRef}
                                data={bubbleData}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                    <ChatInput
                        onSend={handleSend}
                        placeholder={isSending ? "Đang gửi..." : "Nhập tin nhắn..."}
                        disabled={isSending || !tracking?.driver_id}
                    />
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}
