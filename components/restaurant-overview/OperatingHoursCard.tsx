import { View, Text } from "react-native";
import { memo, useMemo } from "react";

interface OperatingHour {
    readonly day: string;
    readonly open: string;
    readonly close: string;
    readonly isClosed: boolean;
}

interface OperatingHoursCardProps {
    readonly hours: OperatingHour[];
}

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const OperatingHoursCard = memo(function OperatingHoursCard({
    hours,
}: OperatingHoursCardProps) {
    const currentDay = useMemo(() => {
        const dayIndex = new Date().getDay();
        return DAYS[dayIndex];
    }, []);

    return (
        <View className="px-4 py-4">
            <Text className="text-lg font-bold text-neutral-900 mb-3">
                Operating Hours
            </Text>

            <View className="bg-neutral-50 rounded-xl p-3 gap-2">
                {hours.map((hour) => {
                    const isToday = hour.day === currentDay;
                    return (
                        <View
                            key={hour.day}
                            className={`flex-row items-center justify-between py-2 px-2 rounded-lg ${isToday ? "bg-primary-50" : ""
                                }`}
                        >
                            <View className="flex-row items-center gap-2">
                                {isToday && (
                                    <View className="w-2 h-2 rounded-full bg-primary-500" />
                                )}
                                <Text
                                    className={`text-base ${isToday
                                            ? "font-semibold text-primary-600"
                                            : "text-neutral-700"
                                        }`}
                                >
                                    {hour.day}
                                </Text>
                            </View>
                            <Text
                                className={`text-base ${hour.isClosed
                                        ? "text-error-500"
                                        : isToday
                                            ? "font-semibold text-primary-600"
                                            : "text-neutral-600"
                                    }`}
                            >
                                {hour.isClosed
                                    ? "Closed"
                                    : `${hour.open} - ${hour.close}`}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
});
