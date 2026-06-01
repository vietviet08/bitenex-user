import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, FavoriteCard } from "@/components/profile";

interface Favorite {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    category: string;
}

const MOCK_FAVORITES: Favorite[] = [
    {
        id: "1",
        name: "Pizza Palace",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
        rating: 4.8,
        category: "Italian • Pizza",
    },
    {
        id: "2",
        name: "Burger King",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
        rating: 4.5,
        category: "American • Burgers",
    },
    {
        id: "3",
        name: "Sushi Master",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200",
        rating: 4.9,
        category: "Japanese • Sushi",
    },
    {
        id: "4",
        name: "Taco Bell",
        imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200",
        rating: 4.3,
        category: "Mexican • Tacos",
    },
];

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState(MOCK_FAVORITES);

    const handleRemove = useCallback((id: string) => {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: Favorite }) => (
            <View className="mb-3">
                <FavoriteCard
                    id={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl}
                    rating={item.rating}
                    category={item.category}
                    onRemove={handleRemove}
                />
            </View>
        ),
        [handleRemove]
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="My Favorites" />
            <FlashList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
