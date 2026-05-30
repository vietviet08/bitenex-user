import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/profile";
import { SearchRadar } from "@/components/tracking";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

const POLL_MS = 5000;
const ASSIGNED_STATUSES = new Set(["PICKING_UP", "DELIVERING", "DELIVERED"]);

export default function SearchDriverScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const openTracking = useCallback(() => {
        if (!orderId) {
            router.replace("/(tabs)/orders");
            return;
        }
        router.replace({
            pathname: "/order/tracking",
            params: { orderId },
        });
    }, [orderId]);

    const loadTracking = useCallback(async () => {
        if (!orderId) {
            setError("Missing order id.");
            return;
        }

        try {
            const data = await getOrderTracking(orderId);
            setTracking(data);
            setError(null);
            if (data.driver_id || ASSIGNED_STATUSES.has(data.status)) {
                openTracking();
            }
        } catch {
            setError("Could not check driver assignment.");
        }
    }, [openTracking, orderId]);

    useEffect(() => {
        loadTracking();
        const interval = setInterval(loadTracking, POLL_MS);
        return () => clearInterval(interval);
    }, [loadTracking]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Finding Driver" />
            <SearchRadar
                message={
                    error ??
                    (tracking?.driver_id
                        ? "Driver found!"
                        : "Waiting for an available driver...")
                }
                estimatedTime={tracking?.status === "READY" ? "Dispatching" : "Please wait"}
            />
            <View className="px-6 pb-8">
                <Pressable
                    onPress={openTracking}
                    className="w-full py-4 rounded-full border border-gray-300 items-center active:bg-gray-50"
                >
                    <Text className="text-base font-semibold text-text-primary">
                        View Order Tracking
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
