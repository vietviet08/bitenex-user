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
