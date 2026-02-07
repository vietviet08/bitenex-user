import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItemCustomization {
  sizeId: string;
  sizeName: string;
  sizePriceDelta: number;
  addOnIds: string[];
  addOnNames: string[];
  addOnsTotal: number;
  specialInstructions: string;
}

export interface CartItem {
  id: string; // unique cart item id
  foodItemId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  customization: CartItemCustomization;
  lineTotal: number; // (basePrice + sizePriceDelta + addOnsTotal) * quantity
}

interface CartState {
  items: CartItem[];
  promoCode: string;
  discount: number;
  deliveryFee: number;

  // Computed selectors (use these via hooks below)
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "lineTotal">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
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
  quantity: number
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
      promoCode: "",
      discount: 0,
      deliveryFee: 2.99,

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.lineTotal, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        const deliveryFee = get().deliveryFee;
        return subtotal - subtotal * discount + deliveryFee;
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      addItem: (itemData) => {
        const newItem: CartItem = {
          ...itemData,
          id: generateCartItemId(),
          lineTotal: calculateLineTotal(itemData.basePrice, itemData.customization, itemData.quantity),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
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
              lineTotal: calculateLineTotal(item.basePrice, item.customization, quantity),
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

      clearCart: () => {
        set({
          items: [],
          promoCode: "",
          discount: 0,
        });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartDiscount = () => useCartStore((state) => state.discount);
export const useCartPromoCode = () => useCartStore((state) => state.promoCode);
export const useDeliveryFee = () => useCartStore((state) => state.deliveryFee);
