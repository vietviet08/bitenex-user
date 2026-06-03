/**
 * Favorites Store
 *
 * Manages the user's favorite merchants using Zustand.
 * Provides optimistic updates so heart toggles feel instant.
 */
import { create } from "zustand";
import {
    addFavorite,
    fetchFavoriteIds,
    fetchFavorites,
    removeFavorite,
    type FavoriteMerchantDto,
} from "@/services/favorite";

interface FavoritesState {
    /** Full merchant details for the favorites list screen */
    favorites: FavoriteMerchantDto[];
    /** Set of merchant IDs for O(1) isFavorite lookups on home screen cards */
    favoriteIds: Set<string>;
    total: number;
    loading: boolean;
    initialized: boolean;

    /** Load both full list and IDs. Called once on app boot or when screen mounts. */
    fetchFavorites: () => Promise<void>;
    /** Load only IDs — lightweight, used for hydrating home screen cards. */
    fetchFavoriteIds: () => Promise<void>;
    /** Toggle favorite status with optimistic update. */
    toggleFavorite: (merchantId: string) => Promise<void>;
    /** Check if a merchant is favorited. */
    isFavorite: (merchantId: string) => boolean;
    /** Clear store on logout. */
    reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    favoriteIds: new Set(),
    total: 0,
    loading: false,
    initialized: false,

    fetchFavorites: async () => {
        set({ loading: true });
        try {
            const data = await fetchFavorites();
            const ids = new Set(data.items.map((f) => f.merchant_id));
            set({
                favorites: data.items,
                total: data.total,
                favoriteIds: ids,
                initialized: true,
            });
        } catch (err) {
            console.error("[favorites] fetchFavorites error:", err);
        } finally {
            set({ loading: false });
        }
    },

    fetchFavoriteIds: async () => {
        try {
            const ids = await fetchFavoriteIds();
            set({ favoriteIds: new Set(ids), initialized: true });
        } catch (err) {
            console.error("[favorites] fetchFavoriteIds error:", err);
        }
    },

    toggleFavorite: async (merchantId: string) => {
        const { favoriteIds, favorites } = get();
        const wasLiked = favoriteIds.has(merchantId);

        // Optimistic update
        const newIds = new Set(favoriteIds);
        if (wasLiked) {
            newIds.delete(merchantId);
            set({
                favoriteIds: newIds,
                favorites: favorites.filter((f) => f.merchant_id !== merchantId),
                total: Math.max(0, get().total - 1),
            });
        } else {
            newIds.add(merchantId);
            set({ favoriteIds: newIds, total: get().total + 1 });
        }

        try {
            if (wasLiked) {
                await removeFavorite(merchantId);
            } else {
                const newFav = await addFavorite(merchantId);
                // Append full merchant details to the list
                set((state) => ({
                    favorites: [newFav, ...state.favorites],
                }));
            }
        } catch (err) {
            // Rollback on error
            console.error("[favorites] toggle error, rolling back:", err);
            const rollbackIds = new Set(favoriteIds);
            set({
                favoriteIds: rollbackIds,
                favorites: get().favorites, // keep current (already mutated, fetch to sync)
            });
            // Re-fetch to get consistent state
            await get().fetchFavorites();
        }
    },

    isFavorite: (merchantId: string) => {
        return get().favoriteIds.has(merchantId);
    },

    reset: () => {
        set({
            favorites: [],
            favoriteIds: new Set(),
            total: 0,
            loading: false,
            initialized: false,
        });
    },
}));

/** Selector hooks */
export const useFavorites = () => useFavoritesStore((s) => s.favorites);
export const useFavoriteIds = () => useFavoritesStore((s) => s.favoriteIds);
export const useIsFavorite = (merchantId: string) =>
    useFavoritesStore((s) => s.favoriteIds.has(merchantId));
export const useFavoritesLoading = () => useFavoritesStore((s) => s.loading);
