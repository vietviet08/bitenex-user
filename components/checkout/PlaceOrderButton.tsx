import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";

interface PlaceOrderButtonProps {
    readonly total: number;
    readonly onPlaceOrder: () => void;
    readonly isLoading?: boolean;
}

export const PlaceOrderButton = memo(function PlaceOrderButton({
    total,
    onPlaceOrder,
    isLoading = false,
}: PlaceOrderButtonProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
            <Pressable
                onPress={onPlaceOrder}
                disabled={isLoading}
                className={`rounded-xl py-4 items-center justify-center ${isLoading ? "bg-neutral-300" : "bg-primary-500"
                    }`}
                style={{
                    shadowColor: isLoading ? "transparent" : colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: isLoading ? 0 : 4,
                }}
            >
                <Text
                    className={`font-bold text-base ${isLoading ? "text-neutral-500" : "text-white"
                        }`}
                >
                    {isLoading ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
                </Text>
            </Pressable>
        </View>
    );
});
