import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { formatCurrency } from "@/utils/helpers";

export interface AddOnOption {
    readonly id: string;
    readonly name: string;
    readonly price: number;
}

interface CustomizeSectionProps {
    readonly addOns: AddOnOption[];
    readonly selectedAddOnIds: string[];
    readonly onToggleAddOn: (addOnId: string) => void;
    readonly label?: string;
}

export const CustomizeSection = memo(function CustomizeSection({
    addOns,
    selectedAddOnIds,
    onToggleAddOn,
    label,
}: CustomizeSectionProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                {label ?? "Customize your order"}
            </Text>
            <View className="gap-2">
                {addOns.map((addOn) => {
                    const isSelected = selectedAddOnIds.includes(addOn.id);
                    return (
                        <Pressable
                            key={addOn.id}
                            onPress={() => onToggleAddOn(addOn.id)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border ${isSelected
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-neutral-200 bg-white"
                                }`}
                        >
                            <View className="flex-row items-center gap-3">
                                <View
                                    className={`w-5 h-5 rounded border-2 items-center justify-center ${isSelected
                                            ? "border-primary-500 bg-primary-500"
                                            : "border-neutral-300"
                                        }`}
                                >
                                    {isSelected && (
                                        <Text className="text-white text-xs font-bold">✓</Text>
                                    )}
                                </View>
                                <Text
                                    className={`text-base ${isSelected
                                            ? "font-semibold text-primary-500"
                                            : "text-neutral-900"
                                        }`}
                                >
                                    {addOn.name}
                                </Text>
                            </View>
                            <Text className="text-base text-neutral-600">
                                +{formatCurrency(addOn.price)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});
