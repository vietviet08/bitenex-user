import { api } from "./api";
import { ERROR_CODES } from "@/constants/errorCodes";

export type PaymentStatus =
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
    | "CANCELLED";

export interface CreatePaymentInput {
    order_id: string;
    amount: number;
    currency?: string;
    method?: "VNPAY" | "CASH_ON_DELIVERY";
}

export interface PaymentResponse {
    id: string;
    transaction_id: string;
    order_id: string;
    user_id: string;
    amount: number;
    currency: string;
    method: string;
    status: PaymentStatus;
    gateway: string | null;
    payment_url: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export function generateIdempotencyKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createPayment(
    payload: CreatePaymentInput,
    idempotencyKey: string,
): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>("/payments", payload, {
        headers: {
            "Idempotency-Key": idempotencyKey,
        },
    });
    return response.data;
}

export async function getPaymentByTransaction(
    transactionId: string,
): Promise<PaymentResponse> {
    const response = await api.get<PaymentResponse>(
        `/payments/transaction/${transactionId}`,
    );
    return response.data;
}

export function isRetryablePaymentError(errorCode?: string): boolean {
    if (!errorCode) return false;
    return (
        errorCode === ERROR_CODES.EXTERNAL_SERVICE_ERROR ||
        errorCode === ERROR_CODES.SERVICE_UNAVAILABLE
    );
}
