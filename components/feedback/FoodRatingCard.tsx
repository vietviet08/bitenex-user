import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

export interface FoodItem {
    id: string;
    name: string;
    imageUrl: string;
    quantity?: number;
}

export interface FoodRating {
    itemId: string;
    liked: boolean | null;
}

interface FoodRatingCardProps {
    readonly item: FoodItem;
    readonly rating: FoodRating | null;
    readonly onRate: (itemId: string, liked: boolean) => void;
}

function FoodRatingCardComponent({
    item,
    rating,
    onRate,
}: FoodRatingCardProps) {
    const thumbUpScale = useSharedValue(1);
    const thumbDownScale = useSharedValue(1);

    const thumbUpStyle = useAnimatedStyle(() => ({
        transform: [{ scale: thumbUpScale.value }],
    }));

    const thumbDownStyle = useAnimatedStyle(() => ({
        transform: [{ scale: thumbDownScale.value }],
    }));

    const handleThumbUp = () => {
        thumbUpScale.value = withSpring(1.2, { damping: 8 });
        setTimeout(() => {
            thumbUpScale.value = withSpring(1);
        }, 100);
        onRate(item.id, true);
    };

    const handleThumbDown = () => {
        thumbDownScale.value = withSpring(1.2, { damping: 8 });
        setTimeout(() => {
            thumbDownScale.value = withSpring(1);
        }, 100);
        onRate(item.id, false);
    };

    const isLiked = rating?.liked === true;
    const isDisliked = rating?.liked === false;

    return (
        <View className="bg-white rounded-2xl p-4 flex-row items-center gap-4 shadow-sm">
            {/* Food Image */}
            <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 64, height: 64, borderRadius: 12 }}
                contentFit="cover"
            />

            {/* Food Info */}
            <View className="flex-1">
                <Text
                    className="font-semibold text-text-primary text-base"
                    numberOfLines={2}
                >
                    {item.name}
                </Text>
                {item.quantity && (
                    <Text className="text-sm text-text-secondary mt-0.5">
                        x{item.quantity}
                    </Text>
                )}
            </View>

            {/* Rating Buttons */}
            <View className="flex-row gap-2">
                <Pressable onPress={handleThumbDown}>
                    <Animated.View
                        style={thumbDownStyle}
                        className={`w-11 h-11 rounded-full items-center justify-center ${
                            isDisliked ? "bg-red-100" : "bg-gray-100"
                        }`}
                    >
                        <Text className="text-xl">👎</Text>
                    </Animated.View>
                </Pressable>
                <Pressable onPress={handleThumbUp}>
                    <Animated.View
                        style={thumbUpStyle}
                        className={`w-11 h-11 rounded-full items-center justify-center ${
                            isLiked ? "bg-green-100" : "bg-gray-100"
                        }`}
                    >
                        <Text className="text-xl">👍</Text>
                    </Animated.View>
                </Pressable>
            </View>
        </View>
    );
}

export const FoodRatingCard = memo(FoodRatingCardComponent);
