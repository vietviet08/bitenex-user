import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import {
    OrdersHeader,
    OrdersTabs,
    OrdersList,
    type OrderTabType,
    type Order,
    type OrderStatus,
} from "@/components/orders";
import { fetchMerchantDetail, type MerchantDto } from "@/services/merchant";
import { getMyOrders, type OrderResponse } from "@/services/order";

const FALLBACK_RESTAURANT_IMAGE =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300";

const ACTIVE_STATUSES = new Set<OrderStatus>([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "PICKING_UP",
    "DELIVERING",
]);

const COMPLETED_STATUSES = new Set<OrderStatus>(["DELIVERED"]);
const CANCELLED_STATUSES = new Set<OrderStatus>(["CANCELLED", "REFUNDED"]);

function isKnownOrderStatus(status: string): status is OrderStatus {
    return (
        ACTIVE_STATUSES.has(status as OrderStatus) ||
        COMPLETED_STATUSES.has(status as OrderStatus) ||
        CANCELLED_STATUSES.has(status as OrderStatus)
    );
}

function toOrderCard(order: OrderResponse, merchant?: MerchantDto): Order {
    return {
        id: order.id,
        restaurantName: merchant?.name ?? "Restaurant",
        restaurantImage:
            merchant?.cover_image_url ||
            merchant?.logo_url ||
            FALLBACK_RESTAURANT_IMAGE,
        itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
        distance: order.order_number,
        price: order.total,
        status: isKnownOrderStatus(order.status) ? order.status : "PENDING",
        createdAt: order.created_at,
        hasDriverReview: order.has_driver_review ?? false,
        hasMerchantReview: order.has_merchant_review ?? false,
    };
}

export default function OrdersScreen() {
    const [activeTab, setActiveTab] = useState<OrderTabType>("active");
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadOrders = useCallback(async (showInitialLoader = false) => {
        if (showInitialLoader) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            setErrorMessage(null);
            const orderList = await getMyOrders({ page: 1, per_page: 100 });
            const merchantIds = Array.from(
                new Set(orderList.items.map((order) => order.merchant_id)),
            );
            const merchantEntries = await Promise.all(
                merchantIds.map(async (merchantId) => {
                    try {
                        const merchant = await fetchMerchantDetail(merchantId);
                        return [merchantId, merchant] as const;
                    } catch {
                        return [merchantId, undefined] as const;
                    }
                }),
            );
            const merchantsById = new Map(merchantEntries);

            setOrders(
                orderList.items.map((order) =>
                    toOrderCard(order, merchantsById.get(order.merchant_id)),
                ),
            );
        } catch {
            setErrorMessage("Unable to load orders. Please try again.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadOrders(true);
        }, [loadOrders]),
    );

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            switch (activeTab) {
                case "active":
                    return ACTIVE_STATUSES.has(order.status);
                case "completed":
                    return COMPLETED_STATUSES.has(order.status);
                case "cancelled":
                    return CANCELLED_STATUSES.has(order.status);
                default:
                    return false;
            }
        });
    }, [activeTab, orders]);

    return (
        <View className="flex-1 bg-background-secondary">
            <OrdersHeader />
            <OrdersTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FE8C00" />
                </View>
            ) : errorMessage ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-center text-text-secondary">
                        {errorMessage}
                    </Text>
                    <Pressable
                        onPress={() => loadOrders(true)}
                        className="mt-4 rounded-full bg-primary-500 px-6 py-3 active:opacity-80"
                    >
                        <Text className="font-semibold text-white">Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <OrdersList
                    orders={filteredOrders}
                    variant={activeTab}
                    refreshing={isRefreshing}
                    onRefresh={() => loadOrders(false)}
                />
            )}
        </View>
    );
}
