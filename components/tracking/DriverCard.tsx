import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";

export interface Driver {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
    totalDeliveries: number;
    phone: string;
    vehicle: {
        type: string;
        model: string;
        plate: string;
        color: string;
    };
}

interface DriverCardProps {
    readonly driver: Driver;
    readonly variant?: "compact" | "expanded";
    readonly onChatPress?: () => void;
    readonly onCallPress?: () => void;
    readonly onProfilePress?: () => void;
}

function DriverCardComponent({
    driver,
    variant = "compact",
    onChatPress,
    onCallPress,
    onProfilePress,
}: DriverCardProps) {
    if (variant === "expanded") {
        return (
            <View className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Avatar and basic info */}
                <View className="items-center mb-6">
                    <Image
                        source={{ uri: driver.avatarUrl }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                        contentFit="cover"
                    />
                    <Text className="text-xl font-bold text-text-primary mt-4">
                        {driver.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol name="star" size={18} color="#f59e0b" />
                        <Text className="font-semibold text-text-primary">
                            {driver.rating.toFixed(1)}
                        </Text>
                        <Text className="text-text-secondary">
                            • {driver.totalDeliveries} deliveries
                        </Text>
                    </View>
                </View>

                {/* Vehicle info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-sm font-semibold text-text-secondary mb-2">
                        Vehicle
                    </Text>
                    <Text className="font-bold text-text-primary">
                        {driver.vehicle.color} {driver.vehicle.model}
                    </Text>
                    <Text className="text-text-secondary">
                        {driver.vehicle.type} • {driver.vehicle.plate}
                    </Text>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={onChatPress}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 rounded-xl py-3 active:bg-gray-200"
                    >
                        <IconSymbol name="chat" size={20} color="#212121" />
                        <Text className="font-semibold text-text-primary">Chat</Text>
                    </Pressable>
                    <Pressable
                        onPress={onCallPress}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-primary-500 rounded-xl py-3 active:bg-primary-600"
                    >
                        <IconSymbol name="phone" size={20} color="#ffffff" />
                        <Text className="font-semibold text-white">Call</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <Pressable
            onPress={onProfilePress}
            className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-4"
        >
            <Image
                source={{ uri: driver.avatarUrl }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
                contentFit="cover"
            />
            <View className="flex-1">
                <Text className="font-bold text-base text-text-primary">
                    {driver.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                    <View className="flex-row items-center gap-1">
                        <IconSymbol name="star" size={14} color="#f59e0b" />
                        <Text className="text-sm font-medium text-text-primary">
                            {driver.rating.toFixed(1)}
                        </Text>
                    </View>
                    <Text className="text-sm text-text-secondary">
                        {driver.vehicle.plate}
                    </Text>
                </View>
            </View>
            <View className="flex-row gap-2">
                <Pressable
                    onPress={onChatPress}
                    className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                    <IconSymbol name="chat" size={20} color="#22c55e" />
                </Pressable>
                <Pressable
                    onPress={onCallPress}
                    className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center active:bg-primary-600"
                >
                    <IconSymbol name="phone" size={20} color="#ffffff" />
                </Pressable>
            </View>
        </Pressable>
    );
}

export const DriverCard = memo(DriverCardComponent);
