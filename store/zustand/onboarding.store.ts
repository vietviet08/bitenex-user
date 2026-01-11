import { create } from "zustand";

import {
    getWalkthroughCompleted,
    setWalkthroughCompleted,
} from "@/utils/storage";

interface OnboardingState {
    hasCompletedWalkthrough: boolean;
    isLoading: boolean;
    isChecked: boolean;

    checkWalkthroughStatus: () => Promise<void>;
    completeWalkthrough: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
    hasCompletedWalkthrough: false,
    isLoading: true,
    isChecked: false,

    checkWalkthroughStatus: async () => {
        if (get().isChecked) {
            return;
        }

        set({ isLoading: true });

        try {
            const completed = await getWalkthroughCompleted();
            set({
                hasCompletedWalkthrough: completed,
                isLoading: false,
                isChecked: true,
            });
        } catch {
            set({
                hasCompletedWalkthrough: false,
                isLoading: false,
                isChecked: true,
            });
        }
    },

    completeWalkthrough: async () => {
        try {
            await setWalkthroughCompleted();
            set({ hasCompletedWalkthrough: true });
        } catch (error) {
            console.error("Failed to complete walkthrough:", error);
        }
    },
}));

// Selector hooks
export const useHasCompletedWalkthrough = () =>
    useOnboardingStore((state) => state.hasCompletedWalkthrough);

export const useOnboardingLoading = () =>
    useOnboardingStore((state) => state.isLoading);

export const useOnboardingChecked = () =>
    useOnboardingStore((state) => state.isChecked);
