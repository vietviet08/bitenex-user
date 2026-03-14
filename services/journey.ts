import { api } from "./api";
import type { CartItem } from "@/store/zustand/cart.store";

export interface CartActivityPayload {
  cart_id: string;
  merchant_id: string | null;
  cart_value: number;
  currency: string;
  item_count: number;
  restaurant_open: boolean;
  items_available: boolean;
  deep_link: string;
  is_active: boolean;
  payload_snapshot: {
    merchant_id: string | null;
    items: {
      cart_item_id: string;
      food_item_id: string;
      menu_item_id: string;
      name: string;
      quantity: number;
      line_total: number;
      selected_options: CartItem["selectedOptions"];
    }[];
  };
}

export async function syncMyCartActivity(payload: CartActivityPayload): Promise<void> {
  await api.post("/journeys/abandoned-carts/activity", payload);
}
