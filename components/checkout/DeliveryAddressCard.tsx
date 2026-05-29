import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

interface DeliveryAddressCardProps {
    readonly address: string;
    readonly onEdit?: () => void;
    readonly actionLabel?: string;
}

export const DeliveryAddressCard = memo(function DeliveryAddressCard({
    address,
    onEdit,
    actionLabel = "Edit",
}: DeliveryAddressCardProps) {
    return (
        <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-neutral-900">
                    Delivery Address
                </Text>
                {onEdit && (
                    <Pressable onPress={onEdit}>
                        <Text className="text-sm font-medium text-primary-500">
                            {actionLabel}
                        </Text>
                    </Pressable>
                )}
            </View>

            <View className="flex-row items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                    <IconSymbol
                        name="location-on"
                        size={20}
                        color={colors.primary[500]}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-base text-neutral-900 leading-relaxed">
                        {address}
                    </Text>
                </View>
            </View>
        </View>
    );
});
