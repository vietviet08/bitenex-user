import { View, Text, Pressable } from "react-native";
import React, { memo } from "react";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

export type Restaurant = {
    id: string;
    name: string;
    cuisine: string[];
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    promoText?: string;
    image?: string;
    isFavorite?: boolean;
};

export const RestaurantCard = memo(function RestaurantCard({
    restaurant,
}: {
    restaurant: Restaurant;
}) {
    const router = useRouter();
    const isHighRated = restaurant.rating >= 4.7;

    return (
        <Pressable
            className="border border-neutral-200 rounded-2xl bg-white p-3 shadow-sm"
            onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
        >
            {/* Image area */}
            <View
                className="w-full rounded-xl bg-neutral-100 items-center justify-center overflow-hidden relative"
                style={{ aspectRatio: 2 }}
            >
                <Text className="text-5xl">🍽️</Text>

                {/* Time badge — top left */}
                <View className="absolute top-2 left-2 bg-white/90 px-2.5 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-neutral-800">
                        {restaurant.deliveryTime}
                    </Text>
                </View>

                {/* Favorite heart — top right */}
                <Pressable className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center">
                    <IconSymbol
                        name={
                            restaurant.isFavorite
                                ? "favorite"
                                : "favorite-border"
                        }
                        size={18}
                        color={
                            restaurant.isFavorite
                                ? colors.error
                                : colors.neutral[500]
                        }
                    />
                </Pressable>
            </View>

            {/* Info section */}
            <View className="mt-3">
                {/* Name row */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Text
                            className="text-base font-bold text-neutral-900"
                            numberOfLines={1}
                        >
                            {restaurant.name}
                        </Text>
                        <View
                            className="w-1.5 h-1.5 rounded-full mx-1.5"
                            style={{ backgroundColor: colors.primary[500] }}
                        />
                    </View>

                    {/* Rating pill */}
                    <View
                        className={`flex-row items-center px-2 py-0.5 rounded-full ${
                            isHighRated ? "bg-green-50" : "bg-neutral-100"
                        }`}
                    >
                        <IconSymbol
                            name="star-rate"
                            size={12}
                            color={
                                isHighRated ? "#16A34A" : colors.neutral[600]
                            }
                        />
                        <Text
                            className={`text-xs font-bold ml-0.5 ${
                                isHighRated
                                    ? "text-green-700"
                                    : "text-neutral-700"
                            }`}
                        >
                            {restaurant.rating}
                        </Text>
                    </View>
                </View>

                {/* Cuisine tags */}
                <Text
                    className="text-sm text-neutral-500 mt-0.5"
                    numberOfLines={1}
                >
                    {restaurant.cuisine.join(" • ")}
                </Text>
            </View>

            {/* Footer */}
            <View className="flex-row items-center mt-3 pt-3 border-t border-neutral-100">
                <IconSymbol
                    name="delivery-dining"
                    size={14}
                    color={colors.neutral[500]}
                />
                <Text className="text-xs text-neutral-500 ml-1">
                    {restaurant.deliveryFee} delivery
                </Text>

                {restaurant.promoText != null &&
                    restaurant.promoText !== "" && (
                        <>
                            <View className="w-1 h-1 bg-neutral-300 rounded-full mx-2" />
                            <IconSymbol
                                name="sell"
                                size={14}
                                color={colors.primary[500]}
                            />
                            <Text
                                className="text-xs font-medium ml-1"
                                style={{ color: colors.primary[500] }}
                            >
                                {restaurant.promoText}
                            </Text>
                        </>
                    )}
            </View>
        </Pressable>
    );
});
