import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    acceptCall,
    endCall,
    getCall,
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

    const activeCallId = call?.id ?? callId;
    const title = useMemo(() => {
        if (uiState === "incoming") return "Incoming driver call";
        if (uiState === "active") return "Driver call";
        if (uiState === "ended") return "Call ended";
        return "Calling driver";
    }, [uiState]);

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
        if (!activeCallId) return;
        try {
            const payload = await acceptCall(activeCallId);
            await joinCall(payload);
        } catch {
            Alert.alert("Call unavailable", "This call can no longer be accepted.");
            setUiState("ended");
        }
    }, [activeCallId, joinCall]);

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
        <SafeAreaView className="flex-1 bg-gray-950" edges={["top", "bottom"]}>
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-28 h-28 rounded-full bg-white/10 items-center justify-center mb-7">
                    <IconSymbol name="phone" size={42} color="#ffffff" />
                </View>
                <Text className="text-white text-2xl font-bold text-center">{title}</Text>
                <Text className="text-white/65 text-center mt-3 leading-6">
                    {uiState === "incoming"
                        ? "Your driver is calling about this order."
                        : uiState === "active"
                          ? "Voice call is active."
                          : uiState === "ended"
                            ? "The call has finished."
                            : uiState === "error"
                              ? error ?? "Call failed."
                              : "Connecting securely through Bitenex."}
                </Text>

                {(uiState === "loading" || uiState === "connecting") && (
                    <ActivityIndicator className="mt-8" color="#ffffff" />
                )}

                {uiState === "incoming" && (
                    <View className="flex-row gap-8 mt-12">
                        <Pressable
                            onPress={handleReject}
                            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                        >
                            <IconSymbol name="cancel" size={28} color="#ffffff" />
                        </Pressable>
                        <Pressable
                            onPress={handleAccept}
                            className="w-16 h-16 rounded-full bg-green-500 items-center justify-center active:bg-green-600"
                        >
                            <IconSymbol name="phone" size={28} color="#ffffff" />
                        </Pressable>
                    </View>
                )}

                {(uiState === "ringing" || uiState === "active") && (
                    <View className="items-center mt-12">
                        <View className="flex-row gap-5 mb-8">
                            <Pressable
                                onPress={toggleMute}
                                className="w-14 h-14 rounded-full bg-white/10 items-center justify-center"
                            >
                                <IconSymbol name={isMuted ? "music-off" : "volume-up"} size={24} color="#ffffff" />
                            </Pressable>
                            <Pressable
                                onPress={toggleSpeaker}
                                className="w-14 h-14 rounded-full bg-white/10 items-center justify-center"
                            >
                                <IconSymbol name="volume-up" size={24} color={isSpeakerEnabled ? "#ffffff" : "#9ca3af"} />
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={handleEnd}
                            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                        >
                            <IconSymbol name="cancel" size={28} color="#ffffff" />
                        </Pressable>
                    </View>
                )}

                {(uiState === "ended" || uiState === "error") && (
                    <Pressable
                        onPress={() => router.back()}
                        className="mt-10 rounded-2xl bg-white px-6 py-3 active:opacity-80"
                    >
                        <Text className="text-gray-950 font-bold">Close</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
