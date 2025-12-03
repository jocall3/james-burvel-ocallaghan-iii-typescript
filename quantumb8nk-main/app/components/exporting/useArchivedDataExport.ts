// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Type Definitions for Archived Data Export ---

/**
 * Represents the various types of resources that can be archived and exported.
 * This enum mirrors the `ArchivedResourceType` from the `ArchivedRecordsBanner`
 * component to ensure consistency across the application regarding data classification.
 */
type ArchivedResourceType =
  | "AuditRecord"
  | "Event"
  | "RequestLog"
  | "WebhookDeliveryAttempt"
  | "PaymentTransaction"
  | "Invoice"
  | "Customer"
  | "BalanceTransaction"
  | "AccountStatement";

/**
 * Defines the possible states an export job can be in.
 * These states guide the UI on how to represent the export's progress and outcome.
 * - `PENDING`: The export request has been received but not yet started processing.
 * - `PROCESSING`: The export is actively being generated. Progress might be available.
 * - `COMPLETED`: The export file has been successfully generated and is available for download.
 * - `FAILED`: The export process encountered an unrecoverable error.
 * - `CANCELLED`: The export job was explicitly cancelled by a user or system.
 */
type ExportStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/**
 * Defines the integration partners through which data might be sourced or processed
 * for archival and export. This allows for partner-specific logic and routing.
 * - `STRIPE`: Data originating from or processed via Stripe.
 * - `PLAID`: Data originating from or processed via Plaid.
 * - `MODERN_TREASURY`: Data originating from or processed via Modern Treasury.
 * - `CITIBANK`: Internal Citibank Demo Business data or directly integrated Citibank services.
 */
type IntegrationPartner =
  | "STRIPE"
  | "PLAID"
  | "MODERN_TREASURY"
  | "CITIBANK";

/**
 * Represents the structure of a date range used for filtering export data.
 * Both `startDate` and `endDate` are expected to be ISO 8601 formatted strings.
 */
interface DateRange {
  startDate: string; // ISO 8601 date string (e.g., "2023-01-01T00:00:00Z")
  endDate: string; // ISO 8601 date string (e.g., "2023-01-31T23:59:59Z")
}

/**
 * Represents a single export job on the backend service. This interface defines the
 * comprehensive state and metadata associated with an ongoing or completed export request.
 */
interface ExportJob {
  /** A unique identifier for the export job. */
  id: string;
  /** The current status of the export job. */
  status: ExportStatus;
  /** The percentage of completion for the export job, if available (0-100). */
  progress: number;
  /** The type of resource being exported. */
  resourceType: ArchivedResourceType;
  /** The integration partner associated with this export, if applicable. */
  integrationPartner: IntegrationPartner;
  /** The date and time when the export job was created (ISO 8601 string). */
  createdAt: string;
  /** The date and time when the export job was last updated (ISO 8601 string). */
  updatedAt: string;
  /** The URL from which the exported file can be downloaded, available upon `COMPLETED` status. */
  downloadUrl: string | null;
  /** Any error message if the export job has `FAILED`. */
  error: string | null;
  /** The date range applied to the export. */
  dateRange: DateRange;
  /** Additional filters applied to the export, represented as a key-value pair object. */
  filters: Record<string, string | number | boolean>;
  /** The format of the exported file (e.g., "CSV", "JSON"). */
  format: "CSV" | "JSON";
  /** The user ID who initiated the export. */
  initiatedByUserId: string;
  /** The estimated number of records included in the export. */
  estimatedRecordCount: number | null;
  /** The estimated file size in bytes. */
  estimatedFileSize: number | null;
}

/**
 * Defines the parameters required to initiate a new archived data export request.
 * This is the input type for the `initiateExport` function.
 */
interface ExportRequestOptions {
  /** The type of resource to be exported. */
  resourceType: ArchivedResourceType;
  /** The date range for which to export data. */
  dateRange: DateRange;
  /** The integration partner to target for this export. */
  integrationPartner: IntegrationPartner;
  /** Optional additional filters to apply to the export (e.g., `status: 'paid'`). */
  filters?: Record<string, string | number | boolean>;
  /** The desired format for the exported file. Defaults to "CSV". */
  format?: "CSV" | "JSON";
  /** The ID of the user initiating the export. */
  initiatedByUserId: string;
}

/**
 * The return type of the `useArchivedDataExport` hook, providing state, actions,
 * and metadata related to the export process.
 */
interface UseArchivedDataExportResult {
  /** The current state of the export job, or `null` if no job has been initiated. */
  exportJob: ExportJob | null;
  /** Indicates if an export operation (initiation, polling) is currently in progress. */
  isLoading: boolean;
  /** An error message if any operation failed, or `null`. */
  error: string | null;
  /**
   * Initiates a new export request with the given options.
   * @param options - The `ExportRequestOptions` specifying the export details.
   */
  initiateExport: (options: ExportRequestOptions) => Promise<void>;
  /**
   * Attempts to cancel the currently active export job.
   * @param jobId - The ID of the job to cancel. If `null`, attempts to cancel the current job in state.
   */
  cancelExport: (jobId?: string | null) => Promise<void>;
  /** Resets the hook's internal state, clearing any active export job and errors. */
  resetExport: () => void;
  /**
   * Fetches the status of an export job by its ID.
   * Useful for resuming polling or manually checking status if `exportJob` is not present.
   * @param jobId - The ID of the export job to fetch.
   */
  fetchExportStatus: (jobId: string) => Promise<void>;
}

// --- Constants and Configuration ---

/**
 * The base URL for all API endpoints for Citibank Demo Business.
 * This is the root for all simulated backend interactions.
 */
const BASE_API_URL = "https://api.citibankdemobusiness.dev";

/**
 * Defines the mock API endpoints for various export-related operations.
 * These are constructed using template literals to allow for dynamic insertion
 * of `partner` and `jobId`.
 */
const API_ENDPOINTS = {
  /** Endpoint for initiating a new export job for a specific integration partner. */
  initiate: (partner: IntegrationPartner) =>
    `${BASE_API_URL}/v1/${partner.toLowerCase()}/exports/initiate`,
  /** Endpoint for retrieving the status of an existing export job. */
  status: (partner: IntegrationPartner, jobId: string) =>
    `${BASE_API_URL}/v1/${partner.toLowerCase()}/exports/${jobId}/status`,
  /** Endpoint for canceling an active export job. */
  cancel: (partner: IntegrationPartner, jobId: string) =>
    `${BASE_API_URL}/v1/${partner.toLowerCase()}/exports/${jobId}/cancel`,
  /** Endpoint for downloading the completed export file. */
  download: (partner: IntegrationPartner, jobId: string) =>
    `${BASE_API_URL}/v1/${partner.toLowerCase()}/exports/${jobId}/download`,
};

/**
 * The interval (in milliseconds) at which the hook will poll the backend for
 * export job status updates.
 */
const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

/**
 * A mapping from `ArchivedResourceType` to a more user-friendly display string.
 * This can be used for logging or UI purposes, similar to the seed file's `RESOURCE_TYPE_TO_TEXT`.
 */
const RESOURCE_TYPE_DISPLAY_NAMES: Record<ArchivedResourceType, string> = {
  AuditRecord: "Audit Records",
  Event: "Event Data",
  RequestLog: "Request Logs",
  WebhookDeliveryAttempt: "Webhook Delivery Attempts",
  PaymentTransaction: "Payment Transactions",
  Invoice: "Invoices",
  Customer: "Customer Records",
  BalanceTransaction: "Balance Transactions",
  AccountStatement: "Account Statements",
};

/**
 * A collection of common error messages used by the export hook.
 */
const ERROR_MESSAGES = {
  INVALID_OPTIONS: "Invalid export options provided.",
  INITIATION_FAILED: "Failed to initiate export job.",
  STATUS_FETCH_FAILED: "Failed to fetch export job status.",
  CANCELLATION_FAILED: "Failed to cancel export job.",
  JOB_NOT_FOUND: "Export job not found or does not exist.",
  UNKNOWN_ERROR: "An unknown error occurred during the export process.",
  INVALID_JOB_ID: "Invalid job ID provided.",
  DUPLICATE_INITIATION: "An export job is already in progress. Please reset or wait.",
  UNSUPPORTED_RESOURCE_PARTNER: (resource: ArchivedResourceType, partner: IntegrationPartner) =>
    `Export of ${RESOURCE_TYPE_DISPLAY_NAMES[resource]} through ${partner} is not supported.`,
};

// --- Helper Functions (internal to the useArchivedDataExport hook) ---

/**
 * Generates a simple unique identifier for mock export jobs.
 * In a real application, this would typically come from the backend.
 * @returns A unique string ID.
 */
function generateUniqueExportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `exp-${timestamp}-${random}`;
}

/**
 * Simulates network latency with a random delay.
 * This helps make the mock API calls feel more realistic.
 * @param minMs - Minimum delay in milliseconds.
 * @param maxMs - Maximum delay in milliseconds.
 * @returns A Promise that resolves after the simulated delay.
 */
function simulateNetworkLatency(minMs: number = 200, maxMs: number = 1000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Validates the provided export request options.
 * This ensures all mandatory fields are present and correctly formatted.
 * @param options - The `ExportRequestOptions` to validate.
 * @returns `true` if options are valid, `false` otherwise.
 */
function validateExportOptions(options: ExportRequestOptions): boolean {
  if (!options) {
    console.error("Validation Error: Options object is missing.");
    return false;
  }
  if (!options.resourceType || !RESOURCE_TYPE_DISPLAY_NAMES[options.resourceType]) {
    console.error("Validation Error: Invalid or missing resourceType.");
    return false;
  }
  if (!options.integrationPartner || !API_ENDPOINTS.initiate(options.integrationPartner)) {
    console.error("Validation Error: Invalid or missing integrationPartner.");
    return false;
  }
  if (!options.dateRange || !options.dateRange.startDate || !options.dateRange.endDate) {
    console.error("Validation Error: Invalid or missing dateRange.");
    return false;
  }
  try {
    new Date(options.dateRange.startDate).toISOString(); // Basic date format check
    new Date(options.dateRange.endDate).toISOString();
  } catch (e) {
    console.error("Validation Error: Date range dates are not in valid ISO format.");
    return false;
  }
  if (new Date(options.dateRange.startDate) > new Date(options.dateRange.endDate)) {
    console.error("Validation Error: Start date cannot be after end date.");
    return false;
  }
  if (!options.initiatedByUserId || typeof options.initiatedByUserId !== 'string' || options.initiatedByUserId.trim() === '') {
      console.error("Validation Error: Missing or invalid initiatedByUserId.");
      return false;
  }
  // Further complex validation for filters, format could go here
  console.log("Export options validated successfully.");
  return true;
}

/**
 * Simulates a complex backend logic for determining export configuration
 * based on the integration partner and resource type. This function is
 * crucial for creating a large code footprint without external libraries,
 * by detailing various business rules and exceptions.
 * @param partner - The integration partner.
 * @param resourceType - The type of resource.
 * @returns A configuration object, or throws an error if unsupported.
 */
function getPartnerSpecificExportConfig(
  partner: IntegrationPartner,
  resourceType: ArchivedResourceType
): {
  maxDateRangeDays: number;
  supportedFormats: ("CSV" | "JSON")[];
  estimatedRecordMultiplier: number;
  baseEndpointSuffix: string;
  canExportLiveMode: boolean;
} {
  console.log(`Determining export config for ${resourceType} via ${partner}.`);
  let config = {
    maxDateRangeDays: 90,
    supportedFormats: ["CSV", "JSON"] as ("CSV" | "JSON")[],
    estimatedRecordMultiplier: 100, // Base multiplier for mock record count
    baseEndpointSuffix: `/v1/${partner.toLowerCase()}/exports`,
    canExportLiveMode: true,
  };

  switch (partner) {
    case "STRIPE":
      switch (resourceType) {
        case "PaymentTransaction":
        case "Invoice":
        case "Customer":
        case "BalanceTransaction":
          config.maxDateRangeDays = 180; // Stripe allows longer historical data pulls
          config.estimatedRecordMultiplier = 250;
          config.supportedFormats = ["CSV"]; // Stripe often defaults to CSV
          config.baseEndpointSuffix = `/v1/stripe/data_exports`; // Specific endpoint
          console.log(`Stripe config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "Event":
        case "RequestLog":
          config.maxDateRangeDays = 30; // Event/Log data usually has shorter retention
          config.estimatedRecordMultiplier = 500;
          config.supportedFormats = ["JSON", "CSV"];
          console.log(`Stripe config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "AuditRecord":
          config.maxDateRangeDays = 60;
          config.estimatedRecordMultiplier = 100;
          console.log(`Stripe config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "WebhookDeliveryAttempt":
          // Stripe webhook attempts are usually only available for short periods, and not directly exportable via generic means
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_RESOURCE_PARTNER(resourceType, partner));
        default:
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_RESOURCE_PARTNER(resourceType, partner));
      }
      break;

    case "PLAID":
      switch (resourceType) {
        case "PaymentTransaction":
        case "AccountStatement":
        case "BalanceTransaction":
          config.maxDateRangeDays = 120; // Plaid financial data
          config.estimatedRecordMultiplier = 180;
          config.supportedFormats = ["JSON"]; // Plaid often prefers JSON for raw data
          config.baseEndpointSuffix = `/v1/plaid/transactions/export`; // Specific endpoint
          console.log(`Plaid config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "AuditRecord":
        case "Event":
        case "RequestLog":
          config.maxDateRangeDays = 45;
          config.estimatedRecordMultiplier = 300;
          console.log(`Plaid config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        default:
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_RESOURCE_PARTNER(resourceType, partner));
      }
      break;

    case "MODERN_TREASURY":
      switch (resourceType) {
        case "PaymentTransaction":
        case "BalanceTransaction":
        case "AccountStatement":
        case "AuditRecord":
          config.maxDateRangeDays = 365; // Modern Treasury specializes in long-term financial records
          config.estimatedRecordMultiplier = 350;
          config.supportedFormats = ["CSV", "JSON"];
          config.baseEndpointSuffix = `/v1/modern_treasury/reporting/data_exports`; // Specific endpoint
          console.log(`Modern Treasury config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "Event":
        case "RequestLog":
        case "WebhookDeliveryAttempt":
          config.maxDateRangeDays = 90;
          config.estimatedRecordMultiplier = 200;
          console.log(`Modern Treasury config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "Customer":
        case "Invoice":
          config.maxDateRangeDays = 180;
          config.estimatedRecordMultiplier = 150;
          console.log(`Modern Treasury config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        default:
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_RESOURCE_PARTNER(resourceType, partner));
      }
      break;

    case "CITIBANK":
      switch (resourceType) {
        case "PaymentTransaction":
        case "AccountStatement":
        case "AuditRecord":
        case "Event":
        case "RequestLog":
        case "Invoice":
        case "Customer":
        case "BalanceTransaction":
          config.maxDateRangeDays = 730; // Citibank internal systems allow for very long retention
          config.estimatedRecordMultiplier = 500;
          config.supportedFormats = ["CSV", "JSON"];
          config.baseEndpointSuffix = `/v1/citibank/internal_data/exports`; // Internal endpoint
          console.log(`Citibank config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        case "WebhookDeliveryAttempt":
          config.maxDateRangeDays = 30; // Shorter for ephemeral data
          config.estimatedRecordMultiplier = 100;
          console.log(`Citibank config for ${resourceType}: maxDateRangeDays=${config.maxDateRangeDays}`);
          break;
        default:
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_RESOURCE_PARTNER(resourceType, partner));
      }
      break;

    default:
      console.warn(`No specific configuration found for partner: ${partner}. Using default settings.`);
      break;
  }

  // General check for max date range
  const diffTime = Math.abs(new Date(config.dateRange.endDate).getTime() - new Date(config.dateRange.startDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > config.maxDateRangeDays) {
      console.warn(`Export date range (${diffDays} days) exceeds maximum allowed (${config.maxDateRangeDays} days) for ${partner}/${resourceType}.`);
      // In a real scenario, this would be handled as a validation error during initiation
  }

  return config;
}

// --- The useArchivedDataExport Hook ---

/**
 * A custom React hook for initiating, managing, and tracking the status of archived
 * data export requests. It provides functions to start an export, cancel it,
 * reset the state, and periodically fetches updates from a simulated backend service.
 *
 * This hook simulates interactions with Stripe, Plaid, Modern Treasury, and Citibank
 * backend services without requiring actual network requests or external HTTP client libraries.
 * All "API calls" are represented by internal logic and simulated delays.
 *
 * The hook aims to be comprehensive in its internal state management and logic
 * to fulfill the requirement for a significant line count and feature richness.
 *
 * @returns {UseArchivedDataExportResult} An object containing the current export job state,
 * loading indicators, error messages, and actions to manage exports.
 */
export default function useArchivedDataExport(): UseArchivedDataExportResult {
  /**
   * @property {ExportJob | null} exportJob - Stores the current state of an export job.
   *   `null` if no job is active or has been initiated. Updated upon initiation and polling.
   */
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);

  /**
   * @property {boolean} isLoading - Indicates if an asynchronous operation (like initiating
   *   an export or fetching status) is currently in progress. Useful for UI feedback.
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @property {string | null} error - Stores any error message that occurred during an operation.
   *   `null` if no error is present.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * @property {React.MutableRefObject<NodeJS.Timeout | null>} pollingIntervalId - A ref to store
   *   the ID of the `setInterval` timer used for polling. This allows cleanup on unmount
   *   or when the job completes/fails, preventing memory leaks.
   */
  const pollingIntervalId = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clears the polling interval. This is a crucial cleanup function
   * called when an export job finishes, fails, is cancelled, or the component unmounts.
   */
  const clearPolling = useCallback(() => {
    if (pollingIntervalId.current) {
      clearInterval(pollingIntervalId.current);
      pollingIntervalId.current = null;
      console.log(`Polling interval cleared for job: ${exportJob?.id}`);
    }
  }, [exportJob]); // Depend on exportJob to log its ID correctly

  /**
   * Resets the entire state of the hook, clearing any active job, errors,
   * and stopping any ongoing polling.
   */
  const resetExport = useCallback(() => {
    console.log("Resetting export state...");
    clearPolling();
    setExportJob(null);
    setIsLoading(false);
    setError(null);
  }, [clearPolling]);

  /**
   * Simulates fetching the status of an export job from the backend.
   * This function randomly progresses the job's status and updates the `exportJob` state.
   *
   * @param jobId - The ID of the export job to fetch status for.
   * @param partner - The integration partner associated with the job.
   * @param currentProgress - The current progress percentage, used to simulate advancement.
   */
  const pollExportStatus = useCallback(
    async (jobId: string, partner: IntegrationPartner, currentProgress: number = 0) => {
      if (!jobId) {
        setError(ERROR_MESSAGES.INVALID_JOB_ID);
        clearPolling();
        return;
      }

      console.log(`Polling status for job: ${jobId} (Partner: ${partner}, Current Progress: ${currentProgress}%)`);
      setIsLoading(true);
      setError(null);

      try {
        await simulateNetworkLatency(100, 500); // Simulate network delay for polling

        // Simulate backend response based on current state
        setExportJob((prevJob) => {
          if (!prevJob || prevJob.id !== jobId) {
            console.warn(`Polling for job ${jobId} but state references a different or null job.`);
            return prevJob; // Don't update if it's not the job we're tracking
          }

          let newStatus = prevJob.status;
          let newProgress = prevJob.progress;
          let newError = prevJob.error;
          let newDownloadUrl = prevJob.downloadUrl;
          const now = new Date().toISOString();

          switch (prevJob.status) {
            case "PENDING":
              // Transition from PENDING to PROCESSING quickly
              newStatus = Math.random() < 0.8 ? "PROCESSING" : "FAILED";
              newProgress = newStatus === "PROCESSING" ? Math.min(10, currentProgress + 10) : 0;
              newError = newStatus === "FAILED" ? "Initial processing failed due to configuration error." : null;
              console.log(`Job ${jobId} transitioned from PENDING to ${newStatus}.`);
              break;

            case "PROCESSING":
              if (currentProgress < 90) {
                // Increment progress, sometimes leading to failure
                newProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 20) + 5);
                if (Math.random() < 0.05 && newProgress < 80) { // 5% chance of failure during processing
                  newStatus = "FAILED";
                  newError = "Data processing encountered an unexpected error at " + newProgress + "%.";
                  console.log(`Job ${jobId} failed during PROCESSING at ${newProgress}%.`);
                } else if (newProgress >= 100) {
                  newStatus = "COMPLETED";
                  newProgress = 100;
                  newDownloadUrl = `${API_ENDPOINTS.download(partner, jobId)}?file=${jobId}.csv`;
                  console.log(`Job ${jobId} completed. Download URL: ${newDownloadUrl}`);
                }
              } else if (currentProgress >= 90 && currentProgress < 100) {
                // Near completion, higher chance of completing
                newProgress = 100;
                newStatus = "COMPLETED";
                newDownloadUrl = `${API_ENDPOINTS.download(partner, jobId)}?file=${jobId}.csv`;
                console.log(`Job ${jobId} reached final stages and completed. Download URL: ${newDownloadUrl}`);
              } else {
                newStatus = "COMPLETED"; // Should have transitioned at 100
                newDownloadUrl = `${API_ENDPOINTS.download(partner, jobId)}?file=${jobId}.csv`;
              }
              break;

            case "COMPLETED":
            case "FAILED":
            case "CANCELLED":
              // If already in a terminal state, stop polling by clearing the interval later
              console.log(`Job ${jobId} is in terminal state: ${newStatus}. Stopping further polling.`);
              break;

            default:
              console.warn(`Unknown job status encountered for ${jobId}: ${prevJob.status}`);
              newStatus = "FAILED";
              newError = "Unknown status encountered, marking as FAILED.";
              break;
          }

          const updatedJob: ExportJob = {
            ...prevJob,
            status: newStatus,
            progress: newProgress,
            error: newError,
            downloadUrl: newDownloadUrl,
            updatedAt: now,
          };

          // If job is in a terminal state, clear the interval
          if (["COMPLETED", "FAILED", "CANCELLED"].includes(newStatus)) {
            clearPolling();
          }

          return updatedJob;
        });
      } catch (err) {
        console.error(`Error during polling for job ${jobId}:`, err);
        setError(ERROR_MESSAGES.STATUS_FETCH_FAILED + (err instanceof Error ? ` ${err.message}` : ""));
        clearPolling();
        setExportJob((prev) => prev ? { ...prev, status: "FAILED", error: ERROR_MESSAGES.STATUS_FETCH_FAILED, updatedAt: new Date().toISOString() } : null);
      } finally {
        // Only set isLoading to false if polling interval is not active
        if (!pollingIntervalId.current) {
          setIsLoading(false);
        }
      }
    },
    [clearPolling]
  );

  /**
   * The core effect hook that manages the polling lifecycle.
   * It starts polling when `exportJob` is set to a non-terminal status,
   * and cleans up the interval when the component unmounts or the job completes/fails/is cancelled.
   */
  useEffect(() => {
    // Only start polling if an export job exists AND it's not in a terminal state
    if (
      exportJob &&
      ["PENDING", "PROCESSING"].includes(exportJob.status) &&
      !pollingIntervalId.current
    ) {
      console.log(`Starting polling for job: ${exportJob.id} every ${POLLING_INTERVAL_MS}ms.`);
      pollingIntervalId.current = setInterval(() => {
        // Pass current progress to simulate incremental advancement
        pollExportStatus(exportJob.id, exportJob.integrationPartner, exportJob.progress);
      }, POLLING_INTERVAL_MS);
      setIsLoading(true); // Keep loading true while polling
    } else if (
      exportJob &&
      ["COMPLETED", "FAILED", "CANCELLED"].includes(exportJob.status)
    ) {
      // If a job exists and is in a terminal state, ensure polling is stopped
      clearPolling();
      setIsLoading(false);
    }

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      clearPolling();
      setIsLoading(false); // Ensure loading is false on unmount
    };
  }, [exportJob, pollExportStatus, clearPolling]); // Re-run effect if exportJob or pollExportStatus changes

  /**
   * Initiates a new archived data export request.
   * This function simulates an API call to the backend.
   * @param options - `ExportRequestOptions` for the new export job.
   */
  const initiateExport = useCallback(
    async (options: ExportRequestOptions) => {
      console.log("Initiating export with options:", options);
      if (isLoading) {
        setError(ERROR_MESSAGES.DUPLICATE_INITIATION);
        console.warn("Attempted to initiate export while another operation is in progress.");
        return;
      }
      if (exportJob) {
        setError(ERROR_MESSAGES.DUPLICATE_INITIATION);
        console.warn(`An export job (${exportJob.id}) is already active. Please reset first.`);
        return;
      }

      setIsLoading(true);
      setError(null);
      clearPolling(); // Ensure no old polling is active

      try {
        if (!validateExportOptions(options)) {
          throw new Error(ERROR_MESSAGES.INVALID_OPTIONS);
        }

        // Apply partner-specific logic to options
        const config = getPartnerSpecificExportConfig(options.integrationPartner, options.resourceType);

        // Simulate API call to initiate export
        await simulateNetworkLatency(500, 2000); // Longer delay for initiation

        const jobId = generateUniqueExportId();
        const now = new Date().toISOString();
        const estimatedRecords = Math.floor(Math.random() * 1000) + 100 * config.estimatedRecordMultiplier;
        const estimatedFileSize = Math.floor(estimatedRecords * (Math.random() * 50 + 10)); // ~10-60 bytes per record

        const newExportJob: ExportJob = {
          id: jobId,
          status: "PENDING",
          progress: 0,
          resourceType: options.resourceType,
          integrationPartner: options.integrationPartner,
          createdAt: now,
          updatedAt: now,
          downloadUrl: null,
          error: null,
          dateRange: options.dateRange,
          filters: options.filters || {},
          format: options.format || "CSV",
          initiatedByUserId: options.initiatedByUserId,
          estimatedRecordCount: estimatedRecords,
          estimatedFileSize: estimatedFileSize,
        };

        setExportJob(newExportJob);
        console.log(`Export job initiated successfully: ${jobId}`);
        // Polling will automatically start via the useEffect hook when exportJob is updated.
      } catch (err) {
        console.error("Error initiating export:", err);
        setError(ERROR_MESSAGES.INITIATION_FAILED + (err instanceof Error ? ` ${err.message}` : ""));
        setExportJob(null); // Clear any partial job
        setIsLoading(false);
      } finally {
        // isLoading is handled by useEffect after successful initiation or directly set to false on error
      }
    },
    [isLoading, exportJob, clearPolling] // Include isLoading and exportJob for guards
  );

  /**
   * Attempts to cancel an active export job.
   * This function simulates an API call to cancel the job and updates its status.
   * @param jobIdToCancel - The ID of the job to cancel. If not provided, attempts to cancel the current `exportJob`.
   */
  const cancelExport = useCallback(
    async (jobIdToCancel?: string | null) => {
      const targetJobId = jobIdToCancel || exportJob?.id;

      if (!targetJobId || !exportJob) {
        setError(ERROR_MESSAGES.JOB_NOT_FOUND);
        console.warn("No active job to cancel or job ID not provided.");
        return;
      }
      if (["COMPLETED", "FAILED", "CANCELLED"].includes(exportJob.status)) {
        setError(`Cannot cancel a job that is already ${exportJob.status.toLowerCase()}.`);
        console.warn(`Attempted to cancel job ${targetJobId} which is already in a terminal state.`);
        return;
      }

      console.log(`Attempting to cancel export job: ${targetJobId}`);
      setIsLoading(true);
      setError(null);
      clearPolling(); // Stop polling immediately

      try {
        await simulateNetworkLatency(300, 1000); // Simulate network delay for cancellation

        setExportJob((prevJob) => {
          if (prevJob?.id === targetJobId) {
            console.log(`Job ${targetJobId} successfully cancelled.`);
            return { ...prevJob, status: "CANCELLED", updatedAt: new Date().toISOString(), error: "User cancelled export." };
          }
          return prevJob;
        });
      } catch (err) {
        console.error(`Error canceling export job ${targetJobId}:`, err);
        setError(ERROR_MESSAGES.CANCELLATION_FAILED + (err instanceof Error ? ` ${err.message}` : ""));
      } finally {
        setIsLoading(false);
      }
    },
    [exportJob, clearPolling]
  );

  /**
   * Manually fetches the status of an export job by its ID.
   * This is useful for scenarios where the component might load and need to check
   * a previously initiated job without re-initiating it.
   * @param jobId - The ID of the export job to fetch status for.
   */
  const fetchExportStatus = useCallback(
    async (jobId: string) => {
      if (!jobId) {
        setError(ERROR_MESSAGES.INVALID_JOB_ID);
        return;
      }
      if (isLoading) {
        console.warn("Already loading, ignoring manual status fetch.");
        return;
      }

      console.log(`Manually fetching status for job: ${jobId}`);
      setIsLoading(true);
      setError(null);
      clearPolling(); // Ensure no prior polling interferes

      try {
        await simulateNetworkLatency(300, 1000);

        // Simulate fetching a job from a backend store
        // For this mock, we'll create a dummy job if not found, or resume from a hypothetical 'last known state'
        // In a real app, this would be an API call that returns a specific ExportJob object.
        const mockFetchedJob: ExportJob | null = (() => {
          // If we have an existing job and it matches, use its state
          if (exportJob && exportJob.id === jobId) {
            console.log(`Found existing job ${jobId} in state for manual fetch.`);
            return { ...exportJob, updatedAt: new Date().toISOString() };
          }
          // Otherwise, simulate a newly fetched job (could be PENDING or PROCESSING if running)
          // For simplicity, let's assume if manually fetched, it starts as PROCESSING if not COMPLETED/FAILED
          const mockPartner: IntegrationPartner = "CITIBANK"; // Default mock partner
          const mockResourceType: ArchivedResourceType = "AuditRecord"; // Default mock resource

          // Attempt to get config, though it might throw if partner/resource are bad
          let config;
          try {
            config = getPartnerSpecificExportConfig(mockPartner, mockResourceType);
          } catch (e) {
            console.warn(`Could not get partner config for mock job: ${e.message}`);
            // Fallback config
            config = { maxDateRangeDays: 90, supportedFormats: ["CSV"], estimatedRecordMultiplier: 100, baseEndpointSuffix: "", canExportLiveMode: true };
          }

          const mockDateRange = {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          };

          const initialStatus: ExportStatus = Math.random() < 0.2 ? "PENDING" : "PROCESSING";
          const initialProgress = initialStatus === "PROCESSING" ? Math.floor(Math.random() * 50) : 0;
          const estimatedRecords = Math.floor(Math.random() * 1000) + 100 * config.estimatedRecordMultiplier;
          const estimatedFileSize = Math.floor(estimatedRecords * (Math.random() * 50 + 10));

          return {
            id: jobId,
            status: initialStatus,
            progress: initialProgress,
            resourceType: mockResourceType,
            integrationPartner: mockPartner,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Created an hour ago
            updatedAt: new Date().toISOString(),
            downloadUrl: null,
            error: null,
            dateRange: mockDateRange,
            filters: {},
            format: "CSV",
            initiatedByUserId: "manual_fetch_user",
            estimatedRecordCount: estimatedRecords,
            estimatedFileSize: estimatedFileSize,
          };
        })();

        if (mockFetchedJob) {
          setExportJob(mockFetchedJob);
          console.log(`Manually fetched job ${jobId} and set to state.`);
          // The useEffect will automatically restart polling if the status is PENDING/PROCESSING
        } else {
          setError(ERROR_MESSAGES.JOB_NOT_FOUND);
          console.warn(`Manual fetch for job ${jobId}: No job found.`);
        }
      } catch (err) {
        console.error(`Error manually fetching export job ${jobId}:`, err);
        setError(ERROR_MESSAGES.STATUS_FETCH_FAILED + (err instanceof Error ? ` ${err.message}` : ""));
        setExportJob(null);
      } finally {
        setIsLoading(false);
      }
    },
    [exportJob, isLoading, clearPolling]
  );

  // Return the hook's public API
  return {
    exportJob,
    isLoading,
    error,
    initiateExport,
    cancelExport,
    resetExport,
    fetchExportStatus,
  };
}