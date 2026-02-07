import React, { memo } from "react";
import { View, Text } from "react-native";

export type OrderStatus =
    | "paid"
    | "preparing"
    | "delivering"
    | "completed"
    | "cancelled";

interface OrderStatusBadgeProps {
    readonly status: OrderStatus;
}

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; bgClass: string; textClass: string; borderClass?: string }
> = {
    paid: {
        label: "Paid",
        bgClass: "bg-primary-500",
        textClass: "text-white",
    },
    preparing: {
        label: "Preparing",
        bgClass: "bg-primary-500/10",
        textClass: "text-primary-500",
    },
    delivering: {
        label: "Delivering",
        bgClass: "bg-blue-500/10",
        textClass: "text-blue-500",
    },
    completed: {
        label: "Completed",
        bgClass: "bg-primary-500",
        textClass: "text-white",
    },
    cancelled: {
        label: "Cancelled",
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
