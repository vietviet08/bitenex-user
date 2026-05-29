import { ApiError } from "@/services/apiError";
import { validators } from "./validators";

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    errors?: string[];
}

export function validateEmail(email: string): ValidationResult {
    if (!email?.trim()) {
        return {
            isValid: false,
            error: "Email is required",
        };
    }

    if (!validators.isValidEmail(email.trim())) {
        return {
            isValid: false,
            error: "Please enter a valid email address",
        };
    }

    return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
    if (!password?.trim()) {
        return {
            isValid: false,
            error: "Password is required",
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            error: "Password must be at least 8 characters",
        };
    }

    return { isValid: true };
}

export function validateRequired(
    value: string,
    fieldName: string = "This field"
): ValidationResult {
    if (!validators.isRequired(value)) {
        return {
            isValid: false,
            error: `${fieldName} is required`,
        };
    }

    return { isValid: true };
}

export function combineFieldErrors(
    apiError: ApiError | null | undefined,
    fieldName: string
): string[] {
    if (!apiError?.fieldErrors) {
        return [];
    }

    return apiError.fieldErrors[fieldName] || [];
}

export function getFieldError(
    apiError: ApiError | null | undefined,
    fieldName: string
): string | undefined {
    const errors = combineFieldErrors(apiError, fieldName);
    return errors.length > 0 ? errors[0] : undefined;
}

export function validateFullName(fullName: string): ValidationResult {
    if (!fullName?.trim()) {
        return {
            isValid: false,
            error: "Full name is required",
        };
    }

    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
        return {
            isValid: false,
            error: "Full name must be at least 2 characters",
        };
    }

    if (trimmed.length > 100) {
        return {
            isValid: false,
            error: "Full name must be at most 100 characters",
        };
    }

    return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
    if (!phone?.trim()) {
        return { isValid: true };
    }

    const trimmed = phone.trim();
    if (trimmed.length > 20) {
        return {
            isValid: false,
            error: "Phone number must be at most 20 characters",
        };
    }

    if (!validators.isValidPhone(trimmed)) {
        return {
            isValid: false,
            error: "Please enter a valid phone number",
        };
    }

    return { isValid: true };
}

export function validateConfirmPassword(
    password: string,
    confirmPassword: string
): ValidationResult {
    if (!confirmPassword?.trim()) {
        return {
            isValid: false,
            error: "Please confirm your password",
        };
    }

    if (confirmPassword !== password) {
        return {
            isValid: false,
            error: "Passwords do not match",
        };
    }

    return { isValid: true };
}
