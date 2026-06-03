import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
    uploadFile,
} from "@/services";

const QUICK_REPLIES = [
    "Tôi đang ra nhận",
    "Gọi tôi khi tới",
    "Bạn tới đâu rồi?",
];

function toBubble(message: ChatMessage): Message {
    return {
        id: message.id,
        senderId: message.sender_user_id,
        content: message.message_type === "image" ? message.media_url ?? message.content : message.content,
        timestamp: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        type: message.message_type,
        isMe: message.sender_role === "USER",
    };
}

export default function ChatScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
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
        const room = `chat:${orderId}`;

        const handleMessage = (message: ChatMessage) => {
            if (message.order_id !== orderId || message.conversation_type !== "USER_DRIVER") return;
            appendMessage(message);
        };

        const handleConnect = () => {
            socketClient.joinRoom(room);
            void loadChat();
        };

        const subscribe = async () => {
            await socketClient.connect();
            if (!isMounted) return;
            socketClient.joinRoom(room);
            socketClient.on("connect", handleConnect);
            socketClient.on("chat.message", handleMessage);
        };

        void subscribe();

        return () => {
            isMounted = false;
            socketClient.off("connect", handleConnect);
            socketClient.off("chat.message", handleMessage);
            socketClient.leaveRoom(room);
        };
    }, [appendMessage, loadChat, orderId]);

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

    const handlePickImage = useCallback(async () => {
        if (!orderId || isSending || isUploadingImage || !tracking?.driver_id) return;

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
        });

        if (result.canceled || !result.assets[0]?.uri) return;

        setIsUploadingImage(true);
        try {
            const imageUrl = await uploadFile(result.assets[0].uri, "chat");
            appendMessage(
                await sendOrderChatMessage(orderId, "USER_DRIVER", "", {
                    messageType: "image",
                    mediaUrl: imageUrl,
                }),
            );
        } finally {
            setIsUploadingImage(false);
        }
    }, [appendMessage, isSending, isUploadingImage, orderId, tracking?.driver_id]);

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
                    <View className="px-4 pb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {QUICK_REPLIES.map((reply) => (
                                <Pressable
                                    key={reply}
                                    onPress={() => handleSend(reply)}
                                    disabled={isSending || isUploadingImage || !tracking?.driver_id}
                                    className="px-3 py-2 rounded-full bg-orange-50 border border-orange-100 active:bg-orange-100"
                                >
                                    <Text className="text-primary-600 text-sm font-medium">{reply}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                    <ChatInput
                        onSend={handleSend}
                        onPickImage={handlePickImage}
                        placeholder={isSending || isUploadingImage ? "Đang gửi..." : "Nhập tin nhắn..."}
                        disabled={isSending || isUploadingImage || !tracking?.driver_id}
                        isUploading={isUploadingImage}
                    />
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}
