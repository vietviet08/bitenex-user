import React, { memo, useCallback } from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { OrderCard, type Order } from "./OrderCard";
import { EmptyOrdersState } from "./EmptyOrdersState";

interface OrdersListProps {
    readonly orders: readonly Order[];
    readonly variant: "active" | "completed" | "cancelled";
    readonly refreshing?: boolean;
    readonly onRefresh?: () => void;
}

function OrdersListComponent({
    orders,
    variant,
    refreshing = false,
    onRefresh,
}: OrdersListProps) {
    const renderItem = useCallback(
        ({ item }: { item: Order }) => (
            <OrderCard order={item} variant={variant} />
        ),
        [variant],
    );

    const keyExtractor = useCallback((item: Order) => item.id, []);

    if (orders.length === 0) {
        return <EmptyOrdersState tabType={variant} />;
    }

    return (
        <View className="flex-1">
            <FlashList
                data={orders}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ paddingVertical: 16 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

export const OrdersList = memo(OrdersListComponent);
