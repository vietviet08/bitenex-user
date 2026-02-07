import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface FavoriteCardProps {
    readonly id: string;
    readonly name: string;
    readonly imageUrl: string;
    readonly rating: number;
    readonly category: string;
    readonly onRemove?: (id: string) => void;
}

function FavoriteCardComponent({
    id,
    name,
    imageUrl,
    rating,
    category,
    onRemove,
}: FavoriteCardProps) {
    return (
        <View className="flex-row items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Image
                source={{ uri: imageUrl }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
                contentFit="cover"
            />
            <View className="flex-1">
                <Text className="font-bold text-base text-text-primary mb-1">
                    {name}
                </Text>
                <Text className="text-sm text-text-secondary mb-2">
                    {category}
                </Text>
                <View className="flex-row items-center gap-1">
                    <IconSymbol name="star" size={16} color="#f59e0b" />
                    <Text className="text-sm font-semibold text-text-primary">
                        {rating.toFixed(1)}
                    </Text>
                </View>
            </View>
            <Pressable
                onPress={() => onRemove?.(id)}
                className="p-2 rounded-full active:bg-red-50"
            >
                <IconSymbol name="favorite" size={24} color="#ef4444" />
            </Pressable>
        </View>
    );
}

export const FavoriteCard = memo(FavoriteCardComponent);
