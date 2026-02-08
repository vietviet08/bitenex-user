import React, { memo, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Driver } from "./DriverCard";

type CallStatus = "incoming" | "outgoing" | "connected" | "ended";

interface VoiceCallUIProps {
    readonly driver: Driver;
    readonly status: CallStatus;
    readonly onMuteToggle?: (muted: boolean) => void;
    readonly onSpeakerToggle?: (speaker: boolean) => void;
    readonly onEndCall?: () => void;
    readonly onAcceptCall?: () => void;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function VoiceCallUIComponent({
    driver,
    status,
    onMuteToggle,
    onSpeakerToggle,
    onEndCall,
    onAcceptCall,
}: VoiceCallUIProps) {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === "connected") {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleMute = () => {
        setIsMuted(!isMuted);
        onMuteToggle?.(!isMuted);
    };

    const handleSpeaker = () => {
        setIsSpeaker(!isSpeaker);
        onSpeakerToggle?.(!isSpeaker);
    };

    const getStatusText = () => {
        switch (status) {
            case "incoming":
                return "Incoming Call...";
            case "outgoing":
                return "Calling...";
            case "connected":
                return formatDuration(duration);
            case "ended":
                return "Call Ended";
        }
    };

    return (
        <View className="flex-1 bg-gray-900 items-center justify-between py-16 px-8">
            {/* Driver info */}
            <View className="items-center">
                <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-6">
                    <Image
                        source={{ uri: driver.avatarUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                </View>
                <Text className="text-2xl font-bold text-white mb-2">
                    {driver.name}
                </Text>
                <Text className="text-lg text-gray-400">{getStatusText()}</Text>
            </View>

            {/* Controls */}
            <View className="w-full">
                {status === "incoming" ? (
                    <View className="flex-row justify-center gap-16">
                        <Pressable
                            onPress={onEndCall}
                            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                        >
                            <IconSymbol name="phone" size={28} color="#ffffff" />
                        </Pressable>
                        <Pressable
                            onPress={onAcceptCall}
                            className="w-16 h-16 rounded-full bg-green-500 items-center justify-center active:bg-green-600"
                        >
                            <IconSymbol name="phone" size={28} color="#ffffff" />
                        </Pressable>
                    </View>
                ) : (
                    <View className="flex-row justify-center gap-8">
                        <Pressable
                            onPress={handleMute}
                            className={`w-14 h-14 rounded-full items-center justify-center ${isMuted ? "bg-white" : "bg-white/20"
                                }`}
                        >
                            <IconSymbol
                                name="music-off"
                                size={24}
                                color={isMuted ? "#212121" : "#ffffff"}
                            />
                        </Pressable>
                        <Pressable
                            onPress={onEndCall}
                            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                        >
                            <IconSymbol name="phone" size={28} color="#ffffff" />
                        </Pressable>
                        <Pressable
                            onPress={handleSpeaker}
                            className={`w-14 h-14 rounded-full items-center justify-center ${isSpeaker ? "bg-white" : "bg-white/20"
                                }`}
                        >
                            <IconSymbol
                                name="volume-up"
                                size={24}
                                color={isSpeaker ? "#212121" : "#ffffff"}
                            />
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

export const VoiceCallUI = memo(VoiceCallUIComponent);
