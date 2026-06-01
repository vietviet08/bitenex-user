import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, PaymentCard } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface PaymentMethod {
    id: string;
    type: "visa" | "mastercard" | "amex" | "other";
    lastFour: string;
    expiryDate: string;
    isDefault: boolean;
}

const MOCK_PAYMENTS: PaymentMethod[] = [
    {
        id: "1",
        type: "visa",
        lastFour: "4242",
        expiryDate: "12/25",
        isDefault: true,
    },
    {
        id: "2",
        type: "mastercard",
        lastFour: "8888",
        expiryDate: "06/26",
        isDefault: false,
    },
];

export default function PaymentMethodsScreen() {
    const [payments, setPayments] = useState(MOCK_PAYMENTS);

    const handleDelete = useCallback((id: string) => {
        setPayments((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const handlePress = useCallback((id: string) => {
        // Future: show payment details or set as default
        console.log("Payment pressed:", id);
    }, []);

    const handleAddCard = () => {
        // Future: navigate to add card screen
        console.log("Add new card");
    };

    const renderItem = useCallback(
        ({ item }: { item: PaymentMethod }) => (
            <View className="mb-3">
                <PaymentCard
                    id={item.id}
                    type={item.type}
                    lastFour={item.lastFour}
                    expiryDate={item.expiryDate}
                    isDefault={item.isDefault}
                    onPress={handlePress}
                    onDelete={handleDelete}
                />
            </View>
        ),
        [handlePress, handleDelete]
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Payment Methods" />
            <FlashList
                data={payments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <Pressable
                        onPress={handleAddCard}
                        className="flex-row items-center justify-center gap-2 py-4 mt-2 bg-white rounded-2xl border border-dashed border-gray-300 active:bg-gray-50"
                    >
                        <IconSymbol name="add" size={24} color="#22c55e" />
                        <Text className="font-semibold text-primary-500">
                            Add New Card
                        </Text>
                    </Pressable>
                }
            />
        </SafeAreaView>
    );
}
