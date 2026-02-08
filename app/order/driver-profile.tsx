import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { DriverCard, Driver } from "@/components/tracking";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Mock data - API ready interface
const MOCK_DRIVER: Driver = {
    id: "driver-1",
    name: "John Smith",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    totalDeliveries: 156,
    phone: "+84 912 345 678",
    vehicle: {
        type: "Motorcycle",
        model: "Honda Wave",
        plate: "59H1-12345",
        color: "Red",
    },
};

const MOCK_REVIEWS = [
    { id: "1", rating: 5, text: "Very fast delivery!", date: "2 days ago" },
    { id: "2", rating: 5, text: "Friendly driver", date: "1 week ago" },
    { id: "3", rating: 4, text: "Good service", date: "2 weeks ago" },
];

export default function DriverProfileScreen() {
    const handleChatPress = () => {
        router.push("/order/chat");
    };

    const handleCallPress = () => {
        router.push("/order/call");
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Driver Profile" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Driver Info */}
                <View className="px-4 pt-4">
                    <DriverCard
                        driver={MOCK_DRIVER}
                        variant="expanded"
                        onChatPress={handleChatPress}
                        onCallPress={handleCallPress}
                    />
                </View>

                {/* Stats */}
                <View className="flex-row px-4 mt-4 gap-3">
                    <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
                        <Text className="text-2xl font-bold text-primary-500">
                            {MOCK_DRIVER.rating}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                            Rating
                        </Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
                        <Text className="text-2xl font-bold text-primary-500">
                            {MOCK_DRIVER.totalDeliveries}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                            Deliveries
                        </Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
                        <Text className="text-2xl font-bold text-primary-500">
                            2
                        </Text>
                        <Text className="text-sm text-text-secondary">
                            Years
                        </Text>
                    </View>
                </View>

                {/* Recent Reviews */}
                <View className="bg-white mx-4 mt-4 mb-6 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-lg text-text-primary mb-4">
                        Recent Reviews
                    </Text>
                    {MOCK_REVIEWS.map((review) => (
                        <View
                            key={review.id}
                            className="flex-row gap-3 py-3 border-b border-gray-100 last:border-b-0"
                        >
                            <View className="flex-row items-center gap-1">
                                <IconSymbol
                                    name="star"
                                    size={16}
                                    color="#f59e0b"
                                />
                                <Text className="font-semibold text-text-primary">
                                    {review.rating}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-primary">
                                    {review.text}
                                </Text>
                                <Text className="text-xs text-text-secondary mt-1">
                                    {review.date}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
