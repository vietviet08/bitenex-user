import AsyncStorage from "@react-native-async-storage/async-storage";

export const WALKTHROUGH_COMPLETED_KEY = "WALKTHROUGH_COMPLETED";

export async function getWalkthroughCompleted(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(WALKTHROUGH_COMPLETED_KEY);
        return value === "true";
    } catch {
        return false;
    }
}

export async function setWalkthroughCompleted(): Promise<void> {
    try {
        await AsyncStorage.setItem(WALKTHROUGH_COMPLETED_KEY, "true");
    } catch (error) {
        console.error("Failed to save walkthrough status:", error);
    }
}

export async function resetWalkthroughStatus(): Promise<void> {
    try {
        await AsyncStorage.removeItem(WALKTHROUGH_COMPLETED_KEY);
    } catch (error) {
        console.error("Failed to reset walkthrough status:", error);
    }
}
