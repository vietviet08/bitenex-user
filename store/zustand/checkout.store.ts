import { create } from "zustand";

export interface CheckoutDeliveryLocation {
    address: string;
    latitude: number;
    longitude: number;
}

interface CheckoutState {
    deliveryLocation: CheckoutDeliveryLocation | null;
    setDeliveryLocation: (location: CheckoutDeliveryLocation) => void;
    clearDeliveryLocation: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
    deliveryLocation: null,
    setDeliveryLocation: (deliveryLocation) => set({ deliveryLocation }),
    clearDeliveryLocation: () => set({ deliveryLocation: null }),
}));

export const useDeliveryLocation = () =>
    useCheckoutStore((state) => state.deliveryLocation);

