import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";
import { formatCurrency } from "@/utils/helpers";

interface AddToCartBarProps {
    readonly quantity: number;
    readonly totalPrice: number;
    readonly onIncrement: () => void;
    readonly onDecrement: () => void;
    readonly onAddToCart: () => void;
}

export const AddToCartBar = memo(function AddToCartBar({
    quantity,
    totalPrice,
    onIncrement,
    onDecrement,
    onAddToCart,
}: AddToCartBarProps) {
    const insets = useSafeAreaInsets();
    const isDecrementDisabled = quantity <= 1;

    return (
        <View
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 flex-row items-center justify-between"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
            {/* Quantity Selector */}
            <View className="flex-row items-center gap-3 bg-neutral-100 rounded-xl px-2 py-1">
                <Pressable
                    onPress={onDecrement}
                    disabled={isDecrementDisabled}
                    className={`w-9 h-9 rounded-lg items-center justify-center ${isDecrementDisabled ? "bg-neutral-200" : "bg-white"
                        }`}
                    style={{
                        shadowColor: isDecrementDisabled ? "transparent" : "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: isDecrementDisabled ? 0 : 2,
                    }}
                >
                    <IconSymbol
                        name="remove"
                        size={20}
                        color={isDecrementDisabled ? colors.neutral[400] : colors.neutral[800]}
                    />
                </Pressable>
                <Text className="text-lg font-semibold text-neutral-900 min-w-[24px] text-center">
                    {quantity}
                </Text>
                <Pressable
                    onPress={onIncrement}
                    className="w-9 h-9 rounded-lg bg-white items-center justify-center"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                >
                    <IconSymbol name="add" size={20} color={colors.neutral[800]} />
                </Pressable>
            </View>

            {/* Add to Cart Button */}
            <Pressable
                onPress={onAddToCart}
                className="flex-1 ml-4 bg-primary-500 rounded-xl py-4 flex-row items-center justify-center"
                style={{
                    shadowColor: colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <Text className="text-white font-bold text-base">
                    Add to Cart · {formatCurrency(totalPrice)}
                </Text>
            </Pressable>
        </View>
    );
});
