import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { OrderStatusBadge, type OrderStatus } from "./OrderStatusBadge";
import { formatCurrency } from "@/utils/helpers";

export interface Order {
    id: string;
    restaurantName: string;
    restaurantImage: string;
    itemCount: number;
    distance: string;
    price: number;
    status: OrderStatus;
    createdAt: string;
    hasDriverReview: boolean;
    hasMerchantReview: boolean;
}

interface OrderCardProps {
    readonly order: Order;
    readonly variant: "active" | "completed" | "cancelled";
}

function OrderCardComponent({ order, variant }: OrderCardProps) {
    const canCancel =
        order.status === "PENDING" || order.status === "CONFIRMED";
    const canTrack =
        order.status === "PICKING_UP" || order.status === "DELIVERING";
    const needsDriverReview = !order.hasDriverReview;
    const needsMerchantReview = !order.hasMerchantReview;
    const needsAnyReview = needsDriverReview || needsMerchantReview;

    const handleCancelOrder = () => {
        router.push({
            pathname: "/orders/cancel",
            params: { orderId: order.id },
        });
    };

    const handleTrackDriver = () => {
        router.push({
            pathname: "/order/tracking",
            params: { orderId: order.id },
        });
    };

    const handleChatDriver = () => {
        router.push({
            pathname: "/order/chat",
            params: { orderId: order.id },
        });
    };

    const handleLeaveReview = () => {
        if (!needsDriverReview && needsMerchantReview) {
            router.push({
                pathname: "/order/food-rating",
                params: { orderId: order.id },
            });
            return;
        }

        router.push({
            pathname: "/order/driver-rating",
            params: { orderId: order.id },
        });
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
                            {formatCurrency(order.price)}
                        </Text>
                        <OrderStatusBadge status={order.status} />
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            {variant === "active" && (
                <View className="flex-row gap-3 mt-4">
                    {canCancel && (
                        <Pressable
                            onPress={handleCancelOrder}
                            className="flex-1 py-3 rounded-full bg-primary-500/10 items-center active:opacity-80"
                        >
                            <Text className="text-primary-500 font-semibold">
                                Cancel Order
                            </Text>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={handleTrackDriver}
                        disabled={!canTrack}
                        className={`flex-1 py-3 rounded-full items-center active:opacity-80 ${
                            canTrack ? "bg-primary-500" : "bg-gray-200"
                        }`}
                    >
                        <Text
                            className={`font-semibold ${
                                canTrack ? "text-white" : "text-text-secondary"
                            }`}
                        >
                            {canTrack ? "Track Driver" : "Waiting"}
                        </Text>
                    </Pressable>
                </View>
            )}

            {variant === "active" && canTrack && (
                <Pressable
                    onPress={handleChatDriver}
                    className="mt-3 py-3 rounded-full bg-primary-500/10 items-center active:opacity-80"
                >
                    <Text className="text-primary-500 font-semibold">
                        Chat tài xế
                    </Text>
                </Pressable>
            )}

            {variant === "completed" && needsAnyReview && (
                <View className="flex-row gap-3 mt-4">
                    <Pressable
                        onPress={handleLeaveReview}
                        className="flex-1 py-3 rounded-full bg-primary-500/10 items-center active:opacity-80"
                    >
                        <Text className="text-primary-500 font-semibold">
                            {needsDriverReview && needsMerchantReview
                                ? "Leave a Review"
                                : "Complete Review"}
                        </Text>
                    </Pressable>
                </View>
            )}

            {variant === "completed" && !needsAnyReview && (
                <View className="mt-4 py-3 rounded-full bg-gray-100 items-center">
                    <Text className="text-text-secondary font-semibold">
                        Reviewed
                    </Text>
                </View>
            )}
        </View>
    );
}

export const OrderCard = memo(OrderCardComponent);
