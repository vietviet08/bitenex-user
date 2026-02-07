import { View, ScrollView, Alert } from "react-native";
import { useState, useCallback } from "react";
import { router } from "expo-router";

import {
    CheckoutHeader,
    DeliveryAddressCard,
    DeliveryTimeSelector,
    PaymentMethodCard,
    OrderItemsSummary,
    PriceSummary,
    PlaceOrderButton,
    type DeliveryTimeOption,
} from "@/components/checkout";
import {
    useCartStore,
    useCartItems,
    useCartSubtotal,
    useCartDiscount,
    useDeliveryFee,
} from "@/store/zustand/cart.store";

// Mock data
const DELIVERY_TIME_OPTIONS: DeliveryTimeOption[] = [
    { id: "asap", label: "ASAP", sublabel: "30-45 minutes" },
    { id: "schedule", label: "Schedule for later", sublabel: "Choose a time" },
];

const MOCK_ADDRESS = "123 Main Street, Apt 4B\nNew York, NY 10001";
const MOCK_CARD_TYPE = "Visa";
const MOCK_CARD_LAST_FOUR = "4242";
const TAX_RATE = 0.08; // 8% tax

export default function CheckoutScreen() {
    const items = useCartItems();
    const subtotal = useCartSubtotal();
    const discount = useCartDiscount();
    const deliveryFee = useDeliveryFee();
    const clearCart = useCartStore((state) => state.clearCart);

    // Local state for checkout options
    const [selectedTimeId, setSelectedTimeId] = useState("asap");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Calculate totals
    const discountAmount = subtotal * discount;
    const taxes = (subtotal - discountAmount) * TAX_RATE;
    const total = subtotal - discountAmount + deliveryFee + taxes;

    const handleSelectTime = useCallback((id: string) => {
        setSelectedTimeId(id);
    }, []);

    const handleEditAddress = useCallback(() => {
        // TODO: Navigate to address selection
        Alert.alert("Edit Address", "Address selection coming soon!");
    }, []);

    const handleChangePayment = useCallback(() => {
        // TODO: Navigate to payment method selection
        Alert.alert("Change Payment", "Payment method selection coming soon!");
    }, []);

    const handlePlaceOrder = useCallback(async () => {
        setIsPlacingOrder(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear cart and navigate to confirmation
        clearCart();
        setIsPlacingOrder(false);

        Alert.alert(
            "Order Placed! 🎉",
            "Your order has been placed successfully. You will receive a confirmation shortly.",
            [
                {
                    text: "OK",
                    onPress: () => router.replace("/(tabs)"),
                },
            ],
        );
    }, [clearCart]);

    return (
        <View className="flex-1 bg-white">
            <CheckoutHeader />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <DeliveryAddressCard
                    address={MOCK_ADDRESS}
                    onEdit={handleEditAddress}
                />

                <View className="h-2 bg-neutral-100" />

                <DeliveryTimeSelector
                    options={DELIVERY_TIME_OPTIONS}
                    selectedId={selectedTimeId}
                    onSelect={handleSelectTime}
                />

                <View className="h-2 bg-neutral-100" />

                <PaymentMethodCard
                    cardType={MOCK_CARD_TYPE}
                    lastFourDigits={MOCK_CARD_LAST_FOUR}
                    onChangePayment={handleChangePayment}
                />

                <View className="h-2 bg-neutral-100" />

                <OrderItemsSummary items={items} />

                <View className="h-2 bg-neutral-100" />

                <PriceSummary
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    discount={discount}
                    taxes={taxes}
                    total={total}
                />
            </ScrollView>

            <PlaceOrderButton
                total={total}
                onPlaceOrder={handlePlaceOrder}
                isLoading={isPlacingOrder}
            />
        </View>
    );
}
