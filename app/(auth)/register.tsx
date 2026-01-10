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
    validateConfirmPassword,
    validateEmail,
    validateFullName,
    validatePassword,
    validatePhone,
} from "@/utils/formValidation";
import { ERROR_CODES, HTTP_STATUS } from "@/constants/errorCodes";

export default function RegisterScreen() {
    const { register, isLoading } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [fullNameError, setFullNameError] = useState<string | undefined>();
    const [emailError, setEmailError] = useState<string | undefined>();
    const [phoneError, setPhoneError] = useState<string | undefined>();
    const [passwordError, setPasswordError] = useState<string | undefined>();
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
    const [apiError, setApiError] = useState<ApiError | null>(null);

    const handleFullNameChange = (text: string) => {
        setFullName(text);
        if (fullNameError) setFullNameError(undefined);
        if (apiError) setApiError(null);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) setEmailError(undefined);
        if (apiError) setApiError(null);
    };

    const handlePhoneChange = (text: string) => {
        setPhone(text);
        if (phoneError) setPhoneError(undefined);
        if (apiError) setApiError(null);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(undefined);
        if (apiError) setApiError(null);
        if (confirmPassword && text === confirmPassword && confirmPasswordError) {
            setConfirmPasswordError(undefined);
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (confirmPasswordError) setConfirmPasswordError(undefined);
        if (apiError) setApiError(null);
    };

    const handleApiError = (err: ApiError) => {
        setApiError(err);

        const fullNameFieldErrors = combineFieldErrors(err, "full_name");
        const emailFieldErrors = combineFieldErrors(err, "email");
        const phoneFieldErrors = combineFieldErrors(err, "phone");
        const passwordFieldErrors = combineFieldErrors(err, "password");

        if (
            err.status === HTTP_STATUS.CONFLICT ||
            err.errorCode === ERROR_CODES.DUPLICATE ||
            err.errorCode === ERROR_CODES.CONFLICT
        ) {
            setEmailError(err.message || "Email already registered");
            setPassword("");
            setConfirmPassword("");
            setPasswordError(undefined);
            setConfirmPasswordError(undefined);
            return;
        }

        if (err.errorCode === ERROR_CODES.VALIDATION_ERROR) {
            if (fullNameFieldErrors.length > 0) {
                setFullNameError(fullNameFieldErrors[0]);
            }
            if (emailFieldErrors.length > 0) {
                setEmailError(emailFieldErrors[0]);
            }
            if (phoneFieldErrors.length > 0) {
                setPhoneError(phoneFieldErrors[0]);
            }
            if (passwordFieldErrors.length > 0) {
                setPasswordError(passwordFieldErrors[0]);
                setPassword("");
                setConfirmPassword("");
            }
            return;
        }

        setPasswordError(err.message);
        setPassword("");
        setConfirmPassword("");
    };

    const handleRegister = async () => {
        setFullNameError(undefined);
        setEmailError(undefined);
        setPhoneError(undefined);
        setPasswordError(undefined);
        setConfirmPasswordError(undefined);
        setApiError(null);

        const fullNameValidation = validateFullName(fullName.trim());
        const emailValidation = validateEmail(email.trim());
        const phoneValidation = validatePhone(phone.trim());
        const passwordValidation = validatePassword(password);
        const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

        if (!fullNameValidation.isValid) {
            setFullNameError(fullNameValidation.error);
            return;
        }

        if (!emailValidation.isValid) {
            setEmailError(emailValidation.error);
            return;
        }

        if (!phoneValidation.isValid) {
            setPhoneError(phoneValidation.error);
            return;
        }

        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.error);
            return;
        }

        if (!confirmPasswordValidation.isValid) {
            setConfirmPasswordError(confirmPasswordValidation.error);
            return;
        }

        try {
            await register(
                email.trim(),
                password,
                fullName.trim(),
                phone.trim() || null
            );
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
                    <View className="px-lg pt-3xl pb-xl">
                        <Text className="text-3xl font-bold text-text-primary mb-xs">
                            Create account
                        </Text>
                        <Text className="text-base text-text-secondary">
                            Join Bitenex to start ordering
                        </Text>
                    </View>

                    <View className="flex-1 px-lg pb-2xl">
                        {/* Full Name Input */}
                        <FormInput
                            label="Full Name"
                            value={fullName}
                            onChangeText={handleFullNameChange}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            editable={!isLoading}
                            error={!!fullNameError}
                            errorMessage={fullNameError}
                        />

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

                        {/* Phone Input */}
                        <FormInput
                            label="Phone Number"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            placeholder="Enter your phone number (optional)"
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            editable={!isLoading}
                            error={!!phoneError}
                            errorMessage={phoneError}
                        />

                        {/* Password Input */}
                        <FormInput
                            label="Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            placeholder="Create a password"
                            secureTextEntry
                            showPasswordToggle
                            autoComplete="password-new"
                            editable={!isLoading}
                            error={!!passwordError}
                            errorMessage={passwordError}
                        />

                        {/* Confirm Password Input */}
                        <FormInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordChange}
                            placeholder="Confirm your password"
                            secureTextEntry
                            showPasswordToggle
                            autoComplete="password-new"
                            editable={!isLoading}
                            error={!!confirmPasswordError}
                            errorMessage={confirmPasswordError}
                        />

                        {/* Terms */}
                        <Text
                            className="text-sm text-text-secondary text-center mb-2xl"
                            style={{ lineHeight: 20 }}
                        >
                            By signing up, you agree to our{" "}
                            <Text className="text-primary-500">Terms of Service</Text> and{" "}
                            <Text className="text-primary-500">Privacy Policy</Text>
                        </Text>

                        {/* Register Button */}
                        <TouchableOpacity
                            className={`h-[52px] bg-primary-500 rounded-xl items-center justify-center mb-2xl ${isLoading ? 'opacity-70' : ''}`}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color={colors.text.inverse}
                                />
                            ) : (
                                <Text className="text-base font-semibold text-text-inverse">
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View className="flex-row justify-center items-center">
                            <Text className="text-base text-text-secondary">
                                Already have an account?{" "}
                            </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text className="text-base text-primary-500 font-semibold">
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
