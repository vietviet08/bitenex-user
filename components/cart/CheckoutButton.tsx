import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/theme";

interface CheckoutButtonProps {
    readonly total: number;
    readonly disabled?: boolean;
}

export const CheckoutButton = memo(function CheckoutButton({
    total,
    disabled = false,
}: CheckoutButtonProps) {
    const insets = useSafeAreaInsets();

    const handlePress = () => {
        router.push("/checkout");
    };

    return (
        <View className="bg-white border-t border-neutral-200 px-4 py-3">
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                className={`rounded-xl py-4 items-center justify-center ${
                    disabled ? "bg-neutral-300" : "bg-primary-500"
                }`}
                style={{
                    shadowColor: disabled ? "transparent" : colors.primary[500],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: disabled ? 0 : 4,
                }}
            >
                <Text
                    className={`font-bold text-base ${
                        disabled ? "text-neutral-500" : "text-white"
                    }`}
                >
                    Proceed to Checkout · ${total.toFixed(2)}
                </Text>
            </Pressable>
        </View>
    );
});
