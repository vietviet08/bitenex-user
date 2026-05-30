import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ERROR_CODES } from "@/constants/errorCodes";
import { api } from "@/services/api";
import { ApiErrorException } from "@/services/apiError";
import { getOrderById, type OrderResponse } from "@/services/order";
import {
    createPayment,
    generateIdempotencyKey,
    getPaymentByTransaction,
    type PaymentResponse,
} from "@/services/payment";
import { useCartStore } from "@/store/zustand/cart.store";
import { usePaymentStore } from "@/store/zustand/payment.store";

type ReconcileState = "processing" | "success" | "failed" | "timeout";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20;
const SUCCESS_ORDER_STATES = new Set([
    "CONFIRMED",
    "PREPARING",
    "READY",
    "PICKING_UP",
    "DELIVERING",
    "DELIVERED",
    "REFUNDED",
]);

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSingle(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

export default function PaymentResultScreen() {
    const params = useLocalSearchParams<Record<string, string | string[]>>();

    const pendingPayment = usePaymentStore((state) => state.pendingPayment);
    const setPendingPayment = usePaymentStore((state) => state.setPendingPayment);
    const clearPendingPayment = usePaymentStore((state) => state.clearPendingPayment);
    const clearCart = useCartStore((state) => state.clearCart);

    const [state, setState] = useState<ReconcileState>("processing");
    const [isLoading, setIsLoading] = useState(true);
    const [payment, setPayment] = useState<PaymentResponse | null>(null);
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const transactionId = useMemo(() => {
        return (
            toSingle(params.transactionId) ||
            toSingle(params.vnp_TxnRef) ||
            pendingPayment?.transactionId ||
            ""
        );
    }, [params.transactionId, params.vnp_TxnRef, pendingPayment?.transactionId]);

    const orderIdFromParams = useMemo(() => toSingle(params.orderId), [params.orderId]);

    const vnpReturnParamsRef = useRef<Record<string, string>>({});
    if (Object.keys(vnpReturnParamsRef.current).length === 0) {
        const collected: Record<string, string> = {};
        for (const [key, value] of Object.entries(params)) {
            if (!key.startsWith("vnp_")) continue;
            const normalized = toSingle(value);
            if (normalized) collected[key] = normalized;
        }
        vnpReturnParamsRef.current = collected;
    }

    const startedTransactionRef = useRef<string>("");
    const isReconcilingRef = useRef(false);
    const hasSyncedWebhookRef = useRef(false);

    const syncWebhookIfNeeded = useCallback(async () => {
        if (hasSyncedWebhookRef.current) return;

        const payload = vnpReturnParamsRef.current;
        if (!payload.vnp_TxnRef || !payload.vnp_SecureHash) return;

        await api.get("/payments/webhook/vnpay", { params: payload });
        hasSyncedWebhookRef.current = true;
    }, []);

    const runReconcile = useCallback(async (force: boolean = false) => {
        if (!transactionId) {
            setState("failed");
            setErrorMessage("Missing transaction reference.");
            setIsLoading(false);
            return;
        }

        if (isReconcilingRef.current) return;
        if (!force && state === "success") return;

        isReconcilingRef.current = true;
        setIsLoading(true);
        setState("processing");
        setErrorMessage("");

        try {
            try {
                await syncWebhookIfNeeded();
            } catch (error) {
                const err = error;
                if (err instanceof ApiErrorException) {
                    if (
                        err.errorCode === ERROR_CODES.INVALID_PAYMENT_SIGNATURE
                        || err.errorCode === ERROR_CODES.VALIDATION_ERROR
                    ) {
                        throw err;
                    }
                }
            }

            for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
                const paymentResult = await getPaymentByTransaction(transactionId);
                setPayment(paymentResult);

                const orderResult = await getOrderById(paymentResult.order_id);
                setOrder(orderResult);

                if (
                    paymentResult.status === "COMPLETED"
                    && SUCCESS_ORDER_STATES.has(orderResult.status)
                ) {
                    setPendingPayment({
                        orderId: paymentResult.order_id,
                        paymentId: paymentResult.id,
                        transactionId: paymentResult.transaction_id,
                    });
                    clearCart();
                    setState("success");
                    setIsLoading(false);
                    return;
                }

                if (
                    paymentResult.status === "FAILED"
                    || paymentResult.status === "CANCELLED"
                ) {
                    setState("failed");
                    setErrorMessage(
                        paymentResult.error_message || "Payment failed or was cancelled.",
                    );
                    setIsLoading(false);
                    return;
                }

                await sleep(POLL_INTERVAL_MS);
            }

            setState("timeout");
            setErrorMessage("Payment is still processing. Please refresh in a moment.");
            setIsLoading(false);
        } finally {
            isReconcilingRef.current = false;
        }
    }, [clearCart, setPendingPayment, state, syncWebhookIfNeeded, transactionId]);

    useEffect(() => {
        if (!transactionId) return;
        if (startedTransactionRef.current === transactionId) return;

        startedTransactionRef.current = transactionId;
        runReconcile().catch((error) => {
            const err = error as unknown;
            const apiError = err instanceof ApiErrorException ? err : null;
            setState("failed");
            setIsLoading(false);
            setErrorMessage(apiError?.message || "Unable to verify payment result.");
            isReconcilingRef.current = false;
        });
    }, [runReconcile, transactionId]);

    const handleRetryPayment = useCallback(async () => {
        const orderId = payment?.order_id || order?.id || pendingPayment?.orderId || orderIdFromParams;
        if (!orderId || !order) {
            Alert.alert("Retry Failed", "Missing order information.");
            return;
        }

        try {
            const nextPayment = await createPayment(
                {
                    order_id: String(orderId),
                    amount: order.total,
                    currency: "VND",
                    method: "VNPAY",
                },
                generateIdempotencyKey(`retry-${orderId}`),
            );

            if (!nextPayment.payment_url) {
                throw new Error("Payment URL was not returned.");
            }

            setPendingPayment({
                orderId: nextPayment.order_id,
                paymentId: nextPayment.id,
                transactionId: nextPayment.transaction_id,
            });

            const canOpen = await Linking.canOpenURL(nextPayment.payment_url);
            if (!canOpen) throw new Error("Unable to open payment URL.");
            await Linking.openURL(nextPayment.payment_url);

            router.replace({
                pathname: "/order/payment-processing",
                params: {
                    orderId: nextPayment.order_id,
                    transactionId: nextPayment.transaction_id,
                },
            });
        } catch (error) {
            const err = error;
            if (err instanceof ApiErrorException) {
                if (err.errorCode === ERROR_CODES.IDEMPOTENCY_CONFLICT) {
                    Alert.alert(
                        "Retry Conflict",
                        "The previous payment request is still being processed.",
                    );
                } else {
                    Alert.alert("Retry Failed", err.message);
                }
                return;
            }
            Alert.alert(
                "Retry Failed",
                error instanceof Error ? error.message : "Unexpected payment error.",
            );
        }
    }, [order, orderIdFromParams, payment?.order_id, pendingPayment?.orderId, setPendingPayment]);

    const handleTrackOrder = useCallback(() => {
        const orderId = payment?.order_id || order?.id || pendingPayment?.orderId || orderIdFromParams;
        clearPendingPayment();
        if (!orderId) {
            router.replace("/(tabs)/orders");
            return;
        }
        router.replace({
            pathname: "/order/tracking",
            params: { orderId },
        });
    }, [clearPendingPayment, order?.id, orderIdFromParams, payment?.order_id, pendingPayment?.orderId]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center">
                {(isLoading || state === "processing") && (
                    <>
                        <ActivityIndicator size="large" />
                        <Text className="text-2xl font-bold text-center mt-5 text-text-primary">
                            Verifying Payment
                        </Text>
                        <Text className="text-base text-center mt-3 text-text-secondary">
                            We are syncing with backend webhook status. Please wait.
                        </Text>
                    </>
                )}

                {state === "success" && !isLoading && (
                    <>
                        <Text className="text-2xl font-bold text-center text-text-primary">
                            Payment Successful
                        </Text>
                        <Text className="text-base text-center mt-3 text-text-secondary">
                            Your order is confirmed. You can now track delivery.
                        </Text>
                        <Pressable
                            onPress={handleTrackOrder}
                            className="mt-8 bg-primary-500 rounded-full py-4"
                        >
                            <Text className="text-center text-white font-semibold text-base">
                                Track Order
                            </Text>
                        </Pressable>
                    </>
                )}

                {(state === "failed" || state === "timeout") && !isLoading && (
                    <>
                        <Text className="text-2xl font-bold text-center text-text-primary">
                            Payment Not Completed
                        </Text>
                        <Text className="text-base text-center mt-3 text-text-secondary">
                            {errorMessage}
                        </Text>
                        <Pressable
                            onPress={handleRetryPayment}
                            className="mt-8 bg-primary-500 rounded-full py-4"
                        >
                            <Text className="text-center text-white font-semibold text-base">
                                Retry Payment
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => runReconcile(true)}
                            className="mt-3 border border-gray-300 rounded-full py-4"
                        >
                            <Text className="text-center text-text-primary font-semibold text-base">
                                Refresh Status
                            </Text>
                        </Pressable>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
