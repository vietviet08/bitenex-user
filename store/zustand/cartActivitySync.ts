import {
    syncMyCartActivity,
    type CartActivityPayload,
} from "@/services/journey";

import { useAuthStore } from "./auth.store";
import { type CartItem, useCartStore } from "./cart.store";

type CartStoreState = ReturnType<typeof useCartStore.getState>;

let unsubscribeCartStore: (() => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let queuedPayload: CartActivityPayload | null = null;
let isSyncing = false;

function toPayload(
    state: CartStoreState,
    isActiveOverride?: boolean,
): CartActivityPayload | null {
    if (!state.cartId) {
        return null;
    }

    const isActive = isActiveOverride ?? state.items.length > 0;
    const items = state.items.map((item: CartItem) => ({
        cart_item_id: item.id,
        food_item_id: item.foodItemId,
        menu_item_id: item.foodItemId,
        name: item.name,
        quantity: item.quantity,
        line_total: item.lineTotal,
        selected_options: item.selectedOptions,
    }));

    return {
        cart_id: state.cartId,
        merchant_id: state.merchantId,
        cart_value: state.items.reduce((sum, item) => sum + item.lineTotal, 0),
        currency: "VND",
        item_count: state.items.reduce((sum, item) => sum + item.quantity, 0),
        restaurant_open: true,
        items_available: true,
        deep_link: `bitenex://cart/${state.cartId}`,
        is_active: isActive,
        payload_snapshot: {
            merchant_id: state.merchantId,
            items,
        },
    };
}

function serializeRelevantState(state: CartStoreState): string {
    return JSON.stringify({
        cartId: state.cartId,
        merchantId: state.merchantId,
        items: state.items.map((item) => ({
            id: item.id,
            foodItemId: item.foodItemId,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            selectedOptions: item.selectedOptions,
        })),
    });
}

async function flushPayload(payload: CartActivityPayload): Promise<void> {
    if (isSyncing) {
        queuedPayload = payload;
        return;
    }

    isSyncing = true;
    try {
        await syncMyCartActivity(payload);
    } catch (error) {
        console.warn("[CartActivity] Failed to sync cart activity", error);
    } finally {
        isSyncing = false;
        if (queuedPayload) {
            const nextPayload = queuedPayload;
            queuedPayload = null;
            void flushPayload(nextPayload);
        }
    }
}

function scheduleSync(payload: CartActivityPayload, delayMs = 1200): void {
    queuedPayload = payload;

    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        if (!queuedPayload) {
            return;
        }

        const nextPayload = queuedPayload;
        queuedPayload = null;
        void flushPayload(nextPayload);
    }, delayMs);
}

export function startCartActivitySync(): void {
    if (unsubscribeCartStore) {
        return;
    }

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
        return;
    }

    const initialPayload = toPayload(useCartStore.getState());
    if (initialPayload?.is_active) {
        scheduleSync(initialPayload, 150);
    }

    unsubscribeCartStore = useCartStore.subscribe((state, prevState) => {
        if (!useAuthStore.getState().user) {
            return;
        }

        if (
            serializeRelevantState(state) === serializeRelevantState(prevState)
        ) {
            return;
        }

        if (prevState.cartId && prevState.cartId !== state.cartId) {
            const inactivePreviousCart = toPayload(prevState, false);
            if (inactivePreviousCart) {
                void flushPayload(inactivePreviousCart);
            }
        }

        const nextPayload = toPayload(state);
        if (nextPayload?.is_active) {
            scheduleSync(nextPayload);
        }
    });
}

export function stopCartActivitySync(): void {
    if (unsubscribeCartStore) {
        unsubscribeCartStore();
        unsubscribeCartStore = null;
    }

    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }

    queuedPayload = null;
    isSyncing = false;
}
