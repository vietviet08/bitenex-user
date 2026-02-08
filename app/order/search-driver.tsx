import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SearchRadar } from "@/components/tracking";
import { ScreenHeader } from "@/components/profile";

export default function SearchDriverScreen() {
    const [isSearching, setIsSearching] = useState(true);

    useEffect(() => {
        // Simulate finding a driver after 5 seconds
        const timer = setTimeout(() => {
            setIsSearching(false);
            // Navigate to tracking screen when driver accepts
            router.replace("/order/tracking");
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleCancel = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Finding Driver" />
            <SearchRadar
                message={isSearching ? "Searching for driver..." : "Driver found!"}
                estimatedTime="2-3 min"
            />
            <View className="px-6 pb-8">
                <Pressable
                    onPress={handleCancel}
                    className="w-full py-4 rounded-full border border-gray-300 items-center active:bg-gray-50"
                >
                    <Text className="text-base font-semibold text-text-primary">
                        Cancel Order
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
