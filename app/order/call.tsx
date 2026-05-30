import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

export default function CallScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);

    useEffect(() => {
        if (!orderId) return;
        getOrderTracking(orderId)
            .then(setTracking)
            .catch(() => setTracking(null));
    }, [orderId]);

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center mb-6">
                    <IconSymbol name="phone" size={38} color="#ffffff" />
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                    {tracking?.driver_name ?? "Driver call"}
                </Text>
                <Text className="text-white/70 text-center mt-3 leading-6">
                    Voice calling is not connected to a backend provider yet. Use live
                    tracking or chat for this order.
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-10 w-16 h-16 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                >
                    <IconSymbol name="cancel" size={28} color="#ffffff" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
