import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormInput } from "@/components/forms/FormInput";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiError";
import { colors, spacing, textStyles } from "@/theme";
import {
    combineFieldErrors,
    validateEmail,
    validatePassword,
} from "@/utils/formValidation";
import { ERROR_CODES, HTTP_STATUS } from "@/constants/errorCodes";

export default function LoginScreen() {
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState<string | undefined>();
    const [passwordError, setPasswordError] = useState<string | undefined>();
    const [apiError, setApiError] = useState<ApiError | null>(null);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) setEmailError(undefined);
        if (apiError) setApiError(null);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(undefined);
        if (apiError) setApiError(null);
    };

    const handleApiError = (err: ApiError) => {
        setApiError(err);

        const emailFieldErrors = combineFieldErrors(err, "email");
        const passwordFieldErrors = combineFieldErrors(err, "password");

        const isAuthenticationError =
            err.status === HTTP_STATUS.UNAUTHORIZED ||
            err.errorCode === ERROR_CODES.AUTHENTICATION_ERROR;

        if (isAuthenticationError) {
            setEmailError(undefined);
            setPasswordError(err.message);
            setPassword("");
            return;
        }

        if (err.errorCode === ERROR_CODES.VALIDATION_ERROR) {
            setEmailError(
                emailFieldErrors.length > 0 ? emailFieldErrors[0] : undefined
            );
            if (passwordFieldErrors.length > 0) {
                setPasswordError(passwordFieldErrors[0]);
                setPassword("");
            } else {
                setPasswordError(undefined);
            }
            return;
        }

        setEmailError(undefined);
        setPasswordError(err.message);
        setPassword("");
    };

    const handleLogin = async () => {
        setEmailError(undefined);
        setPasswordError(undefined);
        setApiError(null);

        const emailValidation = validateEmail(email.trim());
        const passwordValidation = validatePassword(password);

        if (!emailValidation.isValid) {
            setEmailError(emailValidation.error);
            return;
        }

        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.error);
            return;
        }

        try {
            await login(email.trim(), password);
            router.replace("/(tabs)");
        } catch (error) {
            console.error(error);
            handleApiError(error as ApiError);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue ordering
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Email Input */}
                        <FormInput
                            label="Email"
                            value={email}
                            onChangeText={handleEmailChange}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!isLoading}
                            error={!!emailError}
                            errorMessage={emailError}
                        />

                        {/* Password Input */}
                        <FormInput
                            label="Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            placeholder="Enter your password"
                            secureTextEntry
                            showPasswordToggle
                            autoComplete="password"
                            editable={!isLoading}
                            onSubmitEditing={handleLogin}
                            error={!!passwordError}
                            errorMessage={passwordError}
                        />

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color={colors.text.inverse}
                                />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {"Don't have an account? "}
                            </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text style={styles.linkText}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing["4xl"],
        paddingBottom: spacing["2xl"],
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    form: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: spacing["2xl"],
    },
    forgotPasswordText: {
        ...textStyles.bodySmall,
        color: colors.primary[500],
    },
    button: {
        height: 52,
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing["2xl"],
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        ...textStyles.button,
        color: colors.text.inverse,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        ...textStyles.body,
        color: colors.text.secondary,
    },
    linkText: {
        ...textStyles.body,
        color: colors.primary[500],
        fontWeight: "600",
    },
});
