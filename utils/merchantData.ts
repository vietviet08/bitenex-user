export interface MerchantCardSource {
    id: string;
    name: string;
    city: string;
    average_rating: number;
    estimated_prep_time: number;
    delivery_fee: number;
    is_featured: boolean;
    cover_image_url: string | null;
    logo_url: string | null;
}

export interface RestaurantCardDto {
    id: string;
    name: string;
    cuisine: string[];
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    promoText?: string;
    image?: string;
    isFavorite?: boolean;
}

export function toRestaurantCardDto(merchant: MerchantCardSource): RestaurantCardDto {
    return {
        id: merchant.id,
        name: merchant.name,
        cuisine: [merchant.city],
        rating: Number(merchant.average_rating || 0),
        deliveryTime: `${merchant.estimated_prep_time} min`,
        deliveryFee: `$${merchant.delivery_fee.toFixed(2)}`,
        promoText: merchant.is_featured ? "Featured" : undefined,
        image: merchant.cover_image_url || merchant.logo_url || undefined,
        isFavorite: false,
    };
}

export function resolveDataViewState(params: {
    isLoading: boolean;
    errorMessage: string;
    hasData: boolean;
}): "loading" | "error" | "empty" | "ready" {
    if (params.isLoading) return "loading";
    if (params.errorMessage) return "error";
    if (!params.hasData) return "empty";
    return "ready";
}
