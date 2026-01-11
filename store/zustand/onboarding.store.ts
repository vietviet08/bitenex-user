import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
    getWalkthroughCompleted,
    setWalkthroughCompleted,
} from "@/utils/storage";

interface OnboardingState {
    hasCompletedWalkthrough: boolean;
    isChecking: boolean;
    isReady: boolean;

    checkWalkthroughStatus: () => Promise<void>;
    completeWalkthrough: () => Promise<void>;
}

let hasRehydrated = false;

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            hasCompletedWalkthrough: false,
            isChecking: false,
            isReady: false,

            checkWalkthroughStatus: async () => {
                set({ isChecking: true });
                try {
                    const completed = await getWalkthroughCompleted();
                    set({
                        hasCompletedWalkthrough: completed,
                        isChecking: false,
                    });
                } catch (error) {
                    console.error(
                        "Error checking walkthrough status:",
                        error
                    );
                    set({
                        hasCompletedWalkthrough: false,
                        isChecking: false,
                    });
                }
            },

            completeWalkthrough: async () => {
                try {
                    await setWalkthroughCompleted(true);
                    set({ hasCompletedWalkthrough: true });
                } catch (error) {
                    console.error("Error completing walkthrough:", error);
                }
            },
        }),
        {
            name: "onboarding-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                hasCompletedWalkthrough: state.hasCompletedWalkthrough,
            }),
            onRehydrateStorage: () => (state) => {
                hasRehydrated = true;
                if (state) {
                    state.isChecking = false;
                    state.isReady = true;
                }
            },
        }
    )
);

export const getOnboardingHasRehydrated = () => hasRehydrated;
