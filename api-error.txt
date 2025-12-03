// types/models/common/api-error.ts
export interface ApiError {
    statusCode: number;
    message: string;
    errorCode: string;
}
