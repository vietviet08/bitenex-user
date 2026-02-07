import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";

export type OrderTabType = "active" | "completed" | "cancelled";

interface OrdersTabsProps {
    readonly activeTab: OrderTabType;
    readonly onTabChange: (tab: OrderTabType) => void;
}

const TABS: { id: OrderTabType; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
];

function OrdersTabsComponent({ activeTab, onTabChange }: OrdersTabsProps) {
    return (
        <View className="flex-row bg-white border-b border-border-light">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <Pressable
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        className="flex-1 py-4 items-center"
                    >
                        <Text
                            className={`text-base font-semibold ${
                                isActive
                                    ? "text-primary-500"
                                    : "text-text-secondary"
                            }`}
                        >
                            {tab.label}
                        </Text>
                        {isActive && (
                            <View className="absolute bottom-0 left-4 right-4 h-1 bg-primary-500 rounded-full" />
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

export const OrdersTabs = memo(OrdersTabsComponent);
