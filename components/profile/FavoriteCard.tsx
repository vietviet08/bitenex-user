import React, { memo, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFavoritesStore } from "@/store/zustand/favorites.store";
import { resolveImageUrl } from "@/utils/helpers";

interface FavoriteCardProps {
    readonly merchantId: string;
    readonly name: string;
    readonly imageUrl?: string | null;
    readonly rating: number;
    readonly category: string;
}

function FavoriteCardComponent({
    merchantId,
    name,
    imageUrl,
    rating,
    category,
}: FavoriteCardProps) {
    const router = useRouter();
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

    const handleRemove = useCallback(() => {
        toggleFavorite(merchantId);
    }, [merchantId, toggleFavorite]);

    const handleCardPress = useCallback(() => {
        router.push(`/restaurant/${merchantId}` as any);
    }, [merchantId, router]);

    const resolvedImage = resolveImageUrl(imageUrl);

    return (
        <Pressable
            onPress={handleCardPress}
            className="flex-row items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:opacity-80"
        >
            <View style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", backgroundColor: "#f3f4f6" }}>
                {resolvedImage ? (
                    <Image
                        source={{ uri: resolvedImage }}
                        style={{ width: 80, height: 80 }}
                        contentFit="cover"
                    />
                ) : (
                    <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 32 }}>🍽️</Text>
                    </View>
                )}
            </View>
            <View className="flex-1">
                <Text className="font-bold text-base text-text-primary mb-1" numberOfLines={1}>
                    {name}
                </Text>
                <Text className="text-sm text-text-secondary mb-2" numberOfLines={1}>
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
                onPress={handleRemove}
                className="p-2 rounded-full active:bg-red-50"
                hitSlop={8}
            >
                <IconSymbol name="favorite" size={24} color="#ef4444" />
            </Pressable>
        </Pressable>
    );
}

export const FavoriteCard = memo(FavoriteCardComponent);
