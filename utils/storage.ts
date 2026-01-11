import AsyncStorage from "@react-native-async-storage/async-storage";

export const WALKTHROUGH_COMPLETED_KEY = "WALKTHROUGH_COMPLETED";

export async function getWalkthroughCompleted(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(WALKTHROUGH_COMPLETED_KEY);
        return value === "true";
    } catch (error) {
        console.error("Error reading walkthrough completion:", error);
        return false;
    }
}

export async function setWalkthroughCompleted(
    completed: boolean
): Promise<void> {
    try {
        await AsyncStorage.setItem(
            WALKTHROUGH_COMPLETED_KEY,
            completed ? "true" : "false"
        );
    } catch (error) {
        console.error("Error saving walkthrough completion:", error);
    }
}
