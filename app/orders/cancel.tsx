import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CancellationReasonModal } from '@/components/orders';

export default function CancelOrderScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    const handleSubmit = (reason: string, otherReason?: string) => {
        // Future: API call to cancel order
        console.log('Cancel order:', orderId, reason, otherReason);
    };

    return <CancellationReasonModal orderId={orderId} onSubmit={handleSubmit} />;
}
