import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { StarRating } from "@/components/feedback";
import { Driver } from "@/components/tracking";

// Mock data - API ready
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

const getRatingLabel = (rating: number): string => {
    if (rating === 5) return "Excellent!";
    if (rating === 4) return "Very Good";
    if (rating === 3) return "Good";
    if (rating === 2) return "Fair";
    return "Poor";
};

export default function DriverRatingScreen() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const params = useLocalSearchParams<{ orderId?: string; mood?: string }>();

    const handleSubmit = () => {
        // Save rating data
        router.push({
            pathname: "/order/tip-driver",
            params: {
                orderId: params.orderId,
                mood: params.mood,
                driverRating: rating.toString(),
            },
        });
    };

    const handleSkip = () => {
        router.push({
            pathname: "/order/tip-driver",
            params: { orderId: params.orderId, mood: params.mood },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Rate Driver" />

            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pt-6 pb-8"
                keyboardShouldPersistTaps="handled"
            >
                {/* Driver Avatar */}
                <View className="items-center mb-6">
                    <Image
                        source={{ uri: MOCK_DRIVER.avatarUrl }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                        contentFit="cover"
                    />
                    <Text className="text-xl font-bold text-text-primary mt-4">
                        {MOCK_DRIVER.name}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                        Your delivery driver
                    </Text>
                </View>

                {/* Question */}
                <Text className="text-lg font-semibold text-text-primary text-center mb-6">
                    How was your experience with your driver?
                </Text>

                {/* Star Rating */}
                <View className="items-center mb-8">
                    <StarRating
                        rating={rating}
                        onChange={setRating}
                        size={48}
                    />
                    {rating > 0 && (
                        <Text className="text-sm text-text-secondary mt-3">
                            {getRatingLabel(rating)}
                        </Text>
                    )}
                </View>

                {/* Comment Input */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <Text className="text-sm font-semibold text-text-secondary mb-2">
                        Leave a comment (optional)
                    </Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Tell us more about your experience..."
                        multiline
                        numberOfLines={4}
                        className="text-base text-text-primary min-h-[100]"
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleSubmit}
                    disabled={rating === 0}
                    className={`py-4 rounded-xl items-center mb-3 ${rating > 0
                            ? "bg-primary-500 active:bg-primary-600"
                            : "bg-gray-300"
                        }`}
                >
                    <Text
                        className={`font-bold text-lg ${rating > 0 ? "text-white" : "text-gray-500"
                            }`}
                    >
                        Submit Rating
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
