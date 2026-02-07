import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface ScreenHeaderProps {
    readonly title: string;
    readonly showBackButton?: boolean;
    readonly rightAction?: React.ReactNode;
}

function ScreenHeaderComponent({
    title,
    showBackButton = true,
    rightAction,
}: ScreenHeaderProps) {
    const handleBack = () => {
        router.back();
    };

    return (
        <View className="flex-row items-center justify-between px-4 py-4 bg-white">
            <View className="flex-row items-center gap-3">
                {showBackButton && (
                    <Pressable
                        onPress={handleBack}
                        className="p-2 -ml-2 rounded-full active:bg-gray-100"
                    >
                        <IconSymbol
                            name="arrow-back"
                            size={24}
                            color="#212121"
                        />
                    </Pressable>
                )}
                <Text className="text-xl font-bold text-text-primary">
                    {title}
                </Text>
            </View>
            {rightAction && <View>{rightAction}</View>}
        </View>
    );
}

export const ScreenHeader = memo(ScreenHeaderComponent);
