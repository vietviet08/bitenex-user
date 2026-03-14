/**
 * Zustand stores barrel export
 */

export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useIsInitialized,
  type User,
} from './auth.store';

export {
  useCartStore,
  useCartItems,
  useCartId,
  useCartItemCount,
  type CartItem,
} from './cart.store';

export {
  startCartActivitySync,
  stopCartActivitySync,
} from './cartActivitySync';

export {
  useOrderStore,
  useActiveOrder,
  useDriverLocation,
  useRecentOrders,
  useOrderLoading,
  isTrackableStatus,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderDriver,
  type DriverLocation,
  type DeliveryAddress,
} from './order.store';
