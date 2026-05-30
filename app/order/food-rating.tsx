import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { StarRating } from "@/components/feedback";
import {
    fetchMerchantDetail,
    getOrderById,
    rateOrderDriver,
    rateOrderMerchant,
    type MerchantDto,
    type OrderResponse,
} from "@/services";

const getRatingMessage = (rating: number): string => {
    switch (rating) {
        case 5:
            return "Excellent!";
        case 4:
            return "Very Good";
        case 3:
            return "Good";
        case 2:
            return "Fair";
        case 1:
            return "Poor";
        default:
            return "";
    }
};

export default function FoodRatingScreen() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [merchant, setMerchant] = useState<MerchantDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useLocalSearchParams<{
        orderId?: string;
        mood?: string;
        driverRating?: string;
        driverComment?: string;
    }>();

    const loadOrder = useCallback(async () => {
        if (!params.orderId) {
            setIsLoading(false);
            return;
        }
        try {
            const orderData = await getOrderById(params.orderId);
            setOrder(orderData);
            setMerchant(await fetchMerchantDetail(orderData.merchant_id));
        } finally {
            setIsLoading(false);
        }
    }, [params.orderId]);

    useEffect(() => {
        void loadOrder();
    }, [loadOrder]);

    const submitDriverRatingIfAny = async () => {
        if (!params.orderId || !params.driverRating) return;
        const driverRating = Number(params.driverRating);
        if (!Number.isFinite(driverRating) || driverRating < 1) return;
        await rateOrderDriver(params.orderId, {
            rating: driverRating,
            comment: params.driverComment || undefined,
            tip_amount: 0,
        });
    };

    const handleSubmit = async () => {
        if (!params.orderId || rating === 0) return;
        setIsSubmitting(true);
        try {
            await submitDriverRatingIfAny();
            await rateOrderMerchant(params.orderId, {
                rating,
                comment: comment || undefined,
            });
        } finally {
            setIsSubmitting(false);
        }
        router.replace("/(tabs)");
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            await submitDriverRatingIfAny();
        } finally {
            setIsSubmitting(false);
        }
        router.replace("/(tabs)");
    };

    const merchantImage =
        merchant?.cover_image_url ||
        merchant?.logo_url ||
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400";

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Rate Restaurant" />

            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pt-6 pb-8"
                keyboardShouldPersistTaps="handled"
            >
                {/* Restaurant Info */}
                <View className="items-center mb-6">
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#FE8C00" />
                    ) : (
                        <Image
                            source={{ uri: merchantImage }}
                            style={{ width: 100, height: 100, borderRadius: 20 }}
                            contentFit="cover"
                        />
                    )}
                    <Text className="text-xl font-bold text-text-primary mt-4">
                        {merchant?.name ?? "Restaurant"}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                        {order?.order_number ?? "Delivered order"}
                    </Text>
                </View>

                {/* Question */}
                <Text className="text-lg font-semibold text-text-primary text-center mb-6">
                    How was the food from this restaurant?
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
                            {getRatingMessage(rating)}
                        </Text>
                    )}
                </View>

                {/* Comment Input */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <Text className="text-sm font-semibold text-text-secondary mb-2">
                        Leave a review (optional)
                    </Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Tell us about your food experience..."
                        multiline
                        numberOfLines={4}
                        className="text-base text-text-primary min-h-[100]"
                        textAlignVertical="top"
                    />
                </View>

                {/* Thank you message */}
                <View className="bg-primary-50 rounded-2xl p-4 mb-6">
                    <Text className="text-primary-700 text-center font-medium">
                        Your feedback helps us improve and helps other customers
                        discover great food!
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View className="px-6 pb-6">
                <Pressable
                    onPress={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={`py-4 rounded-xl items-center mb-3 ${
                        rating > 0 && !isSubmitting
                            ? "bg-primary-500 active:bg-primary-600"
                            : "bg-gray-300"
                    }`}
                >
                    <Text
                        className={`font-bold text-lg ${
                            rating > 0 && !isSubmitting ? "text-white" : "text-gray-500"
                        }`}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleSkip}
                    disabled={isSubmitting}
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
