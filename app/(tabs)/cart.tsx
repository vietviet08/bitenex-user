import { View, ScrollView } from "react-native";
import { useCallback } from "react";

import {
    CartHeader,
    CartItemList,
    PromoCodeInput,
    OrderSummary,
    CheckoutButton,
} from "@/components/cart";
import {
    useCartStore,
    useCartItems,
    useCartSubtotal,
    useCartTotal,
    useCartDiscount,
    useCartPromoCode,
    useDeliveryFee,
} from "@/store/zustand/cart.store";

export default function CartScreen() {
    const items = useCartItems();
    const subtotal = useCartSubtotal();
    const total = useCartTotal();
    const discount = useCartDiscount();
    const promoCode = useCartPromoCode();
    const deliveryFee = useDeliveryFee();

    const applyPromo = useCartStore((state) => state.applyPromo);
    const clearPromo = useCartStore((state) => state.clearPromo);

    const handleApplyPromo = useCallback(
        (code: string) => {
            return applyPromo(code);
        },
        [applyPromo],
    );

    const handleClearPromo = useCallback(() => {
        clearPromo();
    }, [clearPromo]);

    const hasItems = items.length > 0;

    return (
        <View className="flex-1 bg-white">
            <CartHeader />

            {hasItems ? (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    <CartItemList items={items} />

                    <PromoCodeInput
                        currentPromoCode={promoCode}
                        onApplyPromo={handleApplyPromo}
                        onClearPromo={handleClearPromo}
                    />

                    <OrderSummary
                        subtotal={subtotal}
                        deliveryFee={deliveryFee}
                        discount={discount}
                        total={total}
                    />
                </ScrollView>
            ) : (
                <CartItemList items={items} />
            )}

            {hasItems && <CheckoutButton total={total} disabled={!hasItems} />}

            {/* Spacer for tab bar */}
            <View style={{ height: 88 }} />
        </View>
    );
}
