import { View, Text, Pressable } from "react-native";
import { memo, useCallback } from "react";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { CartItem } from "./CartItem";
import {
    useCartStore,
    type CartItem as CartItemType,
} from "@/store/zustand/cart.store";

interface CartItemListProps {
    readonly items: CartItemType[];
}

const contentContainerStyle = { paddingHorizontal: 16 };

function EmptyCart() {
    return (
        <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">🛒</Text>
            <Text className="text-xl font-bold text-neutral-900 mb-2">
                Your cart is empty
            </Text>
            <Text className="text-base text-neutral-500 mb-6 text-center px-8">
                Add some delicious items from the menu to get started
            </Text>
            <Pressable
                onPress={() => router.push("/(tabs)")}
                className="bg-primary-500 px-6 py-3 rounded-xl"
            >
                <Text className="text-white font-semibold text-base">
                    Browse Menu
                </Text>
            </Pressable>
        </View>
    );
}

export const CartItemList = memo(function CartItemList({
    items,
}: CartItemListProps) {
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const handleIncrement = useCallback(
        (cartItemId: string, currentQuantity: number) => {
            updateQuantity(cartItemId, currentQuantity + 1);
        },
        [updateQuantity],
    );

    const handleDecrement = useCallback(
        (cartItemId: string, currentQuantity: number) => {
            updateQuantity(cartItemId, currentQuantity - 1);
        },
        [updateQuantity],
    );

    const keyExtractor = useCallback((item: CartItemType) => item.id, []);

    const renderItem = useCallback(
        ({ item }: { item: CartItemType }) => (
            <CartItem
                item={item}
                onIncrement={() => handleIncrement(item.id, item.quantity)}
                onDecrement={() => handleDecrement(item.id, item.quantity)}
            />
        ),
        [handleIncrement, handleDecrement],
    );

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <View className="flex-1">
            <FlashList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                scrollEnabled={true}
                contentContainerStyle={contentContainerStyle}
            />
        </View>
    );
});
