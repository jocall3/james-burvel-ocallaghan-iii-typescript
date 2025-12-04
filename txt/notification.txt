// types/models/system/notification.ts
import type { View } from '../ui/view';

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    view?: View;
}