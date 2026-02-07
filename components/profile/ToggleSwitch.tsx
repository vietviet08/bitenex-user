import React, { memo } from "react";
import { View, Text, Switch } from "react-native";

interface ToggleSwitchProps {
    readonly label: string;
    readonly sublabel?: string;
    readonly value: boolean;
    readonly onValueChange: (value: boolean) => void;
}

function ToggleSwitchComponent({
    label,
    sublabel,
    value,
    onValueChange,
}: ToggleSwitchProps) {
    return (
        <View className="flex-row items-center justify-between py-4 px-4">
            <View className="flex-1 mr-4">
                <Text className="font-semibold text-[15px] text-text-primary">
                    {label}
                </Text>
                {sublabel && (
                    <Text className="text-sm text-text-secondary mt-0.5">
                        {sublabel}
                    </Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#e0e0e0", true: "#22c55e" }}
                thumbColor="#ffffff"
            />
        </View>
    );
}

export const ToggleSwitch = memo(ToggleSwitchComponent);
