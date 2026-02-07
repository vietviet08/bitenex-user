import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";

interface EmptyOrdersStateProps {
    readonly tabType: "active" | "completed" | "cancelled";
}

const MESSAGES = {
    active: {
        title: "No Active Orders",
        description:
            "You don't have any active orders right now. Order something delicious!",
    },
    completed: {
        title: "No Completed Orders",
        description:
            "You haven't completed any orders yet. Start ordering to see them here!",
    },
    cancelled: {
        title: "No Cancelled Orders",
        description:
            "You don't have any cancelled orders. That's a good thing!",
    },
};

function EmptyOrdersStateComponent({ tabType }: EmptyOrdersStateProps) {
    const message = MESSAGES[tabType];

    const handleBrowseRestaurants = () => {
        router.push("/(tabs)");
    };

    return (
        <View className="flex-1 items-center justify-center px-8 py-16">
            {/* Illustration - Stacked cards */}
            <View className="relative mb-8">
                <View className="w-24 h-28 bg-gray-200 rounded-2xl absolute -left-4 -top-2 transform -rotate-6" />
                <View className="w-24 h-28 bg-gray-300 rounded-2xl absolute -right-4 -top-2 transform rotate-6" />
                <View className="w-28 h-32 bg-primary-500/20 rounded-2xl items-center justify-center z-10">
                    <IconSymbol name="receipt-long" size={48} color="#1AB65C" />
                </View>
            </View>

            <Text className="text-xl font-bold text-text-primary text-center mb-2">
                {message.title}
            </Text>
            <Text className="text-base text-text-secondary text-center mb-8">
                {message.description}
            </Text>

            {/* Floating Action Button */}
            <Pressable
                onPress={handleBrowseRestaurants}
                className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center shadow-lg active:scale-95"
            >
                <IconSymbol name="add" size={32} color="white" />
            </Pressable>
        </View>
    );
}

export const EmptyOrdersState = memo(EmptyOrdersStateComponent);
