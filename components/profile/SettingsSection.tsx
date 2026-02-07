import React, { memo } from "react";
import { View, Text } from "react-native";

interface SettingsSectionProps {
    readonly title?: string;
    readonly children: React.ReactNode;
}

function SettingsSectionComponent({ title, children }: SettingsSectionProps) {
    return (
        <View className="mb-4">
            {title && (
                <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-3">
                    {title}
                </Text>
            )}
            <View>{children}</View>
        </View>
    );
}

export const SettingsSection = memo(SettingsSectionComponent);
