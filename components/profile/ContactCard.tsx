import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";

interface ContactCardProps {
    readonly icon: IconSymbolName;
    readonly title: string;
    readonly subtitle?: string;
    readonly onPress?: () => void;
}

function ContactCardComponent({
    icon,
    title,
    subtitle,
    onPress,
}: ContactCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl active:bg-gray-100"
        >
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                <IconSymbol name={icon} size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
                <Text className="font-semibold text-[15px] text-text-primary">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-sm text-text-secondary mt-0.5">
                        {subtitle}
                    </Text>
                )}
            </View>
            <IconSymbol name="chevron-right" size={20} color="#9e9e9e" />
        </Pressable>
    );
}

export const ContactCard = memo(ContactCardComponent);
