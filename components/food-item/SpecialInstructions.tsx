import { View, Text, TextInput } from "react-native";
import { memo } from "react";
import { colors } from "@/theme";

interface SpecialInstructionsProps {
    readonly value: string;
    readonly onChangeText: (text: string) => void;
}

export const SpecialInstructions = memo(function SpecialInstructions({
    value,
    onChangeText,
}: SpecialInstructionsProps) {
    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Special Instructions
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder="Add notes (e.g., allergies, spice level)"
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="p-4 border border-neutral-200 rounded-xl text-base text-neutral-900 bg-white"
                style={{ minHeight: 100 }}
            />
        </View>
    );
});
