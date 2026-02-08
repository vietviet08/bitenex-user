import React, { memo } from "react";
import { View, Pressable } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface StarRatingProps {
    readonly rating: number;
    readonly maxRating?: number;
    readonly size?: number;
    readonly onChange?: (rating: number) => void;
    readonly readonly?: boolean;
}

interface StarProps {
    readonly filled: boolean;
    readonly size: number;
    readonly onPress?: () => void;
    readonly readonly?: boolean;
}

function Star({ filled, size, onPress, readonly }: StarProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (!readonly) {
            scale.value = withSpring(1.2, { damping: 10 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={readonly}
        >
            <Animated.View style={animatedStyle}>
                <IconSymbol
                    name={filled ? "star" : "star-rate"}
                    size={size}
                    color={filled ? "#f59e0b" : "#d1d5db"}
                />
            </Animated.View>
        </Pressable>
    );
}

function StarRatingComponent({
    rating,
    maxRating = 5,
    size = 40,
    onChange,
    readonly = false,
}: StarRatingProps) {
    const handlePress = (index: number) => {
        if (onChange && !readonly) {
            onChange(index + 1);
        }
    };

    return (
        <View className="flex-row gap-2 justify-center">
            {Array.from({ length: maxRating }, (_, i) => (
                <Star
                    key={i}
                    filled={i < rating}
                    size={size}
                    onPress={() => handlePress(i)}
                    readonly={readonly}
                />
            ))}
        </View>
    );
}

export const StarRating = memo(StarRatingComponent);
