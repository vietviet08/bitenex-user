import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { formatCurrency } from "@/utils/helpers";
import { ScreenHeader } from "@/components/profile";
import { TipSelector } from "@/components/feedback";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

export default function TipDriverScreen() {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const params = useLocalSearchParams<{
        orderId?: string;
        mood?: string;
        driverRating?: string;
        driverComment?: string;
    }>();

    const loadTracking = useCallback(async () => {
        if (!params.orderId) return;
        setTracking(await getOrderTracking(params.orderId));
    }, [params.orderId]);

    useEffect(() => {
        void loadTracking();
    }, [loadTracking]);

    const handleSendTip = () => {
        // Process tip
        router.push({
            pathname: "/order/food-rating",
            params: {
                orderId: params.orderId,
                mood: params.mood,
                driverRating: params.driverRating,
                driverComment: params.driverComment,
                tip: selectedAmount?.toString(),
            },
        });
    };

    const handleSkip = () => {
        router.push({
            pathname: "/order/food-rating",
            params: {
                orderId: params.orderId,
                mood: params.mood,
                driverRating: params.driverRating,
                driverComment: params.driverComment,
            },
        });
    };

    const driverName = tracking?.driver_name ?? "Your driver";
    const driverAvatar = tracking?.driver_avatar_url;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Tip Your Driver" />

            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pt-6 pb-8"
            >
                {/* Driver Card */}
                <View className="bg-white rounded-2xl p-6 shadow-sm items-center mb-6">
                    {driverAvatar ? (
                        <Image
                            source={{ uri: driverAvatar }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
                            <Text className="text-primary-600 text-3xl font-bold">
                                {driverName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <Text className="text-lg font-bold text-text-primary mt-3">
                        {driverName}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                        Delivered your order safely
                    </Text>
                </View>

                {/* Thank you message */}
                <View className="bg-primary-50 rounded-2xl p-4 mb-6">
                    <Text className="text-primary-700 text-center font-medium">
                        Show your appreciation with a tip! 100% goes to your
                        driver.
                    </Text>
                </View>

                {/* Tip Selector */}
                <Text className="text-base font-semibold text-text-primary mb-4">
                    Select tip amount
                </Text>
                <TipSelector
                    selectedAmount={selectedAmount}
                    onSelect={setSelectedAmount}
                />

                {/* Selected Amount Display */}
                {selectedAmount !== null && selectedAmount > 0 && (
                    <View className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-text-secondary">
                                Tip amount
                            </Text>
                            <Text className="text-xl font-bold text-primary-500">
                                {formatCurrency(selectedAmount)}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Buttons */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleSendTip}
                    disabled={!selectedAmount || selectedAmount === 0}
                    className={`py-4 rounded-xl items-center mb-3 ${selectedAmount && selectedAmount > 0
                            ? "bg-primary-500 active:bg-primary-600"
                            : "bg-gray-300"
                        }`}
                >
                    <Text
                        className={`font-bold text-lg ${selectedAmount && selectedAmount > 0
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                    >
                        Send Tip
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleSkip}
                    className="py-3 rounded-xl items-center"
                >
                    <Text className="text-text-secondary font-semibold">
                        Skip
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
