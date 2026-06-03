import { api } from "./api";

// DTO matching the backend FavoriteMerchantResponse schema
export interface FavoriteMerchantDto {
    id: string;
    merchant_id: string;
    name: string;
    logo_url: string | null;
    cover_image_url: string | null;
    average_rating: number;
    delivery_fee: number;
    estimated_prep_time: number;
    address: string;
    city: string;
}

export interface FavoriteListResponse {
    items: FavoriteMerchantDto[];
    total: number;
}

/**
 * Fetch the current user's favorited merchants.
 */
export async function fetchFavorites(params?: {
    page?: number;
    per_page?: number;
}): Promise<FavoriteListResponse> {
    const response = await api.get<FavoriteListResponse>("/users/profile/favorites", {
        params,
    });
    return response.data;
}

/**
 * Fetch just the merchant IDs in user's favorites.
 * Lightweight — used for hydrating `isFavorite` on home screen cards.
 */
export async function fetchFavoriteIds(): Promise<string[]> {
    const response = await api.get<string[]>("/users/profile/favorite-ids");
    return response.data;
}

/**
 * Add a merchant to the current user's favorites.
 */
export async function addFavorite(merchantId: string): Promise<FavoriteMerchantDto> {
    const response = await api.post<FavoriteMerchantDto>(
        `/users/profile/favorites/${merchantId}`,
    );
    return response.data;
}

/**
 * Remove a merchant from the current user's favorites.
 */
export async function removeFavorite(merchantId: string): Promise<void> {
    await api.delete(`/users/profile/favorites/${merchantId}`);
}
