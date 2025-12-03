// types/models/auth/token.ts
export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}
