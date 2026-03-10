/**
 * Voucher Store - Zustand
 * Manages user vouchers and voucher codes
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type VoucherType = "percentage" | "fixed_amount" | "free_delivery";

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number; // percentage (0-1) or fixed amount
  description: string;
  expiryDate: string;
  isUsed: boolean;
  usedAt?: string;
  orderId?: string; // order that generated this voucher
  minimumOrderValue?: number;
  maxDiscount?: number;
}

interface VoucherState {
  vouchers: Voucher[];

  // Computed selectors
  getActiveVouchers: () => Voucher[];
  getUsedVouchers: () => Voucher[];
  getExpiredVouchers: () => Voucher[];

  // Actions
  addVoucher: (voucher: Omit<Voucher, "id" | "isUsed">) => void;
  useVoucher: (voucherId: string) => void;
  removeVoucher: (voucherId: string) => void;
  generateOrderVoucher: (orderId: string, orderTotal: number) => Voucher;
  isValidVoucher: (code: string) => Voucher | null;
  applyVoucherToCart: (code: string) => {
    success: boolean;
    discount: number;
    voucher: Voucher | null;
  };
}

const generateVoucherCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const isExpired = (expiryDate: string): boolean => {
  return new Date(expiryDate) < new Date();
};

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      vouchers: [],

      getActiveVouchers: () => {
        return get().vouchers.filter(
          (voucher) => !voucher.isUsed && !isExpired(voucher.expiryDate),
        );
      },

      getUsedVouchers: () => {
        return get().vouchers.filter((voucher) => voucher.isUsed);
      },

      getExpiredVouchers: () => {
        return get().vouchers.filter(
          (voucher) => isExpired(voucher.expiryDate) && !voucher.isUsed,
        );
      },

      addVoucher: (voucherData) => {
        const newVoucher: Voucher = {
          ...voucherData,
          id: `voucher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isUsed: false,
        };

        set((state) => ({
          vouchers: [...state.vouchers, newVoucher],
        }));
      },

      useVoucher: (voucherId) => {
        set((state) => ({
          vouchers: state.vouchers.map((voucher) =>
            voucher.id === voucherId
              ? { ...voucher, isUsed: true, usedAt: new Date().toISOString() }
              : voucher,
          ),
        }));
      },

      removeVoucher: (voucherId) => {
        set((state) => ({
          vouchers: state.vouchers.filter(
            (voucher) => voucher.id !== voucherId,
          ),
        }));
      },

      generateOrderVoucher: (orderId, orderTotal) => {
        // Generate different types of vouchers based on order total
        let voucherType: VoucherType;
        let value: number;
        let description: string;
        let minimumOrderValue: number | undefined;

        if (orderTotal >= 50) {
          // High value order - percentage discount
          voucherType = "percentage";
          value = 0.15; // 15%
          description = "15% off your next order";
          minimumOrderValue = 20;
        } else if (orderTotal >= 25) {
          // Medium value order - fixed amount
          voucherType = "fixed_amount";
          value = 5; // $5 off
          description = "$5 off your next order";
          minimumOrderValue = 15;
        } else {
          // Low value order - free delivery
          voucherType = "free_delivery";
          value = 0;
          description = "Free delivery on your next order";
          minimumOrderValue = 10;
        }

        // Expiry date - 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const voucherData = {
          code: generateVoucherCode(),
          type: voucherType,
          value,
          description,
          expiryDate: expiryDate.toISOString(),
          orderId,
          minimumOrderValue,
        };

        get().addVoucher(voucherData);
        return { ...voucherData, id: "", isUsed: false }; // Return without id for immediate use
      },

      isValidVoucher: (code) => {
        const normalizedCode = code.toUpperCase().trim();
        const voucher = get().vouchers.find(
          (v) =>
            v.code === normalizedCode && !v.isUsed && !isExpired(v.expiryDate),
        );
        return voucher || null;
      },

      applyVoucherToCart: (code) => {
        const voucher = get().isValidVoucher(code);
        if (!voucher) {
          return { success: false, discount: 0, voucher: null };
        }

        // Mark voucher as used
        get().useVoucher(voucher.id);

        return { success: true, discount: voucher.value, voucher };
      },
    }),
    {
      name: "voucher-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vouchers: state.vouchers,
      }),
    },
  ),
);

// Selector hooks
export const useActiveVouchers = () =>
  useVoucherStore((state) => state.getActiveVouchers());
export const useUsedVouchers = () =>
  useVoucherStore((state) => state.getUsedVouchers());
export const useExpiredVouchers = () =>
  useVoucherStore((state) => state.getExpiredVouchers());
