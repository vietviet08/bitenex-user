import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DeliverySuccessModal } from "@/components/feedback";

export default function DeliverySuccessScreen() {
    const [showModal, setShowModal] = useState(true);
    const params = useLocalSearchParams<{ orderId?: string; orderNumber?: string }>();

    const handleConfirm = () => {
        setShowModal(false);
        if (!params.orderId) {
            router.replace("/(tabs)/orders");
            return;
        }
        router.replace({
            pathname: "/order/driver-rating",
            params: { orderId: params.orderId },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <DeliverySuccessModal
                visible={showModal}
                onConfirm={handleConfirm}
                orderInfo={{
                    orderId: params.orderNumber ?? params.orderId ?? "",
                    deliveryTime: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }}
            />
        </SafeAreaView>
    );
}
