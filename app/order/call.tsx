import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { VoiceCallUI, Driver } from "@/components/tracking";

// Mock data - API ready interface
const MOCK_DRIVER: Driver = {
    id: "driver-1",
    name: "John Smith",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    totalDeliveries: 156,
    phone: "+84 912 345 678",
    vehicle: {
        type: "Motorcycle",
        model: "Honda Wave",
        plate: "59H1-12345",
        color: "Red",
    },
};

type CallStatus = "incoming" | "outgoing" | "connected" | "ended";

export default function CallScreen() {
    const [callStatus, setCallStatus] = useState<CallStatus>("outgoing");

    useEffect(() => {
        // Simulate call connecting after 2 seconds
        if (callStatus === "outgoing") {
            const timer = setTimeout(() => {
                setCallStatus("connected");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [callStatus]);

    const handleEndCall = () => {
        setCallStatus("ended");
        setTimeout(() => {
            router.back();
        }, 500);
    };

    const handleAcceptCall = () => {
        setCallStatus("connected");
    };

    const handleMuteToggle = (muted: boolean) => {
        console.log("Mute:", muted);
        // TODO: Integrate with real voice call API
    };

    const handleSpeakerToggle = (speaker: boolean) => {
        console.log("Speaker:", speaker);
        // TODO: Integrate with real voice call API
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
            <VoiceCallUI
                driver={MOCK_DRIVER}
                status={callStatus}
                onMuteToggle={handleMuteToggle}
                onSpeakerToggle={handleSpeakerToggle}
                onEndCall={handleEndCall}
                onAcceptCall={handleAcceptCall}
            />
        </SafeAreaView>
    );
}
