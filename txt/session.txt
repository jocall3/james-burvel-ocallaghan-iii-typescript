// types/models/user/session.ts
export interface UserSession {
    sessionId: string;
    userId: string;
    loginTime: string;
    lastSeen: string;
}
