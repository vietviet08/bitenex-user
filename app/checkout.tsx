import { View, ScrollView, Alert, Linking } from "react-native";
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
import { usePaymentStore } from "@/store/zustand/payment.store";
import { useDeliveryLocation } from "@/store/zustand/checkout.store";
import { createOrder, cartItemsToOrderItems } from "@/services/order";
import {
    createPayment,
    generateIdempotencyKey,
    type PaymentResponse,
} from "@/services/payment";

// Mock data
const DELIVERY_TIME_OPTIONS: DeliveryTimeOption[] = [
    { id: "asap", label: "ASAP", sublabel: "30-45 minutes" },
    { id: "schedule", label: "Schedule for later", sublabel: "Choose a time" },
];

export default function CheckoutScreen() {
    const items = useCartItems();
    const subtotal = useCartSubtotal();
    const discount = useCartDiscount();
    const deliveryFee = useDeliveryFee();
    const cartMerchantId = useCartStore((state) => state.merchantId);
    const setPendingPayment = usePaymentStore((state) => state.setPendingPayment);
    const deliveryLocation = useDeliveryLocation();

    // Local state for checkout options
    const [selectedTimeId, setSelectedTimeId] = useState("asap");
    const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "CASH">("VNPAY");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Calculate totals
    const taxes = 0;
    const total = subtotal + deliveryFee;

    const handleSelectTime = useCallback((id: string) => {
        setSelectedTimeId(id);
    }, []);

    const handleEditAddress = useCallback(() => {
        router.push("/checkout/address-picker");
    }, []);

    const handleChangePayment = useCallback(() => {
        Alert.alert(
            "Select Payment Method",
            "Choose your preferred payment method",
            [
                { text: "VNPAY", onPress: () => setPaymentMethod("VNPAY") },
                { text: "Cash on Delivery", onPress: () => setPaymentMethod("CASH") },
                { text: "Cancel", style: "cancel" },
            ]
        );
    }, []);

    const handlePlaceOrder = useCallback(async () => {
        if (!cartMerchantId || items.length === 0) return;
        if (!deliveryLocation) {
            Alert.alert(
                "Delivery Address Required",
                "Please choose your delivery location on the map before placing the order.",
            );
            router.push("/checkout/address-picker");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const order = await createOrder({
                merchant_id: cartMerchantId,
                delivery_address: deliveryLocation.address,
                delivery_latitude: deliveryLocation.latitude,
                delivery_longitude: deliveryLocation.longitude,
                customer_note: undefined,
                items: cartItemsToOrderItems(items),
            });

            const payment: PaymentResponse = await createPayment(
                {
                    order_id: order.id,
                    amount: order.total,
                    currency: "VND",
                    method: paymentMethod === "CASH" ? "CASH_ON_DELIVERY" : "VNPAY",
                },
                generateIdempotencyKey(`checkout-${order.id}`),
            );

            if (paymentMethod === "CASH") {
                router.replace({
                    pathname: "/order/tracking",
                    params: { orderId: order.id },
                });
                return;
            }

            if (!payment.payment_url) {
                throw new Error("Payment URL was not returned by server.");
            }

            setPendingPayment({
                orderId: order.id,
                paymentId: payment.id,
                transactionId: payment.transaction_id,
            });
            router.push({
                pathname: "/order/payment-processing",
                params: {
                    orderId: order.id,
                    transactionId: payment.transaction_id,
                },
            });

            const canOpen = await Linking.canOpenURL(payment.payment_url);
            if (!canOpen) {
                throw new Error("Unable to open VNPAY payment link.");
            }
            await Linking.openURL(payment.payment_url);
        } catch (error) {
            Alert.alert(
                "Checkout Failed",
                error instanceof Error
                    ? error.message
                    : "Unable to place order. Please try again.",
            );
        } finally {
            setIsPlacingOrder(false);
        }
    }, [cartMerchantId, deliveryLocation, items, paymentMethod, setPendingPayment]);

    return (
        <View className="flex-1 bg-white">
            <CheckoutHeader />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <DeliveryAddressCard
                    address={
                        deliveryLocation?.address ??
                        "Choose your delivery location on the map"
                    }
                    actionLabel={deliveryLocation ? "Edit" : "Choose"}
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
                    method={paymentMethod}
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
