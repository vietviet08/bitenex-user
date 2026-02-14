import { api } from "./api";
import {
    resolveDataViewState,
    toRestaurantCardDto,
    type RestaurantCardDto,
} from "@/utils/merchantData";

export interface MerchantDto {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "CLOSED";
    is_featured: boolean;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    min_order_amount: number;
    delivery_fee: number;
    estimated_prep_time: number;
    average_rating: number;
    total_orders: number;
    is_profile_complete: boolean;
    created_at: string;
    updated_at: string;
}

export interface MenuItemDto {
    id: string;
    merchant_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string | null;
    is_available: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface MerchantListResponse {
    items: MerchantDto[];
    total: number;
}

export async function fetchMerchantList(params?: {
    page?: number;
    per_page?: number;
    city?: string;
    category?: string;
}): Promise<MerchantListResponse> {
    const response = await api.get<MerchantListResponse>("/merchants", {
        params,
    });
    return response.data;
}

export async function fetchMerchantDetail(merchantId: string): Promise<MerchantDto> {
    const response = await api.get<MerchantDto>(`/merchants/${merchantId}`);
    return response.data;
}

export async function fetchMerchantMenu(
    merchantId: string,
    params?: { category?: string; available_only?: boolean },
): Promise<MenuItemDto[]> {
    const response = await api.get<MenuItemDto[]>(`/merchants/${merchantId}/menu`, {
        params,
    });
    return response.data;
}

export { resolveDataViewState, toRestaurantCardDto, type RestaurantCardDto };
