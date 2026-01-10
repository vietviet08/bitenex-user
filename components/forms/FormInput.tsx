import React, { useState } from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";

export interface FormInputProps extends TextInputProps {
    label?: string;
    error?: boolean;
    errorMessage?: string | string[];
    containerStyle?: object;
    showPasswordToggle?: boolean;
}

export function FormInput({
    label,
    error = false,
    errorMessage,
    containerStyle,
    style,
    showPasswordToggle = false,
    secureTextEntry,
    ...textInputProps
}: Readonly<FormInputProps>) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    let errorMessages: string[] = [];
    if (Array.isArray(errorMessage)) {
        errorMessages = errorMessage;
    } else if (errorMessage) {
        errorMessages = [errorMessage];
    }

    const hasError = error && errorMessages.length > 0;
    const isPassword = showPasswordToggle && secureTextEntry;
    const actualSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;
    
    let accessibilityLabel: string | undefined;
    if (label) {
        accessibilityLabel = hasError
            ? `${label}, Error: ${errorMessages.join(", ")}`
            : label;
    }

    const inputClassName = [
        'h-12',
        'border',
        hasError ? 'border-error' : 'border-border-light',
        'rounded-md',
        'px-md',
        'text-base',
        'text-text-primary',
        'bg-background-primary',
        isPassword && 'pr-12',
    ].filter(Boolean).join(' ');

    return (
        <View className="mb-lg" style={containerStyle}>
            {label && (
                <Text className="text-sm font-medium text-text-primary mb-sm" accessibilityLabel={label}>
                    {label}
                </Text>
            )}
            <View className="relative">
                <TextInput
                    className={inputClassName}
                    style={style}
                    placeholderTextColor={colors.text.tertiary}
                    secureTextEntry={actualSecureTextEntry}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityHint={
                        hasError
                            ? `Error: ${errorMessages.join(", ")}`
                            : undefined
                    }
                    {...textInputProps}
                />
                {isPassword && (
                    <TouchableOpacity
                        className="absolute right-md top-0 bottom-0 justify-center items-center w-10"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        accessibilityLabel={
                            isPasswordVisible ? "Hide password" : "Show password"
                        }
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={20}
                            color={colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {hasError && (
                <View
                    className="mt-xs"
                    accessibilityLiveRegion="polite"
                >
                    {errorMessages.map((msg) => (
                        <Text
                            key={msg}
                            className="text-xs text-error"
                            accessibilityRole="alert"
                        >
                            {msg}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}
