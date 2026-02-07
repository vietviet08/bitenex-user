import React, { memo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface FAQAccordionProps {
    readonly question: string;
    readonly answer: string;
}

function FAQAccordionComponent({ question, answer }: FAQAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rotation = useSharedValue(0);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 200 });
    };

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <View className="border-b border-gray-100">
            <Pressable
                onPress={handleToggle}
                className="flex-row items-center justify-between py-4 px-4"
            >
                <Text className="flex-1 font-semibold text-[15px] text-text-primary pr-4">
                    {question}
                </Text>
                <Animated.View style={animatedIconStyle}>
                    <IconSymbol
                        name="expand-more"
                        size={24}
                        color="#9e9e9e"
                    />
                </Animated.View>
            </Pressable>
            {isExpanded && (
                <View className="px-4 pb-4">
                    <Text className="text-sm text-text-secondary leading-5">
                        {answer}
                    </Text>
                </View>
            )}
        </View>
    );
}

export const FAQAccordion = memo(FAQAccordionComponent);
