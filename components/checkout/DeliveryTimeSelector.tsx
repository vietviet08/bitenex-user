import { View, Text, Pressable } from "react-native";
import { memo } from "react";

export interface DeliveryTimeOption {
    readonly id: string;
    readonly label: string;
    readonly sublabel?: string;
}

interface DeliveryTimeSelectorProps {
    readonly options: DeliveryTimeOption[];
    readonly selectedId: string;
    readonly onSelect: (id: string) => void;
}

export const DeliveryTimeSelector = memo(function DeliveryTimeSelector({
    options,
    selectedId,
    onSelect,
}: DeliveryTimeSelectorProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Delivery Time
            </Text>

            <View className="gap-2">
                {options.map((option) => {
                    const isSelected = option.id === selectedId;
                    return (
                        <Pressable
                            key={option.id}
                            onPress={() => onSelect(option.id)}
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
                                <View>
                                    <Text
                                        className={`text-base ${isSelected
                                                ? "font-semibold text-primary-600"
                                                : "text-neutral-900"
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    {option.sublabel && (
                                        <Text className="text-sm text-neutral-500 mt-0.5">
                                            {option.sublabel}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});
