import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
    fetchMerchantList,
    resolveDataViewState,
    toRestaurantCardDto,
    type MerchantDto,
} from "@/services/merchant";
import { colors } from "@/theme";
import { RestaurantCard, type Restaurant } from "./RestaurantCard";

export function PopularRestaurants() {
    const [merchants, setMerchants] = useState<MerchantDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadMerchants = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const response = await fetchMerchantList({ page: 1, per_page: 20 });
            setMerchants(response.items);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to load merchants");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMerchants();
    }, [loadMerchants]);

    const restaurants = useMemo(
        () => merchants.map((merchant) => toRestaurantCardDto(merchant) as Restaurant),
        [merchants],
    );

    const viewState = resolveDataViewState({
        isLoading,
        errorMessage,
        hasData: restaurants.length > 0,
    });

    return (
        <View className="mt-5 px-4">
            <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-neutral-900">Popular Restaurants</Text>
                <Pressable hitSlop={8} onPress={loadMerchants}>
                    <Text className="text-sm font-semibold" style={{ color: colors.primary[500] }}>
                        Refresh
                    </Text>
                </Pressable>
            </View>

            {viewState === "loading" ? (
                <View className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <Text className="text-sm text-neutral-500">Loading merchants...</Text>
                </View>
            ) : null}

            {viewState === "error" ? (
                <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <Text className="text-sm text-red-600">{errorMessage}</Text>
                </View>
            ) : null}

            {viewState === "empty" ? (
                <View className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <Text className="text-sm text-neutral-500">
                        No merchants available in your area yet.
                    </Text>
                </View>
            ) : null}

            {viewState === "ready" ? (
                <View className="gap-4">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </View>
            ) : null}
        </View>
    );
}
