import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { DeliverySuccessModal } from "@/components/feedback";

// Mock data - API ready
const MOCK_ORDER = {
    orderId: "ORD-123456",
    deliveryTime: "12:45 PM",
};

export default function DeliverySuccessScreen() {
    const [showModal, setShowModal] = useState(true);
    const params = useLocalSearchParams<{ orderId?: string }>();

    const handleConfirm = () => {
        setShowModal(false);
        router.push({
            pathname: "/order/driver-rating",
            params: { orderId: params.orderId || MOCK_ORDER.orderId },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <DeliverySuccessModal
                visible={showModal}
                onConfirm={handleConfirm}
                orderInfo={{
                    orderId: params.orderId || MOCK_ORDER.orderId,
                    deliveryTime: MOCK_ORDER.deliveryTime,
                }}
            />
        </SafeAreaView>
    );
}
