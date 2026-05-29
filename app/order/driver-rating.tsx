import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { StarRating } from "@/components/feedback";
import { getOrderTracking, type OrderTrackingResponse } from "@/services";

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
    const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useLocalSearchParams<{ orderId?: string; mood?: string }>();

    const loadTracking = useCallback(async () => {
        if (!params.orderId) {
            setIsLoading(false);
            return;
        }
        try {
            setTracking(await getOrderTracking(params.orderId));
        } finally {
            setIsLoading(false);
        }
    }, [params.orderId]);

    useEffect(() => {
        void loadTracking();
    }, [loadTracking]);

    const handleSubmit = () => {
        router.push({
            pathname: "/order/tip-driver",
            params: {
                orderId: params.orderId,
                mood: params.mood,
                driverRating: rating.toString(),
                driverComment: comment,
            },
        });
    };

    const handleSkip = () => {
        router.push({
            pathname: "/order/tip-driver",
            params: { orderId: params.orderId, mood: params.mood },
        });
    };

    const driverName = tracking?.driver_name ?? "Your driver";
    const driverAvatar = tracking?.driver_avatar_url;

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
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#FE8C00" />
                    ) : driverAvatar ? (
                        <Image
                            source={{ uri: driverAvatar }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-[100px] h-[100px] rounded-full bg-primary-100 items-center justify-center">
                            <Text className="text-primary-600 text-4xl font-bold">
                                {driverName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <Text className="text-xl font-bold text-text-primary mt-4">
                        {driverName}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                        {tracking?.driver_average_rating
                            ? `${tracking.driver_average_rating.toFixed(1)} rating`
                            : "Your delivery driver"}
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
