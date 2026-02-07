import React, { memo } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface PromoCardProps {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly discountText: string;
    readonly code: string;
    readonly expiryDate: string;
    readonly imageUrl?: string;
}

function PromoCardComponent({
    title,
    description,
    discountText,
    code,
    expiryDate,
    imageUrl,
}: PromoCardProps) {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(code);
        Alert.alert("Copied!", `Promo code "${code}" copied to clipboard`);
    };

    return (
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: "100%", height: 120 }}
                    contentFit="cover"
                />
            )}
            <View className="p-4">
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                        <Text className="font-bold text-lg text-text-primary mb-1">
                            {title}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                            {description}
                        </Text>
                    </View>
                    <View className="bg-primary-100 px-3 py-1.5 rounded-lg">
                        <Text className="text-primary-600 font-bold text-sm">
                            {discountText}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center gap-2">
                        <View className="bg-gray-100 px-3 py-1.5 rounded-lg border border-dashed border-gray-300">
                            <Text className="font-mono font-bold text-text-primary">
                                {code}
                            </Text>
                        </View>
                        <Pressable
                            onPress={handleCopy}
                            className="p-2 rounded-lg bg-primary-50 active:bg-primary-100"
                        >
                            <IconSymbol name="info" size={18} color="#22c55e" />
                        </Pressable>
                    </View>
                    <Text className="text-xs text-text-secondary">
                        Expires: {expiryDate}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export const PromoCard = memo(PromoCardComponent);
