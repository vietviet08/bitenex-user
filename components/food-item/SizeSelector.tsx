import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { colors } from "@/theme";

export interface SizeOption {
    readonly id: string;
    readonly name: string;
    readonly priceDelta: number;
}

interface SizeSelectorProps {
    readonly sizes: SizeOption[];
    readonly selectedSizeId: string;
    readonly onSelectSize: (sizeId: string) => void;
}

export const SizeSelector = memo(function SizeSelector({
    sizes,
    selectedSizeId,
    onSelectSize,
}: SizeSelectorProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Select Size
            </Text>
            <View className="gap-2">
                {sizes.map((size) => {
                    const isSelected = size.id === selectedSizeId;
                    return (
                        <Pressable
                            key={size.id}
                            onPress={() => onSelectSize(size.id)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border ${isSelected
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-neutral-200 bg-white"
                                }`}
                        >
                            <View className="flex-row items-center gap-3">
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isSelected
                                            ? "border-primary-500"
                                            : "border-neutral-300"
                                        }`}
                                >
                                    {isSelected && (
                                        <View className="w-3 h-3 rounded-full bg-primary-500" />
                                    )}
                                </View>
                                <Text
                                    className={`text-base ${isSelected
                                            ? "font-semibold text-primary-500"
                                            : "text-neutral-900"
                                        }`}
                                >
                                    {size.name}
                                </Text>
                            </View>
                            {size.priceDelta > 0 && (
                                <Text className="text-base text-neutral-600">
                                    +${size.priceDelta.toFixed(2)}
                                </Text>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});
