import { useCallback } from "react";
import { ScrollView, View } from "react-native";

import {
  CartHeader,
  CartItemList,
  CheckoutButton,
  OrderSummary,
  PromoCodeInput,
  VoucherInput,
} from "@/components/cart";
import {
  useCartDiscount,
  useCartItems,
  useCartPromoCode,
  useCartStore,
  useCartSubtotal,
  useCartTotal,
  useCartVoucherCode,
  useDeliveryFee,
} from "@/store/zustand/cart.store";

export default function CartScreen() {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const total = useCartTotal();
  const discount = useCartDiscount();
  const promoCode = useCartPromoCode();
  const voucherCode = useCartVoucherCode();
  const deliveryFee = useDeliveryFee();

  const applyPromo = useCartStore((state) => state.applyPromo);
  const clearPromo = useCartStore((state) => state.clearPromo);
  const applyVoucher = useCartStore((state) => state.applyVoucher);
  const clearVoucher = useCartStore((state) => state.clearVoucher);

  const handleApplyPromo = useCallback(
    (code: string) => {
      return applyPromo(code);
    },
    [applyPromo],
  );

  const handleClearPromo = useCallback(() => {
    clearPromo();
  }, [clearPromo]);

  const handleApplyVoucher = useCallback(
    (code: string) => {
      return applyVoucher(code);
    },
    [applyVoucher],
  );

  const handleClearVoucher = useCallback(() => {
    clearVoucher();
  }, [clearVoucher]);

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

          <VoucherInput
            currentVoucherCode={voucherCode}
            onApplyVoucher={handleApplyVoucher}
            onClearVoucher={handleClearVoucher}
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
