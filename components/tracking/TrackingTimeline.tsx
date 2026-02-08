import React, { memo } from "react";
import { View, Text } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

type OrderStatus =
    | "placed"
    | "confirmed"
    | "preparing"
    | "picked_up"
    | "on_the_way"
    | "delivered";

interface TrackingStep {
    status: OrderStatus;
    label: string;
    time?: string;
}

interface TrackingTimelineProps {
    readonly currentStatus: OrderStatus;
    readonly steps?: TrackingStep[];
}

const DEFAULT_STEPS: TrackingStep[] = [
    { status: "placed", label: "Order Placed" },
    { status: "confirmed", label: "Order Confirmed" },
    { status: "preparing", label: "Preparing Food" },
    { status: "picked_up", label: "Driver Picked Up" },
    { status: "on_the_way", label: "On the Way" },
    { status: "delivered", label: "Delivered" },
];

const STATUS_ORDER: OrderStatus[] = [
    "placed",
    "confirmed",
    "preparing",
    "picked_up",
    "on_the_way",
    "delivered",
];

function TrackingTimelineComponent({
    currentStatus,
    steps = DEFAULT_STEPS,
}: TrackingTimelineProps) {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);

    return (
        <View className="py-2">
            {steps.map((step, index) => {
                const stepIndex = STATUS_ORDER.indexOf(step.status);
                const isCompleted = stepIndex < currentIndex;
                const isCurrent = stepIndex === currentIndex;
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.status} className="flex-row">
                        {/* Left: Icon and line */}
                        <View className="items-center mr-4">
                            <View
                                className={`w-8 h-8 rounded-full items-center justify-center ${isCompleted || isCurrent
                                        ? "bg-primary-500"
                                        : "bg-gray-200"
                                    }`}
                            >
                                {isCompleted ? (
                                    <IconSymbol
                                        name="security"
                                        size={16}
                                        color="#ffffff"
                                    />
                                ) : (
                                    <View
                                        className={`w-3 h-3 rounded-full ${isCurrent ? "bg-white" : "bg-gray-400"
                                            }`}
                                    />
                                )}
                            </View>
                            {!isLast && (
                                <View
                                    className={`w-0.5 h-8 ${isCompleted ? "bg-primary-500" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </View>

                        {/* Right: Label and time */}
                        <View className="flex-1 pb-6">
                            <Text
                                className={`font-semibold text-[15px] ${isCompleted || isCurrent
                                        ? "text-text-primary"
                                        : "text-text-secondary"
                                    }`}
                            >
                                {step.label}
                            </Text>
                            {step.time && (
                                <Text className="text-sm text-text-secondary mt-0.5">
                                    {step.time}
                                </Text>
                            )}
                            {isCurrent && !step.time && (
                                <Text className="text-sm text-primary-500 mt-0.5">
                                    In progress...
                                </Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

export const TrackingTimeline = memo(TrackingTimelineComponent);
