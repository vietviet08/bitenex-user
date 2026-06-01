import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    acceptCall,
    endCall,
    getCall,
    getOrderById,
    rejectCall,
    socketClient,
    startOrderCall,
    type OrderCall,
} from "@/services";
import {
    joinAgoraVoiceChannel,
    leaveAgoraVoiceChannel,
    setAgoraMuted,
    setAgoraSpeakerEnabled,
} from "@/services/agoraCall";
import {
    startIncomingCallRingtone,
    stopIncomingCallRingtone,
} from "@/services/callRingtone";

type UiState =
    | "loading"
    | "incoming"
    | "ringing"
    | "connecting"
    | "active"
    | "ended"
    | "error";

export default function CallScreen() {
    const { orderId, callId } = useLocalSearchParams<{
        orderId?: string;
        callId?: string;
    }>();
    const [call, setCall] = useState<OrderCall | null>(null);
    const [uiState, setUiState] = useState<UiState>("loading");
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);

    const activeCallId = call?.id ?? callId;
    const activeOrderId = orderId ?? call?.order_id;
    const [duration, setDuration] = useState(0);
    const [driverName, setDriverName] = useState<string | null>(null);
    const [driverAvatar, setDriverAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (!activeOrderId) return;
        let active = true;
        const fetchDriverInfo = async () => {
            try {
                const orderData = await getOrderById(activeOrderId);
                if (active) {
                    setDriverName(orderData.driver_name ?? null);
                    setDriverAvatar(orderData.driver_avatar_url ?? null);
                }
            } catch (err) {
                console.warn("[Call] Failed to fetch driver info:", err);
            }
        };
        void fetchDriverInfo();
        return () => {
            active = false;
        };
    }, [activeOrderId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (uiState === "active") {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [uiState]);

    const formatDuration = useCallback((secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, []);

    const joinCall = useCallback(async (payload: Awaited<ReturnType<typeof startOrderCall>>) => {
        stopIncomingCallRingtone();
        setCall(payload.call);
        setUiState("connecting");
        await joinAgoraVoiceChannel({
            appId: payload.agora_app_id,
            token: payload.agora_token,
            uid: payload.agora_uid,
            channelName: payload.call.channel_name,
            onRemoteJoined: () => setUiState("active"),
            onRemoteOffline: () => setUiState("ended"),
        });
        if (payload.call.status === "RINGING") {
            setUiState("ringing");
        } else {
            setUiState("active");
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            try {
                if (orderId) {
                    const payload = await startOrderCall(orderId);
                    if (!cancelled) await joinCall(payload);
                    return;
                }

                if (callId) {
                    const response = await getCall(callId);
                    if (cancelled) return;
                    setCall(response.call);
                    if (response.call.status === "RINGING") {
                        setUiState("incoming");
                    } else if (response.call.status === "ACCEPTED") {
                        setUiState("active");
                    } else {
                        setUiState("ended");
                    }
                    return;
                }

                setError("Missing call or order id.");
                setUiState("error");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not start call.");
                setUiState("error");
            }
        };

        void bootstrap();
        return () => {
            cancelled = true;
            stopIncomingCallRingtone();
            leaveAgoraVoiceChannel();
        };
    }, [callId, joinCall, orderId]);

    useEffect(() => {
        if (uiState !== "incoming") {
            stopIncomingCallRingtone();
            return;
        }

        void startIncomingCallRingtone().catch((err) => {
            console.warn(
                "[Call] Could not start incoming ringtone:",
                err instanceof Error ? err.message : String(err),
            );
        });

        return () => {
            stopIncomingCallRingtone();
        };
    }, [uiState]);

    useEffect(() => {
        const handleTerminal = (data: OrderCall) => {
            if (data.id !== activeCallId) return;
            setCall(data);
            setUiState("ended");
            stopIncomingCallRingtone();
            leaveAgoraVoiceChannel();
        };
        const handleAccepted = (data: OrderCall) => {
            if (data.id !== activeCallId) return;
            setCall(data);
            stopIncomingCallRingtone();
            setUiState("active");
        };

        socketClient.on("call.accepted", handleAccepted);
        socketClient.on("call.rejected", handleTerminal);
        socketClient.on("call.ended", handleTerminal);
        socketClient.on("call.missed", handleTerminal);

        return () => {
            socketClient.off("call.accepted", handleAccepted);
            socketClient.off("call.rejected", handleTerminal);
            socketClient.off("call.ended", handleTerminal);
            socketClient.off("call.missed", handleTerminal);
        };
    }, [activeCallId]);

    const handleAccept = useCallback(async () => {
        if (!activeCallId || isAccepting) return;
        let didAccept = false;
        setIsAccepting(true);
        stopIncomingCallRingtone();
        try {
            const payload = await acceptCall(activeCallId);
            didAccept = true;
            await joinCall(payload);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown call error.";
            console.warn("[Call] Accept failed:", message);
            if (didAccept) {
                await endCall(activeCallId).catch(() => undefined);
                leaveAgoraVoiceChannel();
                setError(message);
                setUiState("error");
                Alert.alert("Call audio failed", message || "Could not connect audio. Please try calling again.");
            } else {
                setUiState("ended");
                Alert.alert("Call unavailable", message || "This call can no longer be accepted.");
            }
        } finally {
            setIsAccepting(false);
        }
    }, [activeCallId, isAccepting, joinCall]);

    const handleReject = useCallback(async () => {
        if (activeCallId) {
            await rejectCall(activeCallId).catch(() => undefined);
        }
        stopIncomingCallRingtone();
        leaveAgoraVoiceChannel();
        router.back();
    }, [activeCallId]);

    const handleEnd = useCallback(async () => {
        if (activeCallId) {
            await endCall(activeCallId).catch(() => undefined);
        }
        stopIncomingCallRingtone();
        leaveAgoraVoiceChannel();
        setUiState("ended");
        router.back();
    }, [activeCallId]);

    const toggleMute = useCallback(() => {
        setAgoraMuted(!isMuted);
        setIsMuted((current) => !current);
    }, [isMuted]);

    const toggleSpeaker = useCallback(() => {
        setAgoraSpeakerEnabled(!isSpeakerEnabled);
        setIsSpeakerEnabled((current) => !current);
    }, [isSpeakerEnabled]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
            {/* Header */}
            <View className="w-full flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => {
                        if (uiState === "active" || uiState === "ringing") {
                            router.back();
                        } else {
                            handleEnd();
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:opacity-80"
                >
                    <MaterialIcons name="chevron-left" size={28} color="#1e293b" />
                </Pressable>
                <View className="flex-row items-center bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-100/50">
                    <MaterialIcons name="security" size={14} color="#0891b2" />
                    <Text className="text-cyan-700 text-xs font-semibold ml-1">Kết nối bảo mật</Text>
                </View>
                <View className="w-10" />
            </View>

            {/* Profile Section */}
            <View className="flex-1 items-center justify-center px-8 pb-12">
                <View className="items-center justify-center mb-8">
                    <View className="w-36 h-36 rounded-full bg-cyan-50 items-center justify-center border border-cyan-100/50 shadow-sm">
                        <View className="w-28 h-28 rounded-full bg-cyan-100/80 items-center justify-center overflow-hidden">
                            {driverAvatar ? (
                                <Image
                                    source={{ uri: driverAvatar }}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                />
                            ) : (
                                <View className="w-20 h-20 rounded-full bg-cyan-600 items-center justify-center shadow-md">
                                    <MaterialIcons name="person" size={42} color="#ffffff" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View className="bg-slate-200/60 px-3.5 py-1 rounded-full mb-3">
                    <Text className="text-slate-600 text-xs font-bold uppercase tracking-wider">Tài xế của bạn</Text>
                </View>

                <Text className="text-slate-800 text-2xl font-bold text-center">
                    {driverName ?? "Tài xế Bitenex"}
                </Text>

                <Text className="text-slate-500 text-base font-semibold mt-2 text-center">
                    {uiState === "active" ? (
                        <Text className="text-cyan-600 tracking-wider font-mono">{formatDuration(duration)}</Text>
                    ) : uiState === "incoming" ? (
                        "Tài xế đang gọi cho bạn..."
                    ) : uiState === "connecting" ? (
                        "Đang thiết lập kênh thoại..."
                    ) : uiState === "ringing" ? (
                        "Đang đổ chuông..."
                    ) : uiState === "ended" ? (
                        "Cuộc gọi đã hoàn thành."
                    ) : uiState === "error" ? (
                        error ?? "Không thể thực hiện cuộc gọi."
                    ) : (
                        "Vui lòng chờ trong giây lát..."
                    )}
                </Text>
            </View>

            {/* Controls Container */}
            <View className="px-8 pb-12 items-center">
                {/* Incoming state controls */}
                {uiState === "incoming" && (
                    <View className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex-row justify-around items-center">
                        <View className="items-center">
                            <Pressable
                                onPress={handleReject}
                                className="w-16 h-16 rounded-full bg-rose-500 items-center justify-center shadow-lg shadow-rose-200 active:opacity-85"
                            >
                                <MaterialIcons name="call-end" size={28} color="#ffffff" />
                            </Pressable>
                            <Text className="text-slate-500 text-xs font-bold mt-2">Từ chối</Text>
                        </View>

                        <View className="items-center">
                            <Pressable
                                onPress={handleAccept}
                                disabled={isAccepting}
                                className={`w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-cyan-200 ${
                                    isAccepting ? "bg-cyan-400" : "bg-cyan-500 active:opacity-85"
                                }`}
                            >
                                {isAccepting ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <MaterialIcons name="call" size={28} color="#ffffff" />
                                )}
                            </Pressable>
                            <Text className="text-slate-500 text-xs font-bold mt-2">Bắt máy</Text>
                        </View>
                    </View>
                )}

                {/* Active/Ringing controls */}
                {(uiState === "connecting" || uiState === "ringing" || uiState === "active") && (
                    <View className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex-row justify-between items-center px-8">
                        <View className="items-center">
                            <Pressable
                                onPress={toggleMute}
                                className={`w-14 h-14 rounded-full items-center justify-center border ${
                                    isMuted
                                        ? "bg-rose-50 border-rose-100 active:opacity-85"
                                        : "bg-slate-50 border-slate-200/80 active:opacity-85"
                                }`}
                            >
                                <MaterialIcons
                                    name={isMuted ? "mic-off" : "mic"}
                                    size={24}
                                    color={isMuted ? "#e11d48" : "#475569"}
                                />
                            </Pressable>
                            <Text className="text-slate-500 text-xs font-bold mt-2">Tắt tiếng</Text>
                        </View>

                        <View className="items-center">
                            <Pressable
                                onPress={handleEnd}
                                className="w-20 h-20 rounded-full bg-rose-600 items-center justify-center shadow-lg shadow-rose-200 active:opacity-85"
                            >
                                <MaterialIcons name="call-end" size={32} color="#ffffff" />
                            </Pressable>
                            <Text className="text-slate-500 text-xs font-bold mt-2">Dừng gọi</Text>
                        </View>

                        <View className="items-center">
                            <Pressable
                                onPress={toggleSpeaker}
                                className={`w-14 h-14 rounded-full items-center justify-center border ${
                                    isSpeakerEnabled
                                        ? "bg-cyan-50 border-cyan-100 active:opacity-85"
                                        : "bg-slate-50 border-slate-200/80 active:opacity-85"
                                }`}
                            >
                                <MaterialIcons
                                    name="volume-up"
                                    size={24}
                                    color={isSpeakerEnabled ? "#0891b2" : "#475569"}
                                />
                            </Pressable>
                            <Text className="text-slate-500 text-xs font-bold mt-2">Loa ngoài</Text>
                        </View>
                    </View>
                )}

                {/* Ended / Error state */}
                {(uiState === "ended" || uiState === "error") && (
                    <Pressable
                        onPress={() => router.back()}
                        className="w-full max-w-xs bg-slate-800 py-3.5 rounded-2xl items-center shadow-md active:opacity-85"
                    >
                        <Text className="text-white text-base font-bold">Đóng</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
