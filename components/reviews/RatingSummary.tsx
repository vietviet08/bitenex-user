import { View, Text } from "react-native";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

const WARNING_COLOR = colors.warning as string;

interface RatingDistribution {
    stars: number;
    count: number;
    percentage: number;
}

interface RatingSummaryProps {
    readonly average: number;
    readonly totalCount: number;
    readonly distribution: RatingDistribution[];
}

export const RatingSummary = memo(function RatingSummary({
    average,
    totalCount,
    distribution,
}: RatingSummaryProps) {
    return (
        <View className="px-4 py-4 bg-neutral-50">
            <View className="flex-row items-start gap-6">
                {/* Overall Rating */}
                <View className="items-center">
                    <Text className="text-5xl font-bold text-neutral-900">
                        {average.toFixed(1)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconSymbol
                                key={star}
                                name="star"
                                size={16}
                                color={
                                    star <= Math.round(average)
                                        ? WARNING_COLOR
                                        : colors.neutral[300]
                                }
                            />
                        ))}
                    </View>
                    <Text className="text-sm text-neutral-500 mt-1">
                        {totalCount} reviews
                    </Text>
                </View>

                {/* Distribution Bars */}
                <View className="flex-1 gap-1">
                    {distribution.map((item) => (
                        <View
                            key={item.stars}
                            className="flex-row items-center gap-2"
                        >
                            <Text className="text-sm text-neutral-600 w-4">
                                {item.stars}
                            </Text>
                            <IconSymbol
                                name="star"
                                size={12}
                                color={WARNING_COLOR}
                            />
                            <View className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: WARNING_COLOR,
                                    }}
                                />
                            </View>
                            <Text className="text-xs text-neutral-500 w-8">
                                {item.count}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
});
