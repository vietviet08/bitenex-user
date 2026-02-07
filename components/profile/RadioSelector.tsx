import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface RadioOption {
    readonly id: string;
    readonly label: string;
    readonly sublabel?: string;
}

interface RadioSelectorProps {
    readonly options: readonly RadioOption[];
    readonly selectedId: string;
    readonly onSelect: (id: string) => void;
}

function RadioSelectorComponent({
    options,
    selectedId,
    onSelect,
}: RadioSelectorProps) {
    return (
        <View className="space-y-1">
            {options.map((option) => {
                const isSelected = option.id === selectedId;
                return (
                    <Pressable
                        key={option.id}
                        onPress={() => onSelect(option.id)}
                        className="flex-row items-center justify-between py-4 px-4 rounded-xl active:bg-gray-50"
                    >
                        <View className="flex-1">
                            <Text className="font-semibold text-[15px] text-text-primary">
                                {option.label}
                            </Text>
                            {option.sublabel && (
                                <Text className="text-sm text-text-secondary mt-0.5">
                                    {option.sublabel}
                                </Text>
                            )}
                        </View>
                        <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                                    ? "border-primary-500 bg-primary-500"
                                    : "border-gray-300"
                                }`}
                        >
                            {isSelected && (
                                <View className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export const RadioSelector = memo(RadioSelectorComponent);
