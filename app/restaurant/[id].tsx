import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { FloatingCartBar } from "@/components/restaurant/FloatingCartBar";
import { MenuCategoryTabs } from "@/components/restaurant/MenuCategoryTabs";
import { MenuItem, type MenuItemData } from "@/components/restaurant/MenuItem";
import { RestaurantHeaderActions } from "@/components/restaurant/RestaurantHeaderActions";
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { RestaurantInfo, type PromoTag } from "@/components/restaurant/RestaurantInfo";
import { ReviewSummaryCard } from "@/components/restaurant/ReviewSummaryCard";
import {
    fetchMerchantDetail,
    fetchMerchantMenu,
    resolveDataViewState,
    type MenuItemDto,
    type MerchantDto,
} from "@/services/merchant";
import { useReviewSummary } from "@/hooks/useReviewSummary";

type MenuSection = {
    category: string;
    items: MenuItemData[];
};

function toMenuItem(item: MenuItemDto, merchantId: string): MenuItemData {
    return {
        id: item.id,
        merchantId,
        name: item.name,
        description: item.description || "No description",
        price: item.price,
        image: item.image_url || undefined,
        category: item.category || "Other",
    };
}

function groupByCategory(items: MenuItemData[]): MenuSection[] {
    const map = new Map<string, MenuItemData[]>();
    for (const item of items) {
        const category = item.category || "Other";
        const existing = map.get(category);
        if (existing) {
            existing.push(item);
        } else {
            map.set(category, [item]);
        }
    }
    return Array.from(map.entries()).map(([category, groupedItems]) => ({
        category,
        items: groupedItems,
    }));
}

export default function RestaurantDetailScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const merchantId = typeof params.id === "string" ? params.id : "";

    const [merchant, setMerchant] = useState<MerchantDto | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // AI Review Summary
    const {
        summary: reviewSummary,
        isLoading: summaryLoading,
        error: summaryError,
        loadSummary,
    } = useReviewSummary();

    const load = useCallback(async () => {
        if (!merchantId) {
            setErrorMessage("Missing merchant ID");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        try {
            const [merchantResponse, menuResponse] = await Promise.all([
                fetchMerchantDetail(merchantId),
                fetchMerchantMenu(merchantId, { available_only: true }),
            ]);
            setMerchant(merchantResponse);
            setMenuItems(menuResponse.map((item) => toMenuItem(item, merchantId)));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to load merchant");
        } finally {
            setIsLoading(false);
        }
    }, [merchantId]);

    useEffect(() => {
        load();
    }, [load]);

    // Load AI summary after merchant data is ready
    useEffect(() => {
        if (merchantId && !isLoading && !errorMessage) {
            loadSummary(merchantId);
        }
    }, [merchantId, isLoading, errorMessage, loadSummary]);

    const sections = useMemo(() => groupByCategory(menuItems), [menuItems]);
    const categories = useMemo(() => sections.map((section) => section.category), [sections]);
    const selectedCategory = sections[activeCategoryIndex];

    const viewState = resolveDataViewState({
        isLoading,
        errorMessage,
        hasData: merchant !== null,
    });

    const promoTags: PromoTag[] = [
        {
            id: "delivery",
            icon: "local-shipping",
            text: `Delivery fee $${merchant?.delivery_fee.toFixed(2) ?? "0.00"}`,
            variant: "primary",
        },
        {
            id: "minimum",
            icon: "local-offer",
            text: `Min order $${merchant?.min_order_amount.toFixed(2) ?? "0.00"}`,
            variant: "red",
        },
    ];

    return (
        <View className="flex-1 bg-white">
            {merchant ? (
                <RestaurantHero imageUrl={merchant.cover_image_url || merchant.logo_url || undefined} />
            ) : null}

            <RestaurantHeaderActions />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                {viewState === "loading" ? (
                    <View className="items-center justify-center py-16">
                        <ActivityIndicator color="#3B82F6" />
                        <Text className="mt-3 text-sm text-neutral-500">Loading merchant...</Text>
                    </View>
                ) : null}

                {viewState === "error" ? (
                    <View className="px-5 py-16">
                        <Text className="text-sm text-red-600">{errorMessage}</Text>
                        <Pressable
                            onPress={load}
                            className="mt-4 w-32 rounded-xl bg-primary-500 px-4 py-3"
                        >
                            <Text className="text-center text-sm font-semibold text-white">
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                {viewState === "ready" && merchant ? (
                    <View className="bg-white pt-5">
                        <View className="px-5">
                            <RestaurantInfo
                                name={merchant.name}
                                rating={Number(merchant.average_rating || 0)}
                                reviewCount={`${merchant.total_orders} orders`}
                                cuisine={`${merchant.city} cuisine`}
                                priceLevel="$$"
                                deliveryTime={`${merchant.estimated_prep_time}m`}
                                tags={promoTags}
                            />
                        </View>

                        {/* ── AI Review Summary ── */}
                        <ReviewSummaryCard
                            summary={reviewSummary}
                            isLoading={summaryLoading}
                            error={summaryError}
                            onRefresh={() => loadSummary(merchantId, true)}
                        />

                        <View className="px-5">
                            <MenuCategoryTabs
                                categories={categories}
                                activeIndex={activeCategoryIndex}
                                onSelect={setActiveCategoryIndex}
                            />

                            {menuItems.length === 0 ? (
                                <View className="py-8">
                                    <Text className="text-sm text-neutral-500">
                                        This merchant has no available menu items right now.
                                    </Text>
                                </View>
                            ) : (
                                <View className="mt-5 gap-8">
                                    {selectedCategory ? (
                                        <View>
                                            <Text className="mb-4 text-xl font-bold text-neutral-900">
                                                {selectedCategory.category}
                                            </Text>
                                            <View className="gap-6">
                                                {selectedCategory.items.map((item, index) => (
                                                    <View key={item.id}>
                                                        <MenuItem item={item} />
                                                        {index < selectedCategory.items.length - 1 ? (
                                                            <View className="mt-5 h-px bg-neutral-100" />
                                                        ) : null}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                            )}
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <FloatingCartBar itemCount={0} total={0} />
        </View>
    );
}
