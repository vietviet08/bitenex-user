import React, { memo, useState, useCallback } from "react";
import { View, TextInput, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface ChatInputProps {
    readonly onSend: (message: string) => void;
    readonly placeholder?: string;
}

function ChatInputComponent({
    onSend,
    placeholder = "Type a message...",
}: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSend = useCallback(() => {
        if (message.trim()) {
            onSend(message.trim());
            setMessage("");
        }
    }, [message, onSend]);

    return (
        <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-100">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-[15px] text-text-primary max-h-24"
                    multiline
                    onSubmitEditing={handleSend}
                />
            </View>
            <Pressable
                onPress={handleSend}
                className={`w-11 h-11 rounded-full items-center justify-center ${message.trim()
                        ? "bg-primary-500 active:bg-primary-600"
                        : "bg-gray-200"
                    }`}
            >
                <IconSymbol
                    name="send"
                    size={20}
                    color={message.trim() ? "#ffffff" : "#9ca3af"}
                />
            </Pressable>
        </View>
    );
}

export const ChatInput = memo(ChatInputComponent);
