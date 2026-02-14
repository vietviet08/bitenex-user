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
import { createOrder, cartItemsToOrderItems } from "@/services/order";

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
    const cartMerchantId = useCartStore((state) => state.merchantId);

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
        if (!cartMerchantId || items.length === 0) return;

        setIsPlacingOrder(true);
        try {
            await createOrder({
                merchant_id: cartMerchantId,
                delivery_address: MOCK_ADDRESS,
                notes: undefined,
                items: cartItemsToOrderItems(items),
            });

            clearCart();
            router.push("/order/search-driver");
        } catch (error) {
            Alert.alert(
                "Order Failed",
                error instanceof Error
                    ? error.message
                    : "Unable to place order. Please try again.",
            );
        } finally {
            setIsPlacingOrder(false);
        }
    }, [cartMerchantId, items, clearCart]);

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
