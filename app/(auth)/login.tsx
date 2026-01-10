import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormInput } from "@/components/forms/FormInput";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiError";
import { colors } from "@/theme";
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
        <SafeAreaView className="flex-1 bg-background-primary">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="px-lg pt-4xl pb-2xl">
                        <Text className="text-3xl font-bold text-text-primary mb-xs">Welcome back</Text>
                        <Text className="text-base text-text-secondary">
                            Sign in to continue ordering
                        </Text>
                    </View>

                    <View className="flex-1 px-lg">
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
                            className="self-end mb-2xl"
                            disabled={isLoading}
                        >
                            <Text className="text-sm text-primary-500">
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            className={`h-[52px] bg-primary-500 rounded-xl items-center justify-center mb-2xl ${isLoading ? 'opacity-70' : ''}`}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color={colors.text.inverse}
                                />
                            ) : (
                                <Text className="text-base font-semibold text-text-inverse">Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row justify-center items-center">
                            <Text className="text-base text-text-secondary">
                                {"Don't have an account? "}
                            </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text className="text-base text-primary-500 font-semibold">Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
