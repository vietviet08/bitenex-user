import { View, Text, Pressable, StyleSheet } from "react-native";
import { memo, useState, useCallback } from "react";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

const WARNING_COLOR = colors.warning as string;

interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    text: string;
}

interface ReviewCardProps {
    readonly review: Review;
}

const MAX_TEXT_LENGTH = 150;

export const ReviewCard = memo(function ReviewCard({
    review,
}: ReviewCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = review.text.length > MAX_TEXT_LENGTH;

    const handleToggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const displayText =
        isLongText && !isExpanded
            ? review.text.substring(0, MAX_TEXT_LENGTH) + "..."
            : review.text;

    return (
        <View className="px-4 py-4 border-b border-neutral-100">
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-3">
                <View style={styles.avatarContainer}>
                    {review.userAvatar ? (
                        <Image
                            source={{ uri: review.userAvatar }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-primary-100 items-center justify-center rounded-full">
                            <Text className="text-lg text-primary-500 font-bold">
                                {review.userName.charAt(0)}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-neutral-900">
                        {review.userName}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                        {formattedDate}
                    </Text>
                </View>

                {/* Rating */}
                <View className="flex-row items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <IconSymbol
                            key={star}
                            name="star"
                            size={14}
                            color={
                                star <= review.rating
                                    ? WARNING_COLOR
                                    : colors.neutral[300]
                            }
                        />
                    ))}
                </View>
            </View>

            {/* Review Text */}
            <Text className="text-base text-neutral-700 leading-relaxed">
                {displayText}
            </Text>

            {isLongText && (
                <Pressable onPress={handleToggleExpand} className="mt-2">
                    <Text className="text-sm font-medium text-primary-500">
                        {isExpanded ? "Show less" : "Read more"}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    avatarContainer: {
        width: 40,
        height: 40,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
