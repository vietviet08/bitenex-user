import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
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
            className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
            onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
        >
            <View className="relative w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                <View style={{ aspectRatio: 2, width: "100%" }}>
                    {restaurant.image ? (
                        <Image
                            source={{ uri: restaurant.image }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <Text className="text-5xl">🍽️</Text>
                        </View>
                    )}
                </View>

                <View className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-neutral-800">
                        {restaurant.deliveryTime}
                    </Text>
                </View>

                <Pressable className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90">
                    <IconSymbol
                        name={restaurant.isFavorite ? "favorite" : "favorite-border"}
                        size={18}
                        color={restaurant.isFavorite ? colors.error : colors.neutral[500]}
                    />
                </Pressable>
            </View>

            <View className="mt-3">
                <View className="flex-row items-center justify-between">
                    <View className="mr-2 flex-1 flex-row items-center">
                        <Text
                            className="text-base font-bold text-neutral-900"
                            numberOfLines={1}
                        >
                            {restaurant.name}
                        </Text>
                        <View
                            className="mx-1.5 h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: colors.primary[500] }}
                        />
                    </View>

                    <View
                        className={`flex-row items-center rounded-full px-2 py-0.5 ${
                            isHighRated ? "bg-green-50" : "bg-neutral-100"
                        }`}
                    >
                        <IconSymbol
                            name="star-rate"
                            size={12}
                            color={isHighRated ? "#16A34A" : colors.neutral[600]}
                        />
                        <Text
                            className={`ml-0.5 text-xs font-bold ${
                                isHighRated ? "text-green-700" : "text-neutral-700"
                            }`}
                        >
                            {restaurant.rating.toFixed(1)}
                        </Text>
                    </View>
                </View>

                <Text className="mt-0.5 text-sm text-neutral-500" numberOfLines={1}>
                    {restaurant.cuisine.join(" • ")}
                </Text>
            </View>

            <View className="mt-3 flex-row items-center border-t border-neutral-100 pt-3">
                <IconSymbol name="delivery-dining" size={14} color={colors.neutral[500]} />
                <Text className="ml-1 text-xs text-neutral-500">{restaurant.deliveryFee} delivery</Text>

                {restaurant.promoText ? (
                    <>
                        <View className="mx-2 h-1 w-1 rounded-full bg-neutral-300" />
                        <IconSymbol name="sell" size={14} color={colors.primary[500]} />
                        <Text className="ml-1 text-xs font-medium text-primary-500">
                            {restaurant.promoText}
                        </Text>
                    </>
                ) : null}
            </View>
        </Pressable>
    );
});
