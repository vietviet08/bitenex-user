import React, { memo } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    type: "text" | "image" | "location";
    isMe: boolean;
}

interface ChatBubbleProps {
    readonly message: Message;
    readonly senderAvatar?: string;
}

function ChatBubbleComponent({ message, senderAvatar }: ChatBubbleProps) {
    const isMe = message.isMe;

    return (
        <View
            className={`flex-row gap-2 mb-3 ${isMe ? "flex-row-reverse" : ""}`}
        >
            {!isMe && senderAvatar && (
                <Image
                    source={{ uri: senderAvatar }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    contentFit="cover"
                />
            )}
            <View
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe
                        ? "bg-primary-500 rounded-tr-sm"
                        : "bg-gray-100 rounded-tl-sm"
                    }`}
            >
                {message.type === "text" && (
                    <Text
                        className={`text-[15px] leading-5 ${isMe ? "text-white" : "text-text-primary"
                            }`}
                    >
                        {message.content}
                    </Text>
                )}
                {message.type === "image" && (
                    <Image
                        source={{ uri: message.content }}
                        style={{ width: 200, height: 150, borderRadius: 8 }}
                        contentFit="cover"
                    />
                )}
                <Text
                    className={`text-xs mt-1 ${isMe ? "text-white/70" : "text-text-secondary"
                        }`}
                >
                    {message.timestamp}
                </Text>
            </View>
        </View>
    );
}

export const ChatBubble = memo(ChatBubbleComponent);
