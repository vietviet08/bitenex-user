import { AxiosError } from "axios";
import { ERROR_CODES } from "@/constants/errorCodes";
import { ApiError } from "./apiError";

export function transformError(error: AxiosError): ApiError {
    const responseData = error.response?.data as
        | Record<string, unknown>
        | undefined;

    let errorCode: string | undefined;
    let message: string;
    let fieldErrors: Record<string, string[]> | undefined;

    if (responseData?.error && typeof responseData.error === "object") {
        const errorDetail = responseData.error as Record<string, unknown>;
        errorCode = (errorDetail.error_code as string) || undefined;
        message =
            (errorDetail.message as string) ||
            extractErrorMessage(error)

        if (
            errorCode === ERROR_CODES.VALIDATION_ERROR &&
            errorDetail.details &&
            typeof errorDetail.details === "object"
        ) {
            const details = errorDetail.details as Record<string, unknown>;
            fieldErrors = extractFieldErrors(details);
        }
    } else {
        errorCode =
            (responseData?.code as string) ||
            (responseData?.errorCode as string) ||
            (responseData?.error_code as string) ||
            (responseData?.error as string) ||
            undefined;
        message = extractErrorMessage(error);

        if (
            responseData?.fieldErrors &&
            typeof responseData.fieldErrors === "object"
        ) {
            fieldErrors = extractFieldErrors(
                responseData.fieldErrors as Record<string, unknown>
            );
        } else if (
            errorCode === ERROR_CODES.VALIDATION_ERROR &&
            responseData?.details &&
            typeof responseData.details === "object"
        ) {
            fieldErrors = extractFieldErrors(
                responseData.details as Record<string, unknown>
            );
        }
    }

    const apiError: ApiError = {
        message,
        status: error.response?.status,
        code: errorCode,
        errorCode: errorCode,
        fieldErrors,
    };

    return apiError;
}

function extractFieldErrors(
    details: Record<string, unknown>
): Record<string, string[]> | undefined {
    const fieldErrors: Record<string, string[]> = {};

    for (const [fieldName, fieldErrorsArray] of Object.entries(details)) {
        if (Array.isArray(fieldErrorsArray)) {
            const messages = fieldErrorsArray
                .map((err) => {
                    if (typeof err === "object" && err !== null) {
                        const errObj = err as Record<string, unknown>;
                        return (
                            (errObj.message as string) ||
                            (errObj.msg as string) ||
                            "Validation error"
                        );
                    }
                    return typeof err === "string" ? err : "Validation error";
                })
                .filter((msg): msg is string => typeof msg === "string");

            if (messages.length > 0) {
                fieldErrors[fieldName] = messages;
            }
        } else if (typeof fieldErrorsArray === "string") {
            fieldErrors[fieldName] = [fieldErrorsArray];
        }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>;

        if (data.error && typeof data.error === "object") {
            const errorDetail = data.error as Record<string, unknown>;
            if (typeof errorDetail.message === "string") {
                return errorDetail.message;
            }
        }

        if (typeof data.message === "string") return data.message;
        if (typeof data.detail === "string") return data.detail;
    }
    if (error.message) return error.message;
    return "An unexpected error occurred";
}
