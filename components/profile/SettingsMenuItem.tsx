import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { router, Href } from "expo-router";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";

interface SettingsMenuItemProps {
    readonly icon: IconSymbolName;
    readonly label: string;
    readonly href?: Href;
    readonly onPress?: () => void;
    readonly rightText?: string;
    readonly isDestructive?: boolean;
}

function SettingsMenuItemComponent({
    icon,
    label,
    href,
    onPress,
    rightText,
    isDestructive = false,
}: SettingsMenuItemProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (href) {
            router.push(href);
        }
    };

    const textColor = isDestructive ? "text-red-500" : "text-text-primary";
    const iconColor = isDestructive ? "#ef4444" : "#212121";

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center justify-between py-3 px-3 -mx-3 rounded-xl active:bg-gray-50"
        >
            <View className="flex-row items-center gap-4">
                <IconSymbol name={icon} size={24} color={iconColor} />
                <Text className={`font-semibold text-[15px] ${textColor}`}>
                    {label}
                </Text>
            </View>
            <View className="flex-row items-center gap-3">
                {rightText && (
                    <Text className="text-sm font-medium text-text-primary">
                        {rightText}
                    </Text>
                )}
                {!isDestructive && (
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color="#9e9e9e"
                    />
                )}
            </View>
        </Pressable>
    );
}

export const SettingsMenuItem = memo(SettingsMenuItemComponent);
