import { View, Text, Pressable } from "react-native";
import { memo, useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";
import type { CartItem } from "@/store/zustand/cart.store";
import { formatCurrency } from "@/utils/helpers";

interface OrderItemsSummaryProps {
    readonly items: CartItem[];
}

export const OrderItemsSummary = memo(function OrderItemsSummary({
    items,
}: OrderItemsSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <View className="px-4 py-4">
            <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                className="flex-row items-center justify-between"
            >
                <Text className="text-lg font-bold text-neutral-900">
                    Order Summary ({itemCount} items)
                </Text>
                <IconSymbol
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={24}
                    color={colors.neutral[600]}
                />
            </Pressable>

            {isExpanded && (
                <View className="mt-3 gap-2">
                    {items.map((item) => (
                        <View
                            key={item.id}
                            className="flex-row items-center justify-between py-2"
                        >
                            <View className="flex-1 flex-row items-center gap-2">
                                <Text className="text-base text-neutral-500">
                                    {item.quantity}x
                                </Text>
                                <Text
                                    className="text-base text-neutral-900 flex-1"
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                            </View>
                            <Text className="text-base text-neutral-900">
                                {formatCurrency(item.lineTotal)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
});
