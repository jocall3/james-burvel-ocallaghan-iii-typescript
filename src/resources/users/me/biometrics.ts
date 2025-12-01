// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';

export class Biometrics extends APIResource {
  /**
   * Removes all enrolled biometric data associated with the user's account for
   * security reasons.
   *
   * @example
   * ```ts
   * await client.users.me.biometrics.deregister();
   * ```
   */
  deregister(options?: RequestOptions): APIPromise<void> {
    return this._client.delete('/users/me/biometrics', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Initiates the enrollment process for biometric authentication (e.g.,
   * fingerprint, facial scan) to enable secure and convenient access to sensitive
   * features. Requires a biometric signature for initial proof.
   *
   * @example
   * ```ts
   * const biometricStatus =
   *   await client.users.me.biometrics.enroll({
   *     biometricSignature:
   *       'base64encoded_facial_template_for_enrollment',
   *     biometricType: 'facial_recognition',
   *     deviceId: 'dev_mobile_ios_aabbcc',
   *     deviceName: 'My Primary iPhone',
   *   });
   * ```
   */
  enroll(body: BiometricEnrollParams, options?: RequestOptions): APIPromise<BiometricStatus> {
    return this._client.post('/users/me/biometrics/enroll', { body, ...options });
  }

  /**
   * Retrieves the current status of biometric enrollments for the authenticated
   * user.
   *
   * @example
   * ```ts
   * const biometricStatus =
   *   await client.users.me.biometrics.status();
   * ```
   */
  status(options?: RequestOptions): APIPromise<BiometricStatus> {
    return this._client.get('/users/me/biometrics', options);
  }

  /**
   * Performs real-time biometric verification to authorize sensitive actions or
   * access protected resources, using a one-time biometric signature.
   *
   * @example
   * ```ts
   * const response = await client.users.me.biometrics.verify({
   *   biometricSignature:
   *     'base64encoded_one_time_fingerprint_proof',
   *   biometricType: 'fingerprint',
   *   deviceId: 'dev_mobile_android_ddeeff',
   * });
   * ```
   */
  verify(body: BiometricVerifyParams, options?: RequestOptions): APIPromise<BiometricVerifyResponse> {
    return this._client.post('/users/me/biometrics/verify', { body, ...options });
  }
}

/**
 * Current biometric enrollment status for a user.
 */
export interface BiometricStatus {
  /**
   * Overall status indicating if any biometrics are enrolled.
   */
  biometricsEnrolled: boolean;

  /**
   * List of specific biometric types and devices enrolled.
   */
  enrolledBiometrics: Array<BiometricStatus.EnrolledBiometric>;

  /**
   * Timestamp of the last successful biometric authentication.
   */
  lastUsed?: string | null;
}

export namespace BiometricStatus {
  export interface EnrolledBiometric {
    deviceId?: string;

    enrollmentDate?: string;

    type?: 'fingerprint' | 'facial_recognition' | 'voice_recognition';
  }
}

export interface BiometricVerifyResponse {
  /**
   * A descriptive message for the verification result.
   */
  message?: string;

  /**
   * Status of the biometric verification.
   */
  verificationStatus?: 'success' | 'failed';
}

export interface BiometricEnrollParams {
  /**
   * Base64 encoded representation of the biometric template or proof.
   */
  biometricSignature: string;

  /**
   * The type of biometric data being enrolled.
   */
  biometricType: 'fingerprint' | 'facial_recognition' | 'voice_recognition';

  /**
   * The ID of the device on which the biometric is being enrolled.
   */
  deviceId: string;

  /**
   * Optional: A friendly name for the device, if not already linked.
   */
  deviceName?: string | null;
}

export interface BiometricVerifyParams {
  /**
   * Base64 encoded representation of the one-time biometric proof for verification.
   */
  biometricSignature: string;

  /**
   * The type of biometric data being verified.
   */
  biometricType: 'fingerprint' | 'facial_recognition' | 'voice_recognition';

  /**
   * The ID of the device initiating the biometric verification.
   */
  deviceId: string;
}

export declare namespace Biometrics {
  export {
    type BiometricStatus as BiometricStatus,
    type BiometricVerifyResponse as BiometricVerifyResponse,
    type BiometricEnrollParams as BiometricEnrollParams,
    type BiometricVerifyParams as BiometricVerifyParams,
  };
}
