import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useVoucherStore } from "./voucher.store";

export interface CartItemCustomization {
  sizeId: string;
  sizeName: string;
  sizePriceDelta: number;
  addOnIds: string[];
  addOnNames: string[];
  addOnsTotal: number;
  specialInstructions: string;
}

export interface SelectedOptionRef {
  option_group_id: string;
  option_id: string;
}

export interface CartItem {
  id: string; // unique cart item id
  foodItemId: string;
  merchantId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  customization: CartItemCustomization;
  selectedOptions: SelectedOptionRef[];
  lineTotal: number; // (basePrice + sizePriceDelta + addOnsTotal) * quantity
}

interface CartState {
  items: CartItem[];
  merchantId: string | null; // tracks current cart merchant
  promoCode: string;
  discount: number;
  voucherCode: string;
  voucherDiscount: number;
  deliveryFee: number;

  // Computed selectors (use these via hooks below)
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "lineTotal">) => void;
  /** Returns true if the cart already has items from a different merchant */
  hasMerchantConflict: (merchantId: string) => boolean;
  switchMerchantAndAdd: (item: Omit<CartItem, "id" | "lineTotal">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  applyVoucher: (code: string) => boolean;
  clearVoucher: () => void;
  clearCart: () => void;
}

const PROMO_CODES: Record<string, number> = {
  SAVE10: 0.1,
  WELCOME: 0.15,
  BITENEX20: 0.2,
};

const calculateLineTotal = (
  basePrice: number,
  customization: CartItemCustomization,
  quantity: number,
): number => {
  const unitPrice =
    basePrice + customization.sizePriceDelta + customization.addOnsTotal;
  return unitPrice * quantity;
};

const generateCartItemId = (): string => {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      merchantId: null,
      promoCode: "",
      discount: 0,
      voucherCode: "",
      voucherDiscount: 0,
      deliveryFee: 2.99,

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.lineTotal, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        const voucherDiscount = get().voucherDiscount;
        const deliveryFee = get().deliveryFee;
        const discountedSubtotal =
          subtotal - subtotal * discount - voucherDiscount;
        return Math.max(0, discountedSubtotal) + deliveryFee; // Ensure total doesn't go negative
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      addItem: (itemData) => {
        const newItem: CartItem = {
          ...itemData,
          id: generateCartItemId(),
          lineTotal: calculateLineTotal(
            itemData.basePrice,
            itemData.customization,
            itemData.quantity,
          ),
        };

        set((state) => ({
          items: [...state.items, newItem],
          merchantId: itemData.merchantId,
        }));
      },

      hasMerchantConflict: (merchantId) => {
        const state = get();
        return (
          state.items.length > 0 &&
          state.merchantId !== null &&
          state.merchantId !== merchantId
        );
      },

      switchMerchantAndAdd: (itemData) => {
        const newItem: CartItem = {
          ...itemData,
          id: generateCartItemId(),
          lineTotal: calculateLineTotal(
            itemData.basePrice,
            itemData.customization,
            itemData.quantity,
          ),
        };

        set({
          items: [newItem],
          merchantId: itemData.merchantId,
          promoCode: "",
          discount: 0,
          voucherCode: "",
          voucherDiscount: 0,
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;
            const updatedItem = { ...item, quantity };
            return {
              ...updatedItem,
              lineTotal: calculateLineTotal(
                item.basePrice,
                item.customization,
                quantity,
              ),
            };
          }),
        }));
      },

      applyPromo: (code) => {
        const normalizedCode = code.toUpperCase().trim();
        const discountRate = PROMO_CODES[normalizedCode];

        if (discountRate) {
          set({ promoCode: normalizedCode, discount: discountRate });
          return true;
        }
        return false;
      },

      clearPromo: () => {
        set({ promoCode: "", discount: 0 });
      },

      applyVoucher: (code) => {
        const normalizedCode = code.toUpperCase().trim();
        const voucherStore = useVoucherStore.getState();
        const result = voucherStore.applyVoucherToCart(normalizedCode);

        if (result.success && result.voucher) {
          set({
            voucherCode: normalizedCode,
            voucherDiscount: result.discount,
          });
          return true;
        }
        return false;
      },

      clearVoucher: () => {
        set({ voucherCode: "", voucherDiscount: 0 });
      },

      clearCart: () => {
        set({
          items: [],
          merchantId: null,
          promoCode: "",
          discount: 0,
          voucherCode: "",
          voucherDiscount: 0,
        });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        merchantId: state.merchantId,
        promoCode: state.promoCode,
        discount: state.discount,
        voucherCode: state.voucherCode,
        voucherDiscount: state.voucherDiscount,
      }),
    },
  ),
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () =>
  useCartStore((state) => state.getItemCount());
export const useCartSubtotal = () =>
  useCartStore((state) => state.getSubtotal());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartDiscount = () => useCartStore((state) => state.discount);
export const useCartPromoCode = () => useCartStore((state) => state.promoCode);
export const useCartVoucherCode = () =>
  useCartStore((state) => state.voucherCode);
export const useDeliveryFee = () => useCartStore((state) => state.deliveryFee);
