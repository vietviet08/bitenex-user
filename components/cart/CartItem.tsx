import { View, Text, Pressable, StyleSheet } from "react-native";
import { memo } from "react";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";
import type { CartItem as CartItemType } from "@/store/zustand/cart.store";

interface CartItemProps {
    readonly item: CartItemType;
    readonly onIncrement: () => void;
    readonly onDecrement: () => void;
}

export const CartItem = memo(function CartItem({
    item,
    onIncrement,
    onDecrement,
}: CartItemProps) {
    const { name, image, basePrice, quantity, customization, lineTotal } = item;
    const isDecrementDisabled = quantity <= 1;

    // Build customization string
    const customizationText = [
        customization.sizeName,
        ...customization.addOnNames,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <View className="flex-row gap-3 py-4 border-b border-neutral-100">
            {/* Image */}
            <View style={styles.imageContainer}>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-full h-full rounded-xl bg-neutral-100 items-center justify-center">
                        <Text className="text-3xl">🍽️</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View className="flex-1 justify-between">
                <View>
                    <Text
                        className="text-base font-semibold text-neutral-900"
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    {customizationText && (
                        <Text
                            className="text-sm text-neutral-500 mt-0.5"
                            numberOfLines={1}
                        >
                            {customizationText}
                        </Text>
                    )}
                    <Text className="text-sm text-neutral-600 mt-1">
                        ${basePrice.toFixed(2)} each
                    </Text>
                </View>

                {/* Quantity controls + line total */}
                <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center gap-2 bg-neutral-100 rounded-lg px-1 py-0.5">
                        <Pressable
                            onPress={onDecrement}
                            className={`w-7 h-7 rounded items-center justify-center ${
                                isDecrementDisabled
                                    ? "bg-neutral-200"
                                    : "bg-white"
                            }`}
                        >
                            <IconSymbol
                                name="remove"
                                size={18}
                                color={
                                    isDecrementDisabled
                                        ? colors.neutral[400]
                                        : colors.neutral[800]
                                }
                            />
                        </Pressable>
                        <Text className="text-base font-semibold text-neutral-900 min-w-[20px] text-center">
                            {quantity}
                        </Text>
                        <Pressable
                            onPress={onIncrement}
                            className="w-7 h-7 rounded bg-white items-center justify-center"
                        >
                            <IconSymbol
                                name="add"
                                size={18}
                                color={colors.neutral[800]}
                            />
                        </Pressable>
                    </View>
                    <Text className="text-base font-bold text-neutral-900">
                        ${lineTotal.toFixed(2)}
                    </Text>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    imageContainer: {
        width: 80,
        height: 80,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
});
