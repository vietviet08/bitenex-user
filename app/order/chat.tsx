import React, { useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { ChatBubble, ChatInput, Message, Driver } from "@/components/tracking";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Mock data - API ready interfaces
const MOCK_DRIVER: Driver = {
    id: "driver-1",
    name: "John Smith",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    totalDeliveries: 156,
    phone: "+84 912 345 678",
    vehicle: {
        type: "Motorcycle",
        model: "Honda Wave",
        plate: "59H1-12345",
        color: "Red",
    },
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        senderId: "driver-1",
        content: "Hi! I'm on my way to pick up your order.",
        timestamp: "10:30 AM",
        type: "text",
        isMe: false,
    },
    {
        id: "2",
        senderId: "user-1",
        content: "Great! How long will it take?",
        timestamp: "10:31 AM",
        type: "text",
        isMe: true,
    },
    {
        id: "3",
        senderId: "driver-1",
        content:
            "About 15 minutes. I'll let you know when I'm at the restaurant.",
        timestamp: "10:32 AM",
        type: "text",
        isMe: false,
    },
];

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const listRef = useRef<FlashListRef<Message>>(null);

    const handleSend = useCallback((text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: "user-1",
            content: text,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            type: "text",
            isMe: true,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Scroll to bottom
        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleCallPress = () => {
        router.push("/order/call");
    };

    const renderItem = useCallback(
        ({ item }: { item: Message }) => (
            <ChatBubble message={item} senderAvatar={MOCK_DRIVER.avatarUrl} />
        ),
        [],
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Pressable
                    onPress={() => router.back()}
                    className="p-2 -ml-2 rounded-full active:bg-gray-100"
                >
                    <IconSymbol name="arrow-back" size={24} color="#212121" />
                </Pressable>
                <View className="flex-1 flex-row items-center gap-3 ml-2">
                    <Image
                        source={{ uri: MOCK_DRIVER.avatarUrl }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="cover"
                    />
                    <View>
                        <Text className="font-bold text-text-primary">
                            {MOCK_DRIVER.name}
                        </Text>
                        <Text className="text-sm text-green-500">Online</Text>
                    </View>
                </View>
                <Pressable
                    onPress={handleCallPress}
                    className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center active:bg-primary-600"
                >
                    <IconSymbol name="phone" size={20} color="#ffffff" />
                </Pressable>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View className="flex-1 px-4 pt-4">
                    <FlashList
                        ref={listRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                <ChatInput onSend={handleSend} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
