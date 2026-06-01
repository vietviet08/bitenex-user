import React, { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, PromoCard } from "@/components/profile";

interface Promo {
    id: string;
    title: string;
    description: string;
    discountText: string;
    code: string;
    expiryDate: string;
    imageUrl?: string;
}

const MOCK_PROMOS: Promo[] = [
    {
        id: "1",
        title: "First Order Special",
        description: "Get discount on your first order with us",
        discountText: "30% OFF",
        code: "FIRST30",
        expiryDate: "Dec 31, 2024",
        imageUrl:
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400",
    },
    {
        id: "2",
        title: "Weekend Feast",
        description: "Special weekend discount on all burgers",
        discountText: "20% OFF",
        code: "WEEKEND20",
        expiryDate: "Jan 15, 2025",
        imageUrl:
            "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400",
    },
    {
        id: "3",
        title: "Free Delivery",
        description: "Free delivery on orders above $25",
        discountText: "FREE",
        code: "FREEDEL",
        expiryDate: "Feb 28, 2025",
    },
    {
        id: "4",
        title: "Refer & Earn",
        description: "Get $10 off when you refer a friend",
        discountText: "$10 OFF",
        code: "REFER10",
        expiryDate: "Mar 31, 2025",
        imageUrl:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    },
];

export default function PromosScreen() {
    const renderItem = useCallback(
        ({ item }: { item: Promo }) => (
            <View className="mb-4">
                <PromoCard
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    discountText={item.discountText}
                    code={item.code}
                    expiryDate={item.expiryDate}
                    imageUrl={item.imageUrl}
                />
            </View>
        ),
        []
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScreenHeader title="Special Offers" />
            <FlashList
                data={MOCK_PROMOS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
