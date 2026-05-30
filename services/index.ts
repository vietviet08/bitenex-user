/**
 * Services barrel export
 */

export { api, setLogoutCallback } from './api';
export { tokenService, TOKEN_KEY, REFRESH_TOKEN_KEY } from './tokenService';
export { type ApiError, ApiErrorException } from './apiError';
export { transformError } from './errorHandler';
export {
  socketClient,
  type DriverLocationData,
  type OrderStatusEventData,
  type SocketEvents,
} from './socket';
export { pushNotificationService } from './pushNotifications';
export {
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  rateOrderDriver,
  rateOrderMerchant,
  cartItemsToOrderItems,
  type CreateOrderInput,
  type OrderListResponse,
  type OrderItemInput,
  type OrderItemResponse,
  type OrderResponse,
  type OrderTrackingResponse,
} from './order';
export {
  createPayment,
  getPaymentByTransaction,
  generateIdempotencyKey,
  isRetryablePaymentError,
  type CreatePaymentInput,
  type PaymentResponse,
  type PaymentStatus,
} from './payment';
export {
  getOrderChatMessages,
  sendOrderChatMessage,
  type ChatConversationType,
  type ChatMessage,
  type ChatMessageListResponse,
} from './chat';
export { locationService, type Coordinates, type LocationWithDetails, type AddressDetails } from './location';
export {
  syncMyCartActivity,
  type CartActivityPayload,
} from './journey';
export {
  fetchMerchantList,
  fetchMerchantDetail,
  fetchMerchantMenu,
  resolveDataViewState,
  toRestaurantCardDto,
  type MerchantDto,
  type MenuItemDto,
  type RestaurantCardDto,
} from './merchant';
