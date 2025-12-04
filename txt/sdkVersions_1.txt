// data/platform/sdkVersions.ts
import type { SdkVersion } from '../../types';

/**
 * @description A list of available Software Development Kits (SDKs) for different languages.
 * This data populates the 'SDK Downloads' view in the developer hub, demonstrating the
 * platform's commitment to providing robust developer tools.
 */
export const MOCK_SDK_VERSIONS: SdkVersion[] = [
    { version: '2.5.1', releaseDate: '2024-07-20', changelog: 'Fixed issue with payment order creation.' },
    { version: '2.5.0', releaseDate: '2024-07-15', changelog: 'Added support for AI Ad Studio endpoints.' },
    { version: '2.4.0', releaseDate: '2024-06-28', changelog: 'Initial support for Corporate Card controls.' },
];