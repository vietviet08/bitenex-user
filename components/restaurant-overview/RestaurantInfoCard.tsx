import { View, Text } from "react-native";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

interface RestaurantInfoCardProps {
    readonly name: string;
    readonly cuisine: string;
    readonly rating: number;
    readonly reviewCount: number;
    readonly isOpen: boolean;
}

export const RestaurantInfoCard = memo(function RestaurantInfoCard({
    name,
    cuisine,
    rating,
    reviewCount,
    isOpen,
}: RestaurantInfoCardProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-2xl font-bold text-neutral-900 mb-1">
                {name}
            </Text>
            <Text className="text-base text-neutral-500 mb-3">{cuisine}</Text>

            <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                    <IconSymbol
                        name="star"
                        size={18}
                        color={colors.warning[500]}
                    />
                    <Text className="text-base font-semibold text-neutral-900">
                        {rating.toFixed(1)}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                        ({reviewCount} reviews)
                    </Text>
                </View>

                <View
                    className={`px-2 py-1 rounded-full ${isOpen ? "bg-success-100" : "bg-error-100"
                        }`}
                >
                    <Text
                        className={`text-sm font-medium ${isOpen ? "text-success-600" : "text-error-600"
                            }`}
                    >
                        {isOpen ? "Open Now" : "Closed"}
                    </Text>
                </View>
            </View>
        </View>
    );
});
