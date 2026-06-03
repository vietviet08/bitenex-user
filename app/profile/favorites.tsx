import React, { useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, FavoriteCard } from "@/components/profile";
import { useFavoritesStore, useFavoritesLoading } from "@/store/zustand/favorites.store";
import type { FavoriteMerchantDto } from "@/services/favorite";
import { colors } from "@/theme";

export default function FavoritesScreen() {
    const { favorites, fetchFavorites } = useFavoritesStore();
    const loading = useFavoritesLoading();

    // Refresh favorites data every time this screen is focused
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const renderItem = useCallback(
        ({ item }: { item: FavoriteMerchantDto }) => {
            // Build a display category from city + delivery info
            const category = item.city || "Restaurant";

            return (
                <View className="mb-3">
                    <FavoriteCard
                        merchantId={item.merchant_id}
                        name={item.name}
                        imageUrl={item.cover_image_url ?? item.logo_url}
                        rating={item.average_rating}
                        category={category}
                    />
                </View>
            );
        },
        [],
    );

    const EmptyState = () => (
        <View className="flex-1 items-center justify-center py-24">
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🤍</Text>
            <Text
                className="text-lg font-semibold text-neutral-800 mb-2"
                style={{ textAlign: "center" }}
            >
                No favorites yet
            </Text>
            <Text
                className="text-sm text-neutral-500"
                style={{ textAlign: "center", paddingHorizontal: 32 }}
            >
                Tap the heart icon on any restaurant to save it here
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="My Favorites" />
            {loading && favorites.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            ) : (
                <FlashList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.merchant_id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<EmptyState />}
                    onRefresh={fetchFavorites}
                    refreshing={loading}
                />
            )}
        </SafeAreaView>
    );
}
