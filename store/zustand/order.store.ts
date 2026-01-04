/**
 * Order Store - Zustand
 * Manages active orders and order history
 */

import { create } from 'zustand';

// Order status enum
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

// Order item type
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options: { name: string; price: number }[];
}

// Delivery address
export interface DeliveryAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  instructions: string | null;
}

// Driver info for tracking
export interface OrderDriver {
  id: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
}

// Driver location for map
export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  updatedAt: string;
}

// Order type
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  merchantId: string;
  merchantName: string;
  merchantImageUrl: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  driver: OrderDriver | null;
  estimatedDeliveryTime: string | null;
  createdAt: string;
  updatedAt: string;
}

// Order state interface
interface OrderState {
  // State
  activeOrder: Order | null;
  driverLocation: DriverLocation | null;
  recentOrders: Order[];
  isLoading: boolean;

  // Actions
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setDriverLocation: (location: DriverLocation | null) => void;
  assignDriver: (orderId: string, driver: OrderDriver) => void;
  addToRecentOrders: (order: Order) => void;
  setRecentOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  clearActiveOrder: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  activeOrder: null as Order | null,
  driverLocation: null as DriverLocation | null,
  recentOrders: [] as Order[],
  isLoading: false,
};

export const useOrderStore = create<OrderState>()((set, get) => ({
  ...initialState,

  setActiveOrder: (activeOrder) => set({ activeOrder }),

  updateOrderStatus: (orderId, status) =>
    set((state) => {
      if (state.activeOrder?.id === orderId) {
        return {
          activeOrder: { ...state.activeOrder, status, updatedAt: new Date().toISOString() },
        };
      }
      return state;
    }),

  setDriverLocation: (driverLocation) => set({ driverLocation }),

  assignDriver: (orderId, driver) =>
    set((state) => {
      if (state.activeOrder?.id === orderId) {
        return {
          activeOrder: { ...state.activeOrder, driver },
        };
      }
      return state;
    }),

  addToRecentOrders: (order) =>
    set((state) => ({
      recentOrders: [order, ...state.recentOrders.filter((o) => o.id !== order.id)].slice(0, 20),
    })),

  setRecentOrders: (recentOrders) => set({ recentOrders }),

  setLoading: (isLoading) => set({ isLoading }),

  clearActiveOrder: () => set({ activeOrder: null, driverLocation: null }),

  reset: () => set(initialState),
}));

// Selector hooks
export const useActiveOrder = () => useOrderStore((state) => state.activeOrder);
export const useDriverLocation = () => useOrderStore((state) => state.driverLocation);
export const useRecentOrders = () => useOrderStore((state) => state.recentOrders);
export const useOrderLoading = () => useOrderStore((state) => state.isLoading);

// Helper to check if order is trackable
export const isTrackableStatus = (status: OrderStatus): boolean => {
  return ['confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering'].includes(status);
};
