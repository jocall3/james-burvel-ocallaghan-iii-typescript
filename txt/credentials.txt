// types/models/auth/credentials.ts
export interface Credentials {
    username: string;
    password?: string;
    mfaToken?: string;
}
