// types/models/device/device-info.ts
export interface DeviceInfo {
    id: string;
    type: 'mobile' | 'desktop';
    os: string;
    browser: string;
}
