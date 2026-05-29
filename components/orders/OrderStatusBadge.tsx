import React, { memo } from "react";
import { View, Text } from "react-native";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "PICKING_UP"
    | "DELIVERING"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";

interface OrderStatusBadgeProps {
    readonly status: OrderStatus;
}

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; bgClass: string; textClass: string; borderClass?: string }
> = {
    PENDING: {
        label: "Pending",
        bgClass: "bg-yellow-500/10",
        textClass: "text-yellow-600",
    },
    CONFIRMED: {
        label: "Confirmed",
        bgClass: "bg-primary-500/10",
        textClass: "text-primary-500",
    },
    PREPARING: {
        label: "Preparing",
        bgClass: "bg-primary-500/10",
        textClass: "text-primary-500",
    },
    READY: {
        label: "Ready",
        bgClass: "bg-blue-500/10",
        textClass: "text-blue-500",
    },
    PICKING_UP: {
        label: "Picking Up",
        bgClass: "bg-blue-500/10",
        textClass: "text-blue-500",
    },
    DELIVERING: {
        label: "Delivering",
        bgClass: "bg-blue-500/10",
        textClass: "text-blue-500",
    },
    DELIVERED: {
        label: "Delivered",
        bgClass: "bg-primary-500",
        textClass: "text-white",
    },
    CANCELLED: {
        label: "Cancelled",
        bgClass: "bg-transparent",
        textClass: "text-red-500",
        borderClass: "border border-red-500",
    },
    REFUNDED: {
        label: "Refunded",
        bgClass: "bg-transparent",
        textClass: "text-red-500",
        borderClass: "border border-red-500",
    },
};

function OrderStatusBadgeComponent({ status }: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <View
            className={`px-3 py-1 rounded-lg ${config.bgClass} ${config.borderClass || ""}`}
        >
            <Text className={`text-xs font-semibold ${config.textClass}`}>
                {config.label}
            </Text>
        </View>
    );
}

export const OrderStatusBadge = memo(OrderStatusBadgeComponent);
