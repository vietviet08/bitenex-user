import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface OrdersHeaderProps {
    readonly onSearchPress?: () => void;
}

function OrdersHeaderComponent({ onSearchPress }: OrdersHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white px-6 pb-4 flex-row items-center justify-between"
            style={{ paddingTop: insets.top + 16 }}
        >
            <View className="flex-row items-center gap-3">
                <IconSymbol name="lunch-dining" size={28} color="#1AB65C" />
                <Text className="text-2xl font-bold text-text-primary">
                    Orders
                </Text>
            </View>
            <Pressable
                onPress={onSearchPress}
                className="p-2 rounded-full active:bg-gray-100"
            >
                <IconSymbol name="search" size={24} color="#212121" />
            </Pressable>
        </View>
    );
}

export const OrdersHeader = memo(OrdersHeaderComponent);
