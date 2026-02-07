import React, { memo } from "react";
import { View, Text } from "react-native";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";

type NotificationType = "success" | "cancelled" | "info" | "promo" | "account";

interface NotificationItemProps {
    readonly id: string;
    readonly type: NotificationType;
    readonly title: string;
    readonly message: string;
    readonly timestamp: string;
    readonly isNew?: boolean;
}

const TYPE_CONFIG: Record<
    NotificationType,
    { icon: IconSymbolName; bgColor: string; iconColor: string }
> = {
    success: {
        icon: "security",
        bgColor: "bg-green-100",
        iconColor: "#22c55e",
    },
    cancelled: {
        icon: "remove",
        bgColor: "bg-red-100",
        iconColor: "#ef4444",
    },
    info: {
        icon: "star",
        bgColor: "bg-yellow-100",
        iconColor: "#eab308",
    },
    promo: {
        icon: "local-offer",
        bgColor: "bg-orange-100",
        iconColor: "#f97316",
    },
    account: {
        icon: "person",
        bgColor: "bg-emerald-100",
        iconColor: "#10b981",
    },
};

function NotificationItemComponent({
    title,
    message,
    timestamp,
    type,
    isNew = false,
}: NotificationItemProps) {
    const config = TYPE_CONFIG[type];

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm flex-row gap-4">
            <View
                className={`w-12 h-12 rounded-full items-center justify-center ${config.bgColor}`}
            >
                <IconSymbol
                    name={config.icon}
                    size={24}
                    color={config.iconColor}
                />
            </View>
            <View className="flex-1">
                <View className="flex-row items-start justify-between mb-1">
                    <Text className="font-bold text-base text-text-primary flex-1 pr-2">
                        {title}
                    </Text>
                    {isNew && (
                        <View className="bg-primary-500 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs font-semibold">
                                New
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-xs text-text-secondary mb-2">
                    {timestamp}
                </Text>
                <Text className="text-sm text-text-secondary leading-5">
                    {message}
                </Text>
            </View>
        </View>
    );
}

export const NotificationItem = memo(NotificationItemComponent);
