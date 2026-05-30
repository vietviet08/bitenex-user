import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

function formatRating(rating?: number | null): string {
    if (typeof rating !== "number" || rating <= 0) return "Chưa có";
    return rating.toFixed(1);
}

export default function DriverProfileScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadTracking = useCallback(async () => {
        if (!orderId) {
            setIsLoading(false);
            return;
        }

        try {
            setTracking(await getOrderTracking(orderId));
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        loadTracking();
    }, [loadTracking]);

    const openChat = () => {
        if (!orderId) return;
        router.push({ pathname: "/order/chat", params: { orderId } });
    };

    const openCall = () => {
        if (!orderId) return;
        router.push({ pathname: "/order/call", params: { orderId } });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Driver Profile" />
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
                        <View className="flex-row items-center gap-4">
                            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
                                <IconSymbol name="person" size={30} color="#2563eb" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-text-primary">
                                    {tracking?.driver_name ?? "Đang chờ tài xế"}
                                </Text>
                                <Text className="text-sm text-text-secondary mt-1">
                                    {tracking?.driver_id
                                        ? "Tài xế thật được gán cho đơn hàng này"
                                        : "Chưa có tài xế nhận đơn"}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row gap-3 mt-5">
                            <Pressable
                                onPress={openChat}
                                disabled={!tracking?.driver_id}
                                className={`flex-1 py-3 rounded-xl items-center ${
                                    tracking?.driver_id ? "bg-primary-500" : "bg-gray-200"
                                }`}
                            >
                                <Text className={tracking?.driver_id ? "text-white font-semibold" : "text-text-secondary font-semibold"}>
                                    Chat
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={openCall}
                                disabled={!tracking?.driver_id}
                                className={`flex-1 py-3 rounded-xl items-center ${
                                    tracking?.driver_id ? "bg-primary-500/10" : "bg-gray-200"
                                }`}
                            >
                                <Text className="text-primary-500 font-semibold">Call</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-row px-4 mt-4 gap-3">
                        <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
                            <Text className="text-2xl font-bold text-primary-500">
                                {formatRating(tracking?.driver_average_rating)}
                            </Text>
                            <Text className="text-sm text-text-secondary">Rating</Text>
                        </View>
                        <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
                            <Text className="text-2xl font-bold text-primary-500">
                                {tracking?.driver_total_deliveries ?? 0}
                            </Text>
                            <Text className="text-sm text-text-secondary">Deliveries</Text>
                        </View>
                    </View>

                    <View className="bg-white mx-4 mt-4 mb-6 p-4 rounded-2xl shadow-sm">
                        <Text className="font-bold text-lg text-text-primary mb-2">
                            Current Order
                        </Text>
                        <Text className="text-text-secondary">
                            {tracking?.order_number ?? orderId ?? "Unknown order"}
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
