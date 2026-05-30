import React, { memo, useState, useCallback } from "react";
import { View, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface ChatInputProps {
    readonly onSend: (message: string) => void;
    readonly placeholder?: string;
    readonly disabled?: boolean;
}

function ChatInputComponent({
    onSend,
    placeholder = "Type a message...",
    disabled = false,
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const insets = useSafeAreaInsets();

    const handleSend = useCallback(() => {
        if (!disabled && message.trim()) {
            onSend(message.trim());
            setMessage("");
        }
    }, [disabled, message, onSend]);

    return (
        <View
            className="flex-row items-center gap-2 px-4 pt-3 bg-white border-t border-gray-100"
            style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-2 min-h-11">
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-[15px] text-text-primary max-h-24 py-0"
                    multiline
                    onSubmitEditing={handleSend}
                    editable={!disabled}
                    textAlignVertical="center"
                />
            </View>
            <Pressable
                onPress={handleSend}
                disabled={disabled || !message.trim()}
                className={`w-11 h-11 rounded-full items-center justify-center ${message.trim() && !disabled
                        ? "bg-primary-500 active:bg-primary-600"
                        : "bg-gray-200"
                    }`}
            >
                <IconSymbol
                    name="send"
                    size={20}
                    color={message.trim() && !disabled ? "#ffffff" : "#9ca3af"}
                />
            </Pressable>
        </View>
    );
}

export const ChatInput = memo(ChatInputComponent);
