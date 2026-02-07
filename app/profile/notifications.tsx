import React, { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, NotificationItem } from "@/components/profile";

type NotificationType = "success" | "cancelled" | "info" | "promo" | "account";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isNew: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "cancelled",
        title: "Orders Cancelled!",
        message:
            "You have canceled an order at Burger Hut. We apologize for your inconvenience. We will try to improve our service next time 😢",
        timestamp: "19 Dec, 2022 | 20:50 PM",
        isNew: true,
    },
    {
        id: "2",
        type: "success",
        title: "Orders Successful!",
        message:
            "You have placed an order at Burger Hut and paid $24. Your food will arrive soon. Enjoy our services 😃",
        timestamp: "19 Dec, 2022 | 20:49 PM",
        isNew: true,
    },
    {
        id: "3",
        type: "info",
        title: "New Services Available!",
        message:
            "You can now make multiple food orders at one time. You can also cancel your orders.",
        timestamp: "14 Dec, 2022 | 10:52 AM",
        isNew: false,
    },
    {
        id: "4",
        type: "promo",
        title: "Credit Card Connected!",
        message:
            "Your credit card has been successfully linked with Foodu. Enjoy our services.",
        timestamp: "12 Dec, 2022 | 15:38 PM",
        isNew: false,
    },
    {
        id: "5",
        type: "account",
        title: "Account Setup Successful!",
        message:
            "Your account creation is successful, you can now experience our services.",
        timestamp: "12 Dec, 2022 | 14:27 PM",
        isNew: false,
    },
];

export default function NotificationsScreen() {
    const renderItem = useCallback(
        ({ item }: { item: Notification }) => (
            <View className="mb-3">
                <NotificationItem
                    id={item.id}
                    type={item.type}
                    title={item.title}
                    message={item.message}
                    timestamp={item.timestamp}
                    isNew={item.isNew}
                />
            </View>
        ),
        []
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Notification" />
            <FlashList
                data={MOCK_NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={140}
            />
        </SafeAreaView>
    );
}
