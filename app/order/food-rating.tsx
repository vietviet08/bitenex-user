import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/profile";
import { StarRating } from "@/components/feedback";

// Mock data - API ready
const MOCK_RESTAURANT = {
    id: "restaurant-1",
    name: "Burger Hub",
    imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    cuisine: "American, Burgers",
};

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
    const params = useLocalSearchParams<{
        orderId?: string;
        mood?: string;
        driverRating?: string;
        tip?: string;
    }>();

    const handleSubmit = () => {
        // Submit all feedback data
        console.log("Feedback submitted:", {
            orderId: params.orderId,
            mood: params.mood,
            driverRating: params.driverRating,
            tip: params.tip,
            restaurantRating: rating,
            restaurantComment: comment,
        });

        // Navigate back to home/orders
        router.replace("/(tabs)");
    };

    const handleSkip = () => {
        // Navigate back to home/orders without rating
        router.replace("/(tabs)");
    };

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
                    <Image
                        source={{ uri: MOCK_RESTAURANT.imageUrl }}
                        style={{ width: 100, height: 100, borderRadius: 20 }}
                        contentFit="cover"
                    />
                    <Text className="text-xl font-bold text-text-primary mt-4">
                        {MOCK_RESTAURANT.name}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-1">
                        {MOCK_RESTAURANT.cuisine}
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
                    disabled={rating === 0}
                    className={`py-4 rounded-xl items-center mb-3 ${
                        rating > 0
                            ? "bg-primary-500 active:bg-primary-600"
                            : "bg-gray-300"
                    }`}
                >
                    <Text
                        className={`font-bold text-lg ${
                            rating > 0 ? "text-white" : "text-gray-500"
                        }`}
                    >
                        Submit Review
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
