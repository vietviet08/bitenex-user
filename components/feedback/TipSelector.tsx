import React, { memo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

export interface TipOption {
    label: string;
    amount: number;
    isCustom?: boolean;
    id?: string;
}

const DEFAULT_TIP_OPTIONS: TipOption[] = [
    { id: "tip-10k", label: "10K", amount: 10000 },
    { id: "tip-20k", label: "20K", amount: 20000 },
    { id: "tip-50k", label: "50K", amount: 50000 },
    { id: "tip-custom", label: "Other", amount: 0, isCustom: true },
];

interface TipSelectorProps {
    readonly selectedAmount: number | null;
    readonly onSelect: (amount: number) => void;
    readonly currency?: string;
    readonly options?: TipOption[];
}

interface TipButtonProps {
    readonly option: TipOption;
    readonly isSelected: boolean;
    readonly onPress: () => void;
}

function TipButton({ option, isSelected, onPress }: TipButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="flex-1"
        >
            <Animated.View
                style={animatedStyle}
                className={`items-center py-4 px-2 rounded-xl border-2 ${
                    isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 bg-white"
                }`}
            >
                <Text
                    className={`font-bold text-lg ${
                        isSelected ? "text-primary-500" : "text-text-primary"
                    }`}
                >
                    {option.label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

function TipSelectorComponent({
    selectedAmount,
    onSelect,
    currency = "₫",
    options = DEFAULT_TIP_OPTIONS,
}: TipSelectorProps) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    const handleOptionPress = (option: TipOption) => {
        if (option.isCustom) {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
            onSelect(option.amount);
        }
    };

    const handleCustomAmountChange = (text: string) => {
        // Only allow numbers
        const numericValue = text.replaceAll(/\D/g, "");
        setCustomAmount(numericValue);
        if (numericValue) {
            onSelect(Number.parseInt(numericValue, 10));
        }
    };

    const isOptionSelected = (option: TipOption) => {
        if (option.isCustom) {
            return showCustomInput;
        }
        return selectedAmount === option.amount && !showCustomInput;
    };

    return (
        <View>
            <View className="flex-row gap-3">
                {options.map((option) => (
                    <TipButton
                        key={option.id || option.label}
                        option={option}
                        isSelected={isOptionSelected(option)}
                        onPress={() => handleOptionPress(option)}
                    />
                ))}
            </View>

            {showCustomInput && (
                <View className="mt-4">
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-primary-200">
                        <Text className="text-lg text-text-secondary mr-2">
                            {currency}
                        </Text>
                        <TextInput
                            value={customAmount}
                            onChangeText={handleCustomAmountChange}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            className="flex-1 text-lg font-semibold text-text-primary"
                            autoFocus
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export const TipSelector = memo(TipSelectorComponent);
