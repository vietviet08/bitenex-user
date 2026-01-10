export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    errorCode?: string;
    fieldErrors?: Record<string, string[]>;
}

export class ApiErrorException extends Error {
    status?: number;
    code?: string;
    errorCode?: string;
    fieldErrors?: Record<string, string[]>;

    constructor(apiError: ApiError) {
        super(apiError.message);
        this.name = "ApiErrorException";
        this.status = apiError.status;
        this.code = apiError.code;
        this.errorCode = apiError.errorCode;
        this.fieldErrors = apiError.fieldErrors;
    }

    toApiError(): ApiError {
        return {
            message: this.message,
            status: this.status,
            code: this.code,
            errorCode: this.errorCode,
            fieldErrors: this.fieldErrors,
        };
    }
}
