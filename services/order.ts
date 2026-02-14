import { api } from "./api";
import type { CartItem, SelectedOptionRef } from "@/store/zustand/cart.store";

// ── Request types ────────────────────────────────────────────────────

export interface SelectedOptionInput {
    option_group_id: string;
    option_id: string;
}

export interface OrderItemInput {
    menu_item_id: string;
    quantity: number;
    notes?: string;
    selected_options?: SelectedOptionInput[];
}

export interface CreateOrderInput {
    merchant_id: string;
    delivery_address: string;
    delivery_latitude?: number;
    delivery_longitude?: number;
    notes?: string;
    items: OrderItemInput[];
}

// ── Response types ───────────────────────────────────────────────────

export interface OrderItemResponse {
    id: string;
    menu_item_id: string;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
    selected_options: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderResponse {
    id: string;
    user_id: string;
    merchant_id: string;
    status: string;
    total_amount: number;
    delivery_fee: number;
    delivery_address: string;
    notes: string | null;
    items: OrderItemResponse[];
    created_at: string;
    updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Maps cart items to the `OrderItemInput[]` format expected by the API.
 * Includes selected options and special instructions.
 */
export function cartItemsToOrderItems(cartItems: CartItem[]): OrderItemInput[] {
    return cartItems.map((item) => ({
        menu_item_id: item.foodItemId,
        quantity: item.quantity,
        notes: item.customization.specialInstructions || undefined,
        selected_options:
            item.selectedOptions.length > 0
                ? item.selectedOptions.map((so: SelectedOptionRef) => ({
                      option_group_id: so.option_group_id,
                      option_id: so.option_id,
                  }))
                : undefined,
    }));
}

// ── API calls ────────────────────────────────────────────────────────

export async function createOrder(
    payload: CreateOrderInput,
): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>("/orders", payload);
    return response.data;
}
