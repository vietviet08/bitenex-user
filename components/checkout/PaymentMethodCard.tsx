import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

interface PaymentMethodCardProps {
    readonly cardType: string; // e.g., "Visa", "Mastercard"
    readonly lastFourDigits: string;
    readonly onChangePayment?: () => void;
}

export const PaymentMethodCard = memo(function PaymentMethodCard({
    cardType,
    lastFourDigits,
    onChangePayment,
}: PaymentMethodCardProps) {
    return (
        <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-neutral-900">
                    Payment Method
                </Text>
                {onChangePayment && (
                    <Pressable onPress={onChangePayment}>
                        <Text className="text-sm font-medium text-primary-500">
                            Change
                        </Text>
                    </Pressable>
                )}
            </View>

            <View className="flex-row items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
                    <IconSymbol
                        name="credit-card"
                        size={20}
                        color={colors.primary[600]}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-medium text-neutral-900">
                        {cardType} •••• {lastFourDigits}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                        Expires 12/25
                    </Text>
                </View>
            </View>
        </View>
    );
});
