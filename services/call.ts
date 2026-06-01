import { api } from "./api";

export type CallStatus = "RINGING" | "ACCEPTED" | "REJECTED" | "ENDED" | "MISSED";
export type CallRole = "USER" | "DRIVER";

export interface OrderCall {
    id: string;
    order_id: string;
    caller_user_id: string;
    callee_user_id: string;
    caller_role: CallRole;
    callee_role: CallRole;
    channel_name: string;
    status: CallStatus;
    started_at: string;
    accepted_at: string | null;
    ended_at: string | null;
    expires_at: string;
    ended_by: string | null;
    end_reason: string | null;
}

export interface CallTokenResponse {
    call: OrderCall;
    agora_app_id: string;
    agora_token: string;
    agora_uid: number;
    token_expires_at: string;
}

export interface CallActionResponse {
    call: OrderCall;
}

export async function startOrderCall(orderId: string): Promise<CallTokenResponse> {
    const response = await api.post<CallTokenResponse>(`/calls/orders/${orderId}/start`);
    return response.data;
}

export async function acceptCall(callId: string): Promise<CallTokenResponse> {
    const response = await api.post<CallTokenResponse>(`/calls/${callId}/accept`);
    return response.data;
}

export async function rejectCall(callId: string): Promise<CallActionResponse> {
    const response = await api.post<CallActionResponse>(`/calls/${callId}/reject`);
    return response.data;
}

export async function endCall(callId: string): Promise<CallActionResponse> {
    const response = await api.post<CallActionResponse>(`/calls/${callId}/end`);
    return response.data;
}

export async function getCall(callId: string): Promise<CallActionResponse> {
    const response = await api.get<CallActionResponse>(`/calls/${callId}`);
    return response.data;
}
