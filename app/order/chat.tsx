import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, FlashListRef } from "@shopify/flash-list";

import { ChatBubble, ChatInput, Message } from "@/components/tracking";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

export default function ChatScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const listRef = useRef<FlashListRef<Message>>(null);

    useEffect(() => {
        if (!orderId) return;
        getOrderTracking(orderId)
            .then(setTracking)
            .catch(() => setTracking(null));
    }, [orderId]);

    const handleSend = useCallback((text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: "current-user",
            content: text,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            type: "text",
            isMe: true,
        };
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleCallPress = () => {
        if (!orderId) return;
        router.push({ pathname: "/order/call", params: { orderId } });
    };

    const renderItem = useCallback(
        ({ item }: { item: Message }) => <ChatBubble message={item} />,
        [],
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-gray-100"
                >
                    <IconSymbol name="arrow-back" size={24} color="#212121" />
                </Pressable>
                <View className="flex-1 flex-row items-center gap-3 ml-2">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                        {tracking?.driver_avatar_url ? (
                            <Image
                                source={{ uri: tracking.driver_avatar_url }}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                                contentFit="cover"
                            />
                        ) : (
                            <IconSymbol name="person" size={20} color="#2563eb" />
                        )}
                    </View>
                    <View>
                        <Text className="font-bold text-text-primary">
                            {tracking?.driver_name ?? "Driver"}
                        </Text>
                        <Text className="text-sm text-green-500">
                            {tracking?.driver_id ? "Assigned" : "Waiting"}
                        </Text>
                    </View>
                </View>
                <Pressable
                    onPress={handleCallPress}
                    disabled={!tracking?.driver_id}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                        tracking?.driver_id ? "bg-primary-500" : "bg-gray-200"
                    }`}
                >
                    <IconSymbol name="phone" size={20} color="#ffffff" />
                </Pressable>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View className="flex-1 px-4 pt-4">
                    {messages.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Text className="text-text-secondary text-center">
                                No chat history yet.
                            </Text>
                        </View>
                    ) : (
                        <FlashList
                            ref={listRef}
                            data={messages}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
                <ChatInput onSend={handleSend} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
