import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

type CardType = "visa" | "mastercard" | "amex" | "other";

interface PaymentCardProps {
    readonly id: string;
    readonly type: CardType;
    readonly lastFour: string;
    readonly expiryDate: string;
    readonly isDefault?: boolean;
    readonly onPress?: (id: string) => void;
    readonly onDelete?: (id: string) => void;
}

const CARD_ICONS: Record<CardType, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    other: "💳",
};

const CARD_NAMES: Record<CardType, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    other: "Card",
};

function PaymentCardComponent({
    id,
    type,
    lastFour,
    expiryDate,
    isDefault = false,
    onPress,
    onDelete,
}: PaymentCardProps) {
    return (
        <Pressable
            onPress={() => onPress?.(id)}
            className="flex-row items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
            <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
                <Text className="text-2xl">{CARD_ICONS[type]}</Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-base text-text-primary">
                        {CARD_NAMES[type]} •••• {lastFour}
                    </Text>
                    {isDefault && (
                        <View className="px-2 py-0.5 bg-primary-100 rounded-full">
                            <Text className="text-xs font-semibold text-primary-500">
                                Default
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-sm text-text-secondary mt-1">
                    Expires {expiryDate}
                </Text>
            </View>
            <Pressable
                onPress={() => onDelete?.(id)}
                className="p-2 rounded-full active:bg-red-50"
            >
                <IconSymbol name="remove" size={20} color="#9e9e9e" />
            </Pressable>
        </Pressable>
    );
}

export const PaymentCard = memo(PaymentCardComponent);
