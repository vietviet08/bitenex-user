/**
 * Cart Store - Zustand
 * Manages shopping cart state, items, and calculations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cart item type
export interface CartItem {
  id: string;
  menuItemId: string;
  merchantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  options: CartItemOption[];
  specialInstructions: string | null;
}

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

// Merchant info for cart context
export interface CartMerchant {
  id: string;
  name: string;
  imageUrl: string | null;
  deliveryFee: number;
  minOrderAmount: number;
}

// Cart state interface
interface CartState {
  // State
  items: CartItem[];
  merchant: CartMerchant | null;
  promoCode: string | null;
  discount: number;

  // Computed (as actions for Zustand)
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  setMerchant: (merchant: CartMerchant) => void;
  setPromoCode: (code: string | null, discount: number) => void;
  clearCart: () => void;
}

// Initial state
const initialState = {
  items: [] as CartItem[],
  merchant: null as CartMerchant | null,
  promoCode: null as string | null,
  discount: 0,
};

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed values
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const optionsTotal = item.options.reduce((acc, opt) => acc + opt.price, 0);
          return sum + (item.price + optionsTotal) * item.quantity;
        }, 0);
      },

      getDeliveryFee: () => {
        const { merchant } = get();
        return merchant?.deliveryFee ?? 0;
      },

      getTotal: () => {
        const { discount } = get();
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        return Math.max(0, subtotal + deliveryFee - discount);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Actions
      addItem: (item) =>
        set((state) => {
          // Check if switching merchants
          if (state.merchant && state.merchant.id !== item.merchantId) {
            // Clear cart when switching merchants
            return {
              items: [{ ...item, id: generateId() }],
              merchant: null, // Will be set separately
            };
          }

          // Check for existing item with same options
          const existingIndex = state.items.findIndex(
            (i) =>
              i.menuItemId === item.menuItemId &&
              JSON.stringify(i.options) === JSON.stringify(item.options) &&
              i.specialInstructions === item.specialInstructions
          );

          if (existingIndex >= 0) {
            // Update quantity
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            };
            return { items: newItems };
          }

          // Add new item
          return { items: [...state.items, { ...item, id: generateId() }] };
        }),

      updateItemQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== itemId) };
          }
          return {
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      setMerchant: (merchant) => set({ merchant }),

      setPromoCode: (promoCode, discount) => set({ promoCode, discount }),

      clearCart: () => set(initialState),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartMerchant = () => useCartStore((state) => state.merchant);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
