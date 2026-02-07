import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { OrderStatusBadge, type OrderStatus } from "./OrderStatusBadge";

export interface Order {
    id: string;
    restaurantName: string;
    restaurantImage: string;
    itemCount: number;
    distance: string;
    price: number;
    status: OrderStatus;
    createdAt: string;
}

interface OrderCardProps {
    readonly order: Order;
    readonly variant: "active" | "completed" | "cancelled";
}

function OrderCardComponent({ order, variant }: OrderCardProps) {
    const handleCancelOrder = () => {
        router.push({
            pathname: "/orders/cancel",
            params: { orderId: order.id },
        });
    };

    const handleTrackDriver = () => {
        // Future: Navigate to tracking screen
    };

    const handleLeaveReview = () => {
        // Future: Navigate to review screen
    };

    const handleOrderAgain = () => {
        // Future: Add items to cart
    };

    return (
        <View className="bg-white rounded-3xl p-4 mx-4 mb-4 shadow-sm">
            <View className="flex-row">
                {/* Restaurant Image */}
                <Image
                    source={{ uri: order.restaurantImage }}
                    className="w-24 h-24 rounded-2xl bg-gray-200"
                    contentFit="cover"
                    transition={200}
                />

                {/* Order Info */}
                <View className="flex-1 ml-4 justify-between">
                    <View>
                        <Text
                            className="text-lg font-bold text-text-primary"
                            numberOfLines={1}
                        >
                            {order.restaurantName}
                        </Text>
                        <Text className="text-sm text-text-secondary mt-1">
                            {order.itemCount} items | {order.distance}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-lg font-bold text-primary-500">
                            ${order.price.toFixed(2)}
                        </Text>
                        <OrderStatusBadge status={order.status} />
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            {variant === "active" && (
                <View className="flex-row gap-3 mt-4">
                    <Pressable
                        onPress={handleCancelOrder}
                        className="flex-1 py-3 rounded-full bg-primary-500/10 items-center active:opacity-80"
                    >
                        <Text className="text-primary-500 font-semibold">
                            Cancel Order
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleTrackDriver}
                        className="flex-1 py-3 rounded-full bg-primary-500 items-center active:opacity-80"
                    >
                        <Text className="text-white font-semibold">
                            Track Driver
                        </Text>
                    </Pressable>
                </View>
            )}

            {variant === "completed" && (
                <View className="flex-row gap-3 mt-4">
                    <Pressable
                        onPress={handleLeaveReview}
                        className="flex-1 py-3 rounded-full bg-primary-500/10 items-center active:opacity-80"
                    >
                        <Text className="text-primary-500 font-semibold">
                            Leave a Review
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleOrderAgain}
                        className="flex-1 py-3 rounded-full bg-primary-500 items-center active:opacity-80"
                    >
                        <Text className="text-white font-semibold">
                            Order Again
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

export const OrderCard = memo(OrderCardComponent);
