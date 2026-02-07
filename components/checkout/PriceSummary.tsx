import { View, Text } from "react-native";
import { memo } from "react";

interface PriceSummaryProps {
    readonly subtotal: number;
    readonly deliveryFee: number;
    readonly discount: number; // as a decimal, e.g., 0.1 for 10%
    readonly taxes: number;
    readonly total: number;
}

export const PriceSummary = memo(function PriceSummary({
    subtotal,
    deliveryFee,
    discount,
    taxes,
    total,
}: PriceSummaryProps) {
    const discountAmount = subtotal * discount;

    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Price Details
            </Text>

            <View className="gap-2 p-4 bg-neutral-50 rounded-xl">
                <View className="flex-row justify-between">
                    <Text className="text-base text-neutral-600">Subtotal</Text>
                    <Text className="text-base text-neutral-900">
                        ${subtotal.toFixed(2)}
                    </Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-base text-neutral-600">
                        Delivery Fee
                    </Text>
                    <Text className="text-base text-neutral-900">
                        ${deliveryFee.toFixed(2)}
                    </Text>
                </View>

                {discount > 0 && (
                    <View className="flex-row justify-between">
                        <Text className="text-base text-primary-600">
                            Discount ({(discount * 100).toFixed(0)}%)
                        </Text>
                        <Text className="text-base text-primary-600">
                            -${discountAmount.toFixed(2)}
                        </Text>
                    </View>
                )}

                <View className="flex-row justify-between">
                    <Text className="text-base text-neutral-600">Taxes</Text>
                    <Text className="text-base text-neutral-900">
                        ${taxes.toFixed(2)}
                    </Text>
                </View>

                <View className="h-px bg-neutral-200 my-2" />

                <View className="flex-row justify-between">
                    <Text className="text-lg font-bold text-neutral-900">
                        Total
                    </Text>
                    <Text className="text-lg font-bold text-neutral-900">
                        ${total.toFixed(2)}
                    </Text>
                </View>
            </View>
        </View>
    );
});
