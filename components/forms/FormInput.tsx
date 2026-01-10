import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, textStyles } from "@/theme";
import { borderRadius } from "@/theme/spacing";

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

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={styles.label} accessibilityLabel={label}>
                    {label}
                </Text>
            )}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        hasError && styles.inputError,
                        isPassword && styles.inputWithIcon,
                        style,
                    ]}
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
                        style={styles.eyeIcon}
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
                    style={styles.errorContainer}
                    accessibilityLiveRegion="polite"
                >
                    {errorMessages.map((msg) => (
                        <Text
                            key={msg}
                            style={styles.errorText}
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

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        ...textStyles.label,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    inputWrapper: {
        position: "relative",
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...textStyles.body,
        color: colors.text.primary,
        backgroundColor: colors.background.primary,
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    inputError: {
        borderColor: colors.error,
    },
    eyeIcon: {
        position: "absolute",
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        width: 40,
    },
    errorContainer: {
        marginTop: spacing.xs,
    },
    errorText: {
        ...textStyles.caption,
        color: colors.error,
    },
});
