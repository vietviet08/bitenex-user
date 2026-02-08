import React, { memo, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from "react-native-reanimated";

interface SearchRadarProps {
    readonly message?: string;
    readonly estimatedTime?: string;
}

function SearchRadarComponent({
    message = "Searching for driver...",
    estimatedTime = "2-3 min",
}: SearchRadarProps) {
    const ring1Scale = useSharedValue(0.2);
    const ring1Opacity = useSharedValue(1);
    const ring2Scale = useSharedValue(0.2);
    const ring2Opacity = useSharedValue(1);
    const ring3Scale = useSharedValue(0.2);
    const ring3Opacity = useSharedValue(1);

    useEffect(() => {
        // Ring 1
        ring1Scale.value = withRepeat(
            withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
        ring1Opacity.value = withRepeat(
            withTiming(0, { duration: 2000 }),
            -1,
            false
        );

        // Ring 2 - delayed
        ring2Scale.value = withDelay(
            600,
            withRepeat(
                withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        ring2Opacity.value = withDelay(
            600,
            withRepeat(withTiming(0, { duration: 2000 }), -1, false)
        );

        // Ring 3 - more delayed
        ring3Scale.value = withDelay(
            1200,
            withRepeat(
                withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        ring3Opacity.value = withDelay(
            1200,
            withRepeat(withTiming(0, { duration: 2000 }), -1, false)
        );
    }, []);

    const ring1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring1Scale.value }],
        opacity: ring1Opacity.value,
    }));

    const ring2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring2Scale.value }],
        opacity: ring2Opacity.value,
    }));

    const ring3Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring3Scale.value }],
        opacity: ring3Opacity.value,
    }));

    return (
        <View className="flex-1 items-center justify-center bg-white">
            {/* Radar rings */}
            <View className="w-64 h-64 items-center justify-center">
                <Animated.View
                    style={ring1Style}
                    className="absolute w-32 h-32 rounded-full border-2 border-primary-300"
                />
                <Animated.View
                    style={ring2Style}
                    className="absolute w-32 h-32 rounded-full border-2 border-primary-400"
                />
                <Animated.View
                    style={ring3Style}
                    className="absolute w-32 h-32 rounded-full border-2 border-primary-500"
                />

                {/* Center dot */}
                <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center z-10">
                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                        <View className="w-4 h-4 rounded-full bg-primary-500" />
                    </View>
                </View>
            </View>

            {/* Text */}
            <View className="items-center mt-8">
                <Text className="text-xl font-bold text-text-primary mb-2">
                    {message}
                </Text>
                <Text className="text-base text-text-secondary">
                    Estimated wait: {estimatedTime}
                </Text>
            </View>
        </View>
    );
}

export const SearchRadar = memo(SearchRadarComponent);
