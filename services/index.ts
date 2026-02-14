/**
 * Services barrel export
 */

export { api, setLogoutCallback } from './api';
export { tokenService, TOKEN_KEY, REFRESH_TOKEN_KEY } from './tokenService';
export { type ApiError, ApiErrorException } from './apiError';
export { transformError } from './errorHandler';
export { socketClient, type SocketEvents } from './socket';
export { locationService, type Coordinates, type LocationWithDetails, type AddressDetails } from './location';
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
