import { View, Text } from "react-native";
import { memo } from "react";
import { formatCurrency } from "@/utils/helpers";

interface OrderSummaryProps {
    readonly subtotal: number;
    readonly deliveryFee: number;
    readonly discount: number; // as a decimal, e.g., 0.1 for 10%
    readonly total: number;
}

export const OrderSummary = memo(function OrderSummary({
    subtotal,
    deliveryFee,
    discount,
    total,
}: OrderSummaryProps) {
    const discountAmount = subtotal * discount;

    return (
        <View className="px-4 py-4 bg-neutral-50 rounded-xl mx-4 my-2">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Order Summary
            </Text>

            <View className="gap-2">
                <View className="flex-row justify-between">
                    <Text className="text-base text-neutral-600">Subtotal</Text>
                    <Text className="text-base text-neutral-900">
                        {formatCurrency(subtotal)}
                    </Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-base text-neutral-600">
                        Delivery Fee
                    </Text>
                    <Text className="text-base text-neutral-900">
                        {formatCurrency(deliveryFee)}
                    </Text>
                </View>

                {discount > 0 && (
                    <View className="flex-row justify-between">
                        <Text className="text-base text-primary-600">
                            Discount ({(discount * 100).toFixed(0)}%)
                        </Text>
                        <Text className="text-base text-primary-600">
                            -{formatCurrency(discountAmount)}
                        </Text>
                    </View>
                )}

                <View className="h-px bg-neutral-200 my-2" />

                <View className="flex-row justify-between">
                    <Text className="text-lg font-bold text-neutral-900">
                        Total
                    </Text>
                    <Text className="text-lg font-bold text-neutral-900">
                        {formatCurrency(total)}
                    </Text>
                </View>
            </View>
        </View>
    );
});
