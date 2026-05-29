import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CancellationReasonModal } from '@/components/orders';
import { cancelOrder } from '@/services';

export default function CancelOrderScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (reason: string, otherReason?: string) => {
        if (!orderId) {
            Alert.alert("Unable to cancel", "Missing order id.");
            throw new Error("Missing order id");
        }

        const finalReason = otherReason?.trim() || reason;
        setIsSubmitting(true);
        try {
            await cancelOrder(orderId, finalReason);
        } catch (error) {
            Alert.alert(
                "Unable to cancel",
                "This order can no longer be cancelled. Please contact support if you need help.",
            );
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CancellationReasonModal
            orderId={orderId}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
        />
    );
}
