import { View, Text, TextInput, Pressable } from "react-native";
import { memo, useState } from "react";
import { colors } from "@/theme";

interface PromoCodeInputProps {
    readonly currentPromoCode: string;
    readonly onApplyPromo: (code: string) => boolean;
    readonly onClearPromo: () => void;
}

export const PromoCodeInput = memo(function PromoCodeInput({
    currentPromoCode,
    onApplyPromo,
    onClearPromo,
}: PromoCodeInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    const handleApply = () => {
        if (!inputValue.trim()) {
            setError("Please enter a promo code");
            return;
        }

        const success = onApplyPromo(inputValue);
        if (success) {
            setError("");
            setInputValue("");
        } else {
            setError("Invalid promo code");
        }
    };

    if (currentPromoCode) {
        return (
            <View className="px-4 py-4 bg-primary-50 rounded-xl mx-4 my-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-base text-primary-600">🎉</Text>
                        <Text className="text-base font-semibold text-primary-600">
                            {currentPromoCode} applied
                        </Text>
                    </View>
                    <Pressable onPress={onClearPromo}>
                        <Text className="text-sm font-medium text-primary-500">
                            Remove
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="px-4 py-4">
            <View className="flex-row gap-2">
                <TextInput
                    value={inputValue}
                    onChangeText={(text) => {
                        setInputValue(text);
                        if (error) setError("");
                    }}
                    placeholder="Enter promo code"
                    placeholderTextColor={colors.neutral[400]}
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-base text-neutral-900 bg-white"
                    autoCapitalize="characters"
                />
                <Pressable
                    onPress={handleApply}
                    className="bg-primary-500 px-5 rounded-xl items-center justify-center"
                >
                    <Text className="text-white font-semibold">Apply</Text>
                </Pressable>
            </View>
            {error ? (
                <Text className="text-sm text-red-500 mt-2">{error}</Text>
            ) : null}
        </View>
    );
});
