import { api } from "./api";
import type { CartItem, SelectedOptionRef } from "@/store/zustand/cart.store";

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
    customer_note?: string;
    items: OrderItemInput[];
}

export interface OrderItemResponse {
    id: string;
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    notes: string | null;
    selected_options: string | null;
}

export interface OrderResponse {
    id: string;
    order_number: string;
    user_id: string;
    merchant_id: string;
    driver_id: string | null;
    status: string;
    subtotal: number;
    delivery_fee: number;
    tax: number;
    discount: number;
    total: number;
    delivery_address: string;
    delivery_latitude: number | null;
    delivery_longitude: number | null;
    customer_note: string | null;
    estimated_prep_time: number | null;
    estimated_delivery_time: number | null;
    items: OrderItemResponse[];
    created_at: string;
    updated_at: string;
}

export interface OrderListResponse {
    items: OrderResponse[];
    total: number;
}

export interface OrderTrackingResponse {
    order_id: string;
    order_number: string;
    status: string;
    merchant_id: string;
    merchant_name: string;
    pickup_address: string;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    delivery_address: string;
    delivery_latitude: number | null;
    delivery_longitude: number | null;
    driver_id: string | null;
    driver_latitude: number | null;
    driver_longitude: number | null;
    updated_at: string | null;
}

/**
 * Maps cart items to the `OrderItemInput[]` format expected by the API.
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

export async function createOrder(payload: CreateOrderInput): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>("/orders", payload);
    return response.data;
}

export async function getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
}

export async function getOrderTracking(orderId: string): Promise<OrderTrackingResponse> {
    const response = await api.get<OrderTrackingResponse>(`/orders/${orderId}/tracking`);
    return response.data;
}

export async function cancelOrder(orderId: string, reason: string): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>(`/orders/${orderId}/cancel`, null, {
        params: { reason },
    });
    return response.data;
}

export async function getMyOrders(params?: {
    status?: string;
    page?: number;
    per_page?: number;
}): Promise<OrderListResponse> {
    const response = await api.get<OrderListResponse>("/orders/my", {
        params,
    });
    return response.data;
}
