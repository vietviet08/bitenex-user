import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PendingPaymentContext {
    orderId: string;
    paymentId: string;
    transactionId: string;
}

interface PaymentState {
    pendingPayment: PendingPaymentContext | null;
    setPendingPayment: (context: PendingPaymentContext) => void;
    clearPendingPayment: () => void;
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set) => ({
            pendingPayment: null,
            setPendingPayment: (context) => set({ pendingPayment: context }),
            clearPendingPayment: () => set({ pendingPayment: null }),
        }),
        {
            name: "payment-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                pendingPayment: state.pendingPayment,
            }),
        },
    ),
);
