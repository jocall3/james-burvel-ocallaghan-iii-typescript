// No company-specific copyright. This code is intended for general use in advanced financial platforms.

import moment from "moment";
import { BadgeType } from "../../common/ui-components";
import {
  ExpectedPayment__StatusEnum,
  OperationalStatusEnum,
  PaymentOrder__StatusEnum,
} from "../../generated/dashboard/graphqlSchema";

/**
 * Interface for a generic option object used in dropdowns or selectors.
 * @template T - The type of the option's value. Defaults to string.
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string; // Optional icon identifier for UI
  tooltip?: string; // Optional tooltip for extra information
  metadata?: Record<string, any>; // Optional additional data
}

/**
 * Creates an array of SelectOption objects from a given input object.
 * Each key-value pair in the input object is transformed into a { value: key, label: value } pair.
 *
 * @template T - The type of the keys in the input object, which will be the value type in SelectOption.
 * @param input - An object where keys are the option values and string values are the option labels.
 * @returns An array of SelectOption objects.
 */
export function makeOptionsFromObject<T extends string | number>(
  input: Record<T, string>,
): SelectOption<T>[] {
  return Object.entries(input).map(([value, label]) => ({
    value: value as T,
    label: label,
  }));
}

/**
 * Represents a set of standard permission levels and their descriptions.
 * These are granular permissions that can be combined to form roles.
 */
export const ROLE_PERMISSION_MAPPING = {
  manage: "Manage and Edit Access",
  manage_review: "Manage, Review, and Edit Access",
  review_edit: "Review and Edit Access",
  read: "View Only Access",
  full_read: "Full View Only Access",
  partial_read: "Partial View Only Access",
  per_account: "Per-Account Access",
  none: "No Access",
  admin: "Administrator Access",
  super_admin: "Super Administrator Access",
  developer_console: "Developer Console Access",
  audit_viewer: "Audit Log Viewer",
  support_agent: "Support Agent Access",
  export_data: "Export Data Access",
  configure_webhooks: "Configure Webhooks",
  ai_decision_override: "AI Decision Override", // Added for Gemini AI
  system_configuration: "System Configuration Management",
};

/**
 * Defines various user roles within the organization and their associated permission levels.
 * These roles typically apply to broad functional areas.
 */
export const ROLE_ORGANIZATION_MAPPING: Record<string, string> = {
  "organization:manage": ROLE_PERMISSION_MAPPING.manage,
  "organization:read": ROLE_PERMISSION_MAPPING.read,
  "organization:none": ROLE_PERMISSION_MAPPING.none,
  "organization:admin": ROLE_PERMISSION_MAPPING.admin,
  "organization:super_admin": ROLE_PERMISSION_MAPPING.super_admin,
  "organization:settings": ROLE_PERMISSION_MAPPING.system_configuration,
};

export const ROLE_DEVELOPER_MAPPING: Record<string, string> = {
  "developer:manage": ROLE_PERMISSION_MAPPING.manage,
  "developer:read": ROLE_PERMISSION_MAPPING.read,
  "developer:none": ROLE_PERMISSION_MAPPING.none,
  "developer:console": ROLE_PERMISSION_MAPPING.developer_console,
  "developer:api_management": ROLE_PERMISSION_MAPPING.manage, // Specific API key management
  "developer:ai_tooling": ROLE_PERMISSION_MAPPING.manage_review, // For managing AI models/tools
};

export const ROLE_COUNTERPARTY_MAPPING: Record<string, string> = {
  "counterparties:manage": ROLE_PERMISSION_MAPPING.manage,
  "counterparties:read": ROLE_PERMISSION_MAPPING.read,
  "counterparties:none": ROLE_PERMISSION_MAPPING.none,
  "counterparties:bulk_import": ROLE_PERMISSION_MAPPING.manage, // Permission for bulk import specific
  "counterparties:ai_enrichment": ROLE_PERMISSION_MAPPING.review_edit, // Access to AI-enriched data
};

export const ROLE_LEDGER_MAPPING: Record<string, string> = {
  "ledgers:manage": ROLE_PERMISSION_MAPPING.manage,
  "ledgers:read": ROLE_PERMISSION_MAPPING.read,
  "ledgers:none": ROLE_PERMISSION_MAPPING.none,
  "ledgers:reconcile": ROLE_PERMISSION_MAPPING.review_edit, // Specific reconciliation access
  "ledgers:export": ROLE_PERMISSION_MAPPING.export_data,
};

export const ROLE_EXTERNAL_ACCOUNT_MAPPING: Record<string, string> = {
  "external_accounts:manage": ROLE_PERMISSION_MAPPING.manage,
  "external_accounts:full_read": ROLE_PERMISSION_MAPPING.full_read,
  "external_accounts:read": ROLE_PERMISSION_MAPPING.partial_read,
  "external_accounts:none": ROLE_PERMISSION_MAPPING.none,
  "external_accounts:verify": ROLE_PERMISSION_MAPPING.review_edit, // For initiating verification flows
  "external_accounts:link": ROLE_PERMISSION_MAPPING.manage, // For linking new accounts
};

export const ROLE_EXTERNAL_ACCOUNT_API_MAPPING: Record<string, string> = {
  "external_accounts:manage": ROLE_PERMISSION_MAPPING.manage,
  "external_accounts:full_read": ROLE_PERMISSION_MAPPING.read,
  "external_accounts:none": ROLE_PERMISSION_MAPPING.none,
  "external_accounts:api_only_access": ROLE_PERMISSION_MAPPING.partial_read, // API-specific read
  "external_accounts:token_management": ROLE_PERMISSION_MAPPING.manage, // Manage API tokens for external accounts
};

export const ROLE_COMPLIANCE_MAPPING: Record<string, string> = {
  "compliance:manage": ROLE_PERMISSION_MAPPING.manage_review,
  "compliance:readwrite": ROLE_PERMISSION_MAPPING.review_edit,
  "compliance:read": ROLE_PERMISSION_MAPPING.read,
  "compliance:none": ROLE_PERMISSION_MAPPING.none,
  "compliance:audit": ROLE_PERMISSION_MAPPING.audit_viewer, // View compliance audit trails
  "compliance:ai_override": ROLE_PERMISSION_MAPPING.ai_decision_override, // Override AI decisions
  "compliance:rules": ROLE_PERMISSION_MAPPING.manage, // Manage compliance rules
};

export const ROLE_COMPLIANCE_API_MAPPING: Record<string, string> = {
  "compliance:manage": ROLE_PERMISSION_MAPPING.manage_review,
  "compliance:read": ROLE_PERMISSION_MAPPING.read,
  "compliance:none": ROLE_PERMISSION_MAPPING.none,
  "compliance:webhook_config": ROLE_PERMISSION_MAPPING.configure_webhooks, // Configure compliance webhooks
  "compliance:data_feed": ROLE_PERMISSION_MAPPING.full_read, // Access to compliance data feed
};

export const ROLE_PARTNER_SEARCH_MAPPING: Record<string, string> = {
  "partner_search:manage": ROLE_PERMISSION_MAPPING.manage,
  "partner_search:read": ROLE_PERMISSION_MAPPING.read,
  "partner_search:none": ROLE_PERMISSION_MAPPING.none,
  "partner_search:integrations": ROLE_PERMISSION_MAPPING.manage, // Manage partner integrations
  "partner_search:data_exchange": ROLE_PERMISSION_MAPPING.manage_review,
};

export const ROLE_API_KEYS_MAPPING: Record<string, string> = {
  "api_keys:manage": ROLE_PERMISSION_MAPPING.manage,
  "api_keys:read": ROLE_PERMISSION_MAPPING.read,
  "api_keys:none": ROLE_PERMISSION_MAPPING.none,
  "api_keys:rotate": ROLE_PERMISSION_MAPPING.manage, // Permission to rotate API keys
  "api_keys:generate": ROLE_PERMISSION_MAPPING.manage,
};

export const ROLE_CUSTOMER_ADMIN_TOOLS_MAPPING: Record<string, string> = {
  "customer_admin_tools:manage": ROLE_PERMISSION_MAPPING.manage,
  "customer_admin_tools:read": ROLE_PERMISSION_MAPPING.read,
  "customer_admin_tools:none": ROLE_PERMISSION_MAPPING.none,
  "customer_admin_tools:impersonate": ROLE_PERMISSION_MAPPING.super_admin, // For support team
  "customer_admin_tools:suspend_account": ROLE_PERMISSION_MAPPING.admin,
};

export const ROLE_PARTNER_ADMIN_TOOLS_MAPPING: Record<string, string> = {
  "partner_admin_tools:manage": ROLE_PERMISSION_MAPPING.manage,
  "partner_admin_tools:none": ROLE_PERMISSION_MAPPING.none,
  "partner_admin_tools:onboarding": ROLE_PERMISSION_MAPPING.manage, // Onboarding partner setup
  "partner_admin_tools:reporting": ROLE_PERMISSION_MAPPING.read,
};

export const ROLE_ENGINEERING_DEBUG_TOOLS_MAPPING: Record<string, string> = {
  "engineering_debug_tools:manage": ROLE_PERMISSION_MAPPING.manage,
  "engineering_debug_tools:none": ROLE_PERMISSION_MAPPING.none,
  "engineering_debug_tools:data_access": ROLE_PERMISSION_MAPPING.super_admin, // Direct data access for debugging
  "engineering_debug_tools:performance_metrics": ROLE_PERMISSION_MAPPING.read,
};

export const ROLE_ANALYTICS_MAPPING: Record<string, string> = {
  "analytics:read": ROLE_PERMISSION_MAPPING.full_read,
  "analytics:export": ROLE_PERMISSION_MAPPING.export_data,
  "analytics:manage_dashboards": ROLE_PERMISSION_MAPPING.manage,
  "analytics:none": ROLE_PERMISSION_MAPPING.none,
  "analytics:ai_reporting": ROLE_PERMISSION_MAPPING.read, // Access to AI-generated reports
};

export const ROLE_WEBHOOK_MAPPING: Record<string, string> = {
  "webhooks:manage": ROLE_PERMISSION_MAPPING.manage,
  "webhooks:read": ROLE_PERMISSION_MAPPING.read,
  "webhooks:none": ROLE_PERMISSION_MAPPING.none,
  "webhooks:resend": ROLE_PERMISSION_MAPPING.review_edit,
  "webhooks:monitor": ROLE_PERMISSION_MAPPING.read,
};

export const ROLE_AUDIT_LOGS_MAPPING: Record<string, string> = {
  "audit_logs:read": ROLE_PERMISSION_MAPPING.audit_viewer,
  "audit_logs:export": ROLE_PERMISSION_MAPPING.export_data,
  "audit_logs:none": ROLE_PERMISSION_MAPPING.none,
  "audit_logs:filter_advanced": ROLE_PERMISSION_MAPPING.audit_viewer, // Advanced filtering
};

export const ROLE_ORGANIZATION_OPTIONS = makeOptionsFromObject(
  ROLE_ORGANIZATION_MAPPING,
);
export const ROLE_DEVELOPER_OPTIONS = makeOptionsFromObject(
  ROLE_DEVELOPER_MAPPING,
);
export const ROLE_COUNTERPARTY_OPTIONS = makeOptionsFromObject(
  ROLE_COUNTERPARTY_MAPPING,
);
export const ROLE_LEDGER_OPTIONS = makeOptionsFromObject(ROLE_LEDGER_MAPPING);
export const ROLE_EXTERNAL_ACCOUNT_OPTIONS = makeOptionsFromObject(
  ROLE_EXTERNAL_ACCOUNT_MAPPING,
);
export const ROLE_EXTERNAL_ACCOUNT_API_OPTIONS = makeOptionsFromObject(
  ROLE_EXTERNAL_ACCOUNT_API_MAPPING,
);
export const ROLE_COMPLIANCE_OPTIONS = makeOptionsFromObject(
  ROLE_COMPLIANCE_MAPPING,
);
export const ROLE_COMPLIANCE_API_OPTIONS = makeOptionsFromObject(
  ROLE_COMPLIANCE_API_MAPPING,
);
export const ROLE_PARTNER_SEARCH_OPTIONS = makeOptionsFromObject(
  ROLE_PARTNER_SEARCH_MAPPING,
);

export const ROLE_API_KEY_OPTIONS = makeOptionsFromObject(
  ROLE_API_KEYS_MAPPING,
);

export const ROLE_CUSTOMER_ADMIN_TOOLS_OPTIONS = makeOptionsFromObject(
  ROLE_CUSTOMER_ADMIN_TOOLS_MAPPING,
);

export const ROLE_PARTNER_ADMIN_TOOLS_OPTIONS = makeOptionsFromObject(
  ROLE_PARTNER_ADMIN_TOOLS_MAPPING,
);

export const ROLE_ENGINEERING_DEBUG_TOOLS_OPTIONS = makeOptionsFromObject(
  ROLE_ENGINEERING_DEBUG_TOOLS_MAPPING,
);

export const ROLE_ANALYTICS_OPTIONS = makeOptionsFromObject(
  ROLE_ANALYTICS_MAPPING,
);

export const ROLE_WEBHOOK_OPTIONS = makeOptionsFromObject(
  ROLE_WEBHOOK_MAPPING,
);

export const ROLE_AUDIT_LOGS_OPTIONS = makeOptionsFromObject(
  ROLE_AUDIT_LOGS_MAPPING,
);

export const ACCOUNT_PERMISSIONS_MAPPING: Record<string, string> = {
  "accounts:manage": ROLE_PERMISSION_MAPPING.manage_review,
  "accounts:read": ROLE_PERMISSION_MAPPING.read,
  "accounts:none": ROLE_PERMISSION_MAPPING.none,
  "accounts:partial": ROLE_PERMISSION_MAPPING.per_account,
  "accounts:create": ROLE_PERMISSION_MAPPING.manage,
  "accounts:view_balances": ROLE_PERMISSION_MAPPING.read,
  "accounts:transfer_funds": ROLE_PERMISSION_MAPPING.review_edit,
};

export const PER_ACCOUNT_PERMISSIONS_MAPPING: Record<string, string> = {
  "accounts:manage": ROLE_PERMISSION_MAPPING.manage_review,
  "accounts:read": ROLE_PERMISSION_MAPPING.read,
  "accounts:none": ROLE_PERMISSION_MAPPING.none,
  "accounts:transaction_history": ROLE_PERMISSION_MAPPING.read,
  "accounts:statement_access": ROLE_PERMISSION_MAPPING.partial_read,
};

export const ACCOUNT_PERMISSIONS_OPTIONS = makeOptionsFromObject(
  ACCOUNT_PERMISSIONS_MAPPING,
);

export const OPERATIONAL_STATUSES = [
  OperationalStatusEnum.Deactivated,
  OperationalStatusEnum.Operational,
  OperationalStatusEnum.Preview,
  OperationalStatusEnum.Trial,
  OperationalStatusEnum.Maintenance, // Added new status
  OperationalStatusEnum.Suspended, // Added new status
  OperationalStatusEnum.Degraded, // Added new status
];

export const OPERATIONAL_STATUS_MAPPING: Record<OperationalStatusEnum, string> = {
  [OperationalStatusEnum.Deactivated]: "Deactivated",
  [OperationalStatusEnum.Operational]: "Operational",
  [OperationalStatusEnum.Preview]: "Preview Mode",
  [OperationalStatusEnum.Trial]: "Trial Period",
  [OperationalStatusEnum.Maintenance]: "Under Maintenance",
  [OperationalStatusEnum.Suspended]: "Suspended",
  [OperationalStatusEnum.Degraded]: "Degraded Performance",
};

export const OPERATIONAL_STATUS_OPTIONS = makeOptionsFromObject(OPERATIONAL_STATUS_MAPPING);

export const PAYMENT_ORDER_STATUSES = {
  pending: "Pending",
  needs_approval: "Needs Approval",
  approved: "Approved",
  denied: "Denied",
  processing: "Processing",
  sent: "Sent",
  completed: "Completed",
  returned: "Returned",
  failed: "Failed",
  reversed: "Reversed",
  cancelled: "Cancelled",
  expired: "Expired", // Added new status
  on_hold: "On Hold", // Added new status
  scheduled: "Scheduled", // Added new status
  acknowledged: "Acknowledged", // Added new status
  partially_completed: "Partially Completed", // Added
};

export const PAYMENT_ORDER_STATUS_OPTIONS = makeOptionsFromObject(
  PAYMENT_ORDER_STATUSES,
);

/**
 * Maps Payment Order Status enums to corresponding UI BadgeType for visual representation.
 * This is based on the imported `PaymentOrder__StatusEnum` and aims to cover common states.
 */
export const PAYMENT_ORDER_STATUS_TO_BADGE: Record<
  PaymentOrder__StatusEnum,
  BadgeType
> = {
  [PaymentOrder__StatusEnum.Approved]: BadgeType.Success,
  [PaymentOrder__StatusEnum.Cancelled]: BadgeType.Warning,
  [PaymentOrder__StatusEnum.Completed]: BadgeType.Success,
  [PaymentOrder__StatusEnum.Denied]: BadgeType.Critical,
  [PaymentOrder__StatusEnum.Failed]: BadgeType.Critical,
  [PaymentOrder__StatusEnum.NeedsApproval]: BadgeType.Cool,
  [PaymentOrder__StatusEnum.Pending]: BadgeType.Purple,
  [PaymentOrder__StatusEnum.Processing]: BadgeType.Cool,
  [PaymentOrder__StatusEnum.Returned]: BadgeType.Success,
  [PaymentOrder__StatusEnum.Reversed]: BadgeType.Warm,
  [PaymentOrder__StatusEnum.Sent]: BadgeType.Default,
  // Assuming extended PaymentOrder__StatusEnum values if they were present in graphqlSchema
  // [PaymentOrder__StatusEnum.Expired]: BadgeType.Warning,
  // [PaymentOrder__StatusEnum.OnHold]: BadgeType.Info,
  // [PaymentOrder__StatusEnum.Scheduled]: BadgeType.Purple,
  // [PaymentOrder__StatusEnum.Acknowledged]: BadgeType.Default,
  // [PaymentOrder__StatusEnum.PartiallyCompleted]: BadgeType.Cool,
};

export const TRANSACTION_MONITORING_ENABLED_STATUS = {
  enabled: "Enabled",
  disabled: "Disabled",
  pending_setup: "Pending Setup", // Added new status
  failed_setup: "Failed Setup", // Added new status
  configured: "Configured (Awaiting Activation)", // Added
};

export const TRANSACTION_MONITORING_ENABLED_STATUS_OPTIONS =
  makeOptionsFromObject(TRANSACTION_MONITORING_ENABLED_STATUS);

export const PAPER_ITEM_STATUSES = {
  pending: "Pending",
  completed: "Completed",
  returned: "Returned",
  voided: "Voided", // Added new status
  in_transit: "In Transit", // Added new status
  deposited: "Deposited", // Added
  rejected: "Rejected", // Added
};

export const PAPER_ITEM_STATUS_OPTIONS =
  makeOptionsFromObject(PAPER_ITEM_STATUSES);

export const INCOMING_PAYMENT_DETAILS_STATUSES = {
  pending: "Pending",
  completed: "Completed",
  returned: "Returned",
  failed: "Failed", // Added new status
  partially_received: "Partially Received", // Added new status
  on_hold: "On Hold", // Added
  awaiting_reconciliation: "Awaiting Reconciliation", // Added
};

export const INCOMING_PAYMENT_DETAILS_STATUS_OPTIONS = makeOptionsFromObject(
  INCOMING_PAYMENT_DETAILS_STATUSES,
);

export const EXPECTED_PAYMENT_STATUSES = {
  unreconciled: "Unreconciled",
  partially_reconciled: "Partially Reconciled",
  reconciled: "Reconciled",
  archived: "Deleted",
  overdue: "Overdue", // Added new status
  pending_creation: "Pending Creation", // Added new status
  cancelled: "Cancelled", // Added
};

export const EXPECTED_PAYMENT_STATUS_OPTIONS = makeOptionsFromObject(
  EXPECTED_PAYMENT_STATUSES,
);

/**
 * Maps Expected Payment Status enums to corresponding UI BadgeType.
 * This is based on the imported `ExpectedPayment__StatusEnum`.
 */
export const EXPECTED_PAYMENT_STATUS_TO_BADGE: Record<
  ExpectedPayment__StatusEnum,
  BadgeType
> = {
  [ExpectedPayment__StatusEnum.Archived]: BadgeType.Warning,
  [ExpectedPayment__StatusEnum.PartiallyReconciled]: BadgeType.Cool,
  [ExpectedPayment__StatusEnum.Reconciled]: BadgeType.Success,
  [ExpectedPayment__StatusEnum.Unreconciled]: BadgeType.Default,
  // Assuming extended ExpectedPayment__StatusEnum values
  // [ExpectedPayment__StatusEnum.Overdue]: BadgeType.Critical,
  // [ExpectedPayment__StatusEnum.PendingCreation]: BadgeType.Info,
  // [ExpectedPayment__StatusEnum.Cancelled]: BadgeType.Warning,
};

/**
 * Comprehensive mapping of payment types to human-readable names.
 * This list can be used for UI display in payment forms or filters.
 */
export const PRETTY_PAYMENT_TYPE_MAPPING: Record<string, string> = {
  ach: "ACH",
  au_becs: "AU BECS",
  bacs: "Bacs",
  bankgirot: "Bankgirot",
  book: "Book Transfer",
  card: "Card",
  chats: "CHATS",
  check: "Check",
  cross_border: "Cross Border",
  dk_nets: "DK Nets",
  eft: "EFT",
  hu_ics: "HU ICS",
  interac: "Interac",
  masav: "Masav EFT",
  mx_ccen: "MX CCEN",
  neft: "NEFT",
  nics: "NICS",
  nz_becs: "NZ BECS",
  pl_elixir: "PL ELIXIR",
  provxchange: "ProvXchange",
  ro_sent: "RO SENT",
  rtp: "RTP",
  sg_giro: "SG GIRO",
  sen: "SEN",
  sepa: "SEPA",
  sic: "SIC",
  sknbi: "SKNBI",
  signet: "Signet",
  wire: "Wire",
  zengin: "Zengin",
  faster_payments: "Faster Payments (UK)", // Added
  pix: "Pix (Brazil)", // Added
  instapay: "InstaPay (Philippines)", // Added
  chaps: "CHAPS (UK)", // Added
  target2: "TARGET2 (EU)", // Added
  fednow: "FedNow (US)", // Added for modern systems
  giro: "Giro (Netherlands)", // Added
  sct: "SCT (SEPA Credit Transfer)", // Added
  sdd: "SDD (SEPA Direct Debit)", // Added
  bill_pay: "Bill Pay", // Added for common use cases
};

/**
 * Payment type mapping with priority distinctions (e.g., same-day ACH).
 * Useful for scenarios where different speeds or service levels exist for a payment rail.
 */
export const PRETTY_PAYMENT_TYPE_MAPPING_WITH_PRIORITY: Record<string, string> =
  {
    ach_high: "Same-Day ACH",
    ach: "ACH",
    au_becs: "AU BECS",
    bacs: "Bacs",
    bankgirot: "Bankgirot",
    book: "Book Transfer",
    chats: "CHATS",
    check_high: "Check (Overnight)",
    check: "Check (First-Class Mail)",
    cross_border: "Cross Border",
    dk_nets: "DK Nets",
    eft_high: "High Priority EFT",
    eft: "EFT",
    hu_ics: "HU ICS",
    interac: "Interac",
    masav: "Masav EFT",
    mx_ccen: "MX CCEN",
    neft: "NEFT",
    nics: "NICS",
    nz_becs: "NZ BECS",
    pl_elixir: "PL ELIXIR",
    provxchange: "ProvXchange",
    ro_sent: "RO SENT",
    rtp: "RTP",
    sg_giro: "SG GIRO",
    sen: "SEN",
    sepa_instant: "SEPA Instant Credit Transfer", // Added
    sepa: "SEPA Credit Transfer",
    sic: "SIC",
    sknbi: "SKNBI",
    signet: "Signet",
    wire_priority: "Wire (Priority)", // Added
    wire: "Wire",
    zengin: "Zengin",
    faster_payments_express: "Faster Payments (Express)", // Added
    faster_payments: "Faster Payments (Standard)", // Added
    pix_instant: "Pix (Instant)", // Added
    pix_scheduled: "Pix (Scheduled)", // Added
    fednow_immediate: "FedNow (Immediate)", // Added
    fednow_standard: "FedNow (Standard)", // Added
    chaps_guaranteed: "CHAPS (Guaranteed)", // Added
  };

/**
 * Mapping for cross-border payment subtypes.
 * This can be used to categorize specific international payment methods.
 */
export const PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_MAPPING: Record<
  string,
  string
> = {
  au_becs: "AU BECS",
  bacs: "Bacs",
  bankgirot: "Bankgirot",
  chats: "CHATS",
  dk_nets: "DK Nets",
  eft: "EFT",
  hu_ics: "HU ICS",
  masav: "Masav EFT",
  mx_ccen: "MX CCEN",
  neft: "NEFT",
  nics: "NICS",
  nz_becs: "NZ BECS",
  pl_elixir: "PL ELIXIR",
  ro_sent: "RO SENT",
  sg_giro: "SG GIRO",
  sepa: "SEPA",
  sic: "SIC",
  sknbi: "SKNBI",
  zengin: "Zengin",
  switzerland_sepa: "Switzerland SEPA", // Added
  korea_ktb: "Korea KTB", // Added
  india_imps: "India IMPS", // Added
  thailand_bahtnet: "Thailand BAHTNET", // Added
  phil_pesonet: "Philippines PESONet", // Added
  eu_sct_inst: "EU SCT Inst", // SEPA Instant Credit Transfer
};

/**
 * Enhanced mapping for cross-border payment subtypes including currency information
 * and a brief description. Useful for providing context in international payment flows.
 */
export const PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_MAPPING_WITH_CURRENCY: Record<
  string,
  { label: string; currency: string; description?: string }
> = {
  au_becs: {
    label: "AU BECS",
    currency: "AUD",
    description: "Australia's Bulk Electronic Clearing System.",
  },
  bacs: {
    label: "Bacs",
    currency: "GBP",
    description: "UK's Automated Clearing House (ACH) system for direct credits and debits.",
  },
  bankgirot: {
    label: "Bankgirot",
    currency: "SEK",
    description: "Sweden's clearing system for electronic payments, including direct debits and credits.",
  },
  chats: {
    label: "CHATS",
    currency: "HKD",
    description: "Hong Kong's Clearing House Automated Transfer System for high-value payments.",
  },
  dk_nets: {
    label: "DK Nets",
    currency: "DKK",
    description: "Denmark's interbank clearing system managed by Nets.",
  },
  eft: {
    label: "EFT",
    currency: "CAD",
    description: "Canada's Electronic Funds Transfer system for low-value payments.",
  },
  hu_ics: {
    label: "HU ICS",
    currency: "HUF",
    description: "Hungary's Interbank Clearing System for domestic transfers.",
  },
  masav: {
    label: "Masav EFT",
    currency: "ILS",
    description: "Israel's Automated Clearing House for interbank transfers.",
  },
  mx_ccen: {
    label: "MX CCEN",
    currency: "MXN",
    description: "Mexico's Sistema de Pagos Electrónicos Interbancarios (SPEI) equivalent for real-time payments.",
  },
  neft: {
    label: "NEFT",
    currency: "INR",
    description: "India's National Electronic Funds Transfer system for one-to-one funds transfers.",
  },
  nics: {
    label: "NICS",
    currency: "NOK",
    description: "Norway's Norwegian Interbank Clearing System for domestic payments.",
  },
  nz_becs: {
    label: "NZ BECS",
    currency: "NZD",
    description: "New Zealand's Bulk Electronic Clearing System for direct credits and debits.",
  },
  pl_elixir: {
    label: "PL ELIXIR",
    currency: "PLN",
    description: "Poland's electronic clearing system for interbank payments.",
  },
  ro_sent: {
    label: "RO SENT",
    currency: "RON",
    description: "Romania's Electronic Clearing House (SENT) for domestic payments.",
  },
  sg_giro: {
    label: "SG GIRO",
    currency: "SGD",
    description: "Singapore's GIRO interbank payment system for recurring payments.",
  },
  sepa: {
    label: "SEPA",
    currency: "EUR",
    description: "Single Euro Payments Area for Eurozone countries for credit transfers and direct debits.",
  },
  sic: {
    label: "SIC",
    currency: "CHF",
    description: "Switzerland's SIC (Swiss Interbank Clearing) system for real-time gross settlement.",
  },
  sknbi: {
    label: "SKNBI",
    currency: "IDR",
    description: "Indonesia's National Clearing System (SKNBI) for domestic interbank transfers.",
  },
  zengin: {
    label: "Zengin",
    currency: "JPY",
    description: "Japan's interbank funds transfer system for domestic transfers.",
  },
  chaps: {
    label: "CHAPS",
    currency: "GBP",
    description: "UK's high-value, urgent payment system for same-day settlement.",
  },
  target2: {
    label: "TARGET2",
    currency: "EUR",
    description: "Europe's real-time gross settlement (RTGS) system for large-value payments.",
  },
  fednow: {
    label: "FedNow",
    currency: "USD",
    description: "U.S. real-time payment system enabling instant fund transfers 24/7.",
  },
  thailand_bahtnet: {
    label: "Thailand BAHTNET",
    currency: "THB",
    description: "Thailand's Real-Time Gross Settlement (RTGS) system.",
  },
  phil_pesonet: {
    label: "Philippines PESONet",
    currency: "PHP",
    description: "Philippines' electronic funds transfer service for bulk and recurring payments.",
  },
};

export const PAYMENT_TYPE_OPTIONS = makeOptionsFromObject(
  PRETTY_PAYMENT_TYPE_MAPPING,
);
export const PAYMENT_TYPE_OPTIONS_WITH_PRIORITY = makeOptionsFromObject(
  PRETTY_PAYMENT_TYPE_MAPPING_WITH_PRIORITY,
);
export const PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_OPTIONS =
  makeOptionsFromObject(PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_MAPPING);

/**
 * Mapping for various return types in the system, detailing reasons for funds being returned.
 */
export const PRETTY_RETURN_TYPE_MAPPING: Record<string, string> = {
  ach_noc: "ACH NOC (Non-Optimal Change)",
  ach: "ACH Return",
  au_becs: "BECS Return",
  bacs: "Bacs Return",
  book: "Book Transfer Return",
  check: "Check Return",
  eft: "EFT Return",
  interac: "Interac Return",
  manual: "Manual Return",
  paper_item: "Paper Item Return",
  sepa: "SEPA Return",
  wire: "Wire Return",
  fraudulent: "Fraudulent Activity Return", // Added
  duplicate: "Duplicate Payment Return", // Added
  unauthorized: "Unauthorized Transaction Return", // Added
  insufficient_funds: "Insufficient Funds (NSF)", // Added
  account_closed: "Account Closed", // Added
};

export const RETURN_TYPE_OPTIONS = makeOptionsFromObject(
  PRETTY_RETURN_TYPE_MAPPING,
);

export const DIRECTION_OPTIONS: SelectOption[] = [
  { value: "credit", label: "Credit", tooltip: "Funds flowing into the account." },
  { value: "debit", label: "Debit", tooltip: "Funds flowing out of the account." },
  { value: "both", label: "Both", tooltip: "Show both credit and debit transactions." }, // Added
];

export const FOREIGN_EXCHANGE_INDICATOR_OPTIONS: SelectOption[] = [
  { value: "fixed_to_variable", label: "Fixed-to-Variable", tooltip: "Base currency amount is fixed, target varies with rate." },
  { value: "variable_to_fixed", label: "Variable-to-Fixed", tooltip: "Target currency amount is fixed, base varies with rate." },
  { value: "no_fx", label: "No FX", disabled: true, tooltip: "No foreign exchange applied." }, // Added, with disabled state example
];

/**
 * Enum for specifying which amount in a foreign exchange transaction is being referenced.
 */
export enum ForeignExchangeAmountEnum {
  BaseAmount = "baseAmount",
  TargetAmount = "targetAmount",
  ExchangeRate = "exchangeRate", // Added
  SettlementAmount = "settlementAmount", // Added
}

export const RECEIVING_ENTITY_TYPE_OPTIONS: SelectOption[] = [
  { value: "InternalAccount", label: "Internal Account" },
  { value: "ExternalAccount", label: "External Account" },
  { value: "VirtualAccount", label: "Virtual Account" }, // Added
  { value: "LedgerAccount", label: "Ledger Account" }, // Added
  { value: "Customer", label: "Customer Profile" }, // Added for general recipient
];

export const DECISION_SCORE_OPTIONS: SelectOption[] = [
  { value: "low", label: "Low Risk", metadata: { severity: "info" } },
  { value: "medium", label: "Medium Risk", metadata: { severity: "warning" } },
  { value: "high", label: "High Risk", metadata: { severity: "error" } },
  { value: "very_high", label: "Very High Risk", metadata: { severity: "critical" } },
  { value: "critical", label: "Critical Risk", icon: "error", metadata: { severity: "fatal" } }, // Added
];

export const DECISION_TYPE_OPTIONS: SelectOption[] = [
  { value: "user_onboarding", label: "User Onboarding" },
  { value: "transaction_monitoring", label: "Transaction Monitoring" },
  { value: "kyb", label: "KYB (Know Your Business)" }, // Added
  { value: "aml", label: "AML (Anti-Money Laundering)" }, // Added
  { value: "fraud_prevention", label: "Fraud Prevention" }, // Added
  { value: "sanctions_screening", label: "Sanctions Screening" }, // Added
];

export const CREATION_SOURCE_OPTIONS: SelectOption[] = [
  { value: "api", label: "Through the API" },
  { value: "public_dashboard", label: "On the Counterparty Form" },
  { value: "dashboard_form", label: "By a User Manually" },
  { value: "bulk_import", label: "Through a Bulk Import" },
  { value: "sweep_rule", label: "By an Automated Sweep" },
  { value: "gemini_ai_automation", label: "By Gemini AI Automation", icon: "sparkle", tooltip: "Automatically created or processed by Gemini AI." }, // Added AI integration
  { value: "scheduled_task", label: "By a Scheduled Task" }, // Added
  { value: "migration", label: "Via Data Migration" }, // Added
];

export const VERIFIED_BY_OPTIONS: SelectOption[] = [
  { value: "plaid", label: "Plaid" },
  { value: "persona", label: "Persona" }, // Added
  { value: "trulioo", label: "Trulioo" }, // Added
  { value: "manual", label: "Manual Review" }, // Added
  { value: "gemini_ai_check", label: "Gemini AI Verification", tooltip: "Assisted or fully verified by Gemini AI models." }, // Added AI integration
  { value: "yodlee", label: "Yodlee" }, // Added
];

export const BUSINESS_NAME_OPTIONS: SelectOption[] = [
  { value: "verified", label: "Verified" },
  { value: "similar_match", label: "Similar Match" },
  { value: "alternate_name", label: "Alternate Name" },
  { value: "unverified", label: "Unverified" },
  { value: "no_match", label: "No Match" }, // Added
  { value: "ai_suggested", label: "AI Suggested Match", tooltip: "Gemini AI identified a potential match." }, // Added AI
];

export const ADDRESS_VERIFICATION_OPTIONS: SelectOption[] = [
  { value: "verified", label: "Verified" },
  { value: "approximate_match", label: "Approximate Match" },
  { value: "similar_match", label: "Similar Match" },
  { value: "incomplete_match", label: "Incomplete Match" },
  { value: "unverified", label: "Unverified" },
  { value: "failed", label: "Failed Verification" }, // Added
  { value: "ai_confident", label: "AI Confident Match", tooltip: "High confidence match by Gemini AI geo-location analysis." }, // Added AI
];

export const TIN_OPTIONS: SelectOption[] = [
  { value: "found", label: "Found" },
  { value: "not_found", label: "Not Found" },
  { value: "mismatch", label: "Mismatch" },
  { value: "error", label: "Error" },
  { value: "verified", label: "Verified Match" }, // Added
  { value: "ai_cross_referenced", label: "AI Cross-Referenced", tooltip: "TIN verified against multiple sources by Gemini AI." }, // Added AI
];

export const PEOPLE_VERIFICATION_OPTIONS: SelectOption[] = [
  { value: "verified", label: "Verified" },
  { value: "partial_match", label: "Partial Match" },
  { value: "unverified", label: "Unverified" },
  { value: "failed", label: "Failed Verification" }, // Added
  { value: "liveness_check_failed", label: "Liveness Check Failed" }, // Added
  { value: "ai_high_risk", label: "AI High Risk", tooltip: "Gemini AI identified potential identity spoofing risk." }, // Added AI
];

export const WATCHLIST_OPTIONS: SelectOption[] = [
  { value: "no_hits", label: "No Hits" },
  { value: "hits", label: "Hits" },
  { value: "potential_match", label: "Potential Match" }, // Added
  { value: "false_positive_ai", label: "AI Flagged False Positive", tooltip: "AI analysis suggests a false positive match." }, // Added AI
];

export const SOS_DOMESTIC_OPTIONS: SelectOption[] = [
  { value: "domestic_active", label: "Domestic Active" },
  { value: "domestic_missing", label: "Domestic Missing" },
  { value: "domestic_inactive", label: "Domestic Inactive" },
  { value: "domestic_unknown", label: "Domestic Unknown" },
  { value: "domestic_verified", label: "Domestic Verified" }, // Added
  { value: "domestic_ai_reviewed", label: "Domestic AI Reviewed", tooltip: "AI has reviewed and confirmed domestic status." }, // Added AI
];

export const SOS_MATCH_OPTIONS: SelectOption[] = [
  { value: "submitted_active", label: "Submitted Active" },
  { value: "submitted_not_registered", label: "Submitted Not Registered" },
  { value: "submitted_inactive", label: "Submitted Inactive" },
  { value: "submitted_unknown", label: "Submitted Unknown" },
  { value: "submitted_verified", label: "Submitted Verified" }, // Added
  { value: "submitted_ai_disambiguated", label: "Submitted AI Disambiguated", tooltip: "AI clarified ambiguous match." }, // Added AI
];

export const SOS_ACTIVE_OPTIONS: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "active_registered", label: "Active & Registered" }, // Added
  { value: "active_good_standing", label: "Active & Good Standing" }, // Added
];

export const SOS_INACTIVE_OPTIONS: SelectOption[] = [
  { value: "partially_inactive", label: "Partially Inactive" },
  { value: "inactive", label: "Inactive" },
  { value: "not_registered_or_inactive", label: "Not Registered or Inactive" },
  { value: "permanently_inactive", label: "Permanently Inactive" }, // Added
  { value: "revoked_license", label: "Revoked License" }, // Added
];

export const SOS_UNKNOWN_OPTIONS: SelectOption[] = [
  { value: "partially_unknown", label: "Partially Unknown" },
  { value: "fully_unknown", label: "Fully Unknown" }, // Added
  { value: "investigate", label: "Investigation Required" }, // Added
  { value: "ai_flagged_for_review", label: "AI Flagged for Review", tooltip: "AI could not determine status and requires manual review." }, // Added AI
];

export const SOS_NOT_FOUND_OPTIONS: SelectOption[] = [
  { value: "not_found", label: "Not Found" },
  { value: "never_registered", label: "Never Registered" }, // Added
  { value: "misidentified", label: "Misidentified Entity" }, // Added
];

export const ADDRESS_PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "mixed_use", label: "Mixed-Use" }, // Added
  { value: "industrial", label: "Industrial" }, // Added
];

export const ADDRESS_REGISTERED_AGENT_OPTIONS: SelectOption[] = [
  { value: "registered_agent", label: "Registered Agent" },
  { value: "not_registered_agent", label: "Not Registered Agent" }, // Added
  { value: "virtual_office", label: "Virtual Office Address" }, // Added
];

export const ADDRESS_CMRA_OPTIONS: SelectOption[] = [
  { value: "cmra", label: "CMRA (Commercial Mail Receiving Agency)" },
  { value: "not_cmra", label: "Not CMRA" }, // Added
  { value: "po_box", label: "PO Box" }, // Added
  { value: "known_fraud_address", label: "Known Fraud Address (AI Flagged)", tooltip: "Address associated with previous fraudulent activity, identified by Gemini AI." }, // Added AI
];

export const ADDRESS_DELIVERABILITY_OPTIONS: SelectOption[] = [
  { value: "deliverable", label: "Deliverable" },
  { value: "undeliverable", label: "Undeliverable" },
  { value: "vacant", label: "Vacant" }, // Added
  { value: "seasonal", label: "Seasonal" }, // Added
  { value: "no_such_address", label: "No Such Address" }, // Added
];

export const WEBSITE_STATUS_OPTIONS: SelectOption[] = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "under_construction", label: "Under Construction" }, // Added
  { value: "redirected", label: "Redirected" }, // Added
  { value: "malware_detected", label: "Malware Detected (AI Flag)", tooltip: "Gemini AI identified potential malware or phishing risk." }, // Added AI
];

export const WEBSITE_VERIFICATION_OPTIONS: SelectOption[] = [
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
  { value: "failed_crawl", label: "Failed Crawl" }, // Added
  { value: "ai_confidence", label: "AI High Confidence", tooltip: "Gemini AI has high confidence in the website's legitimacy." }, // Added AI
];

export const WEBSITE_PARKED_OPTIONS: SelectOption[] = [
  { value: "parking_page", label: "Parking Page" },
  { value: "domain_for_sale", label: "Domain For Sale" }, // Added
  { value: "abandoned", label: "Abandoned Domain" }, // Added
];

export const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: "no_hits", label: "No Hits" },
  { value: "hits", label: "Hits" },
  { value: "categorized", label: "Categorized" }, // Added
  { value: "unclassified", label: "Unclassified" }, // Added
  { value: "ai_classified", label: "AI Classified Industry", tooltip: "Industry classification provided by Gemini AI." }, // Added AI
];

export const PHONE_OPTIONS: SelectOption[] = [
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
  { value: "mobile", label: "Mobile" }, // Added
  { value: "landline", label: "Landline" }, // Added
  { value: "voip", label: "VoIP" }, // Added
  { value: "disconnected", label: "Disconnected" }, // Added
  { value: "ai_high_risk_carrier", label: "AI High Risk Carrier", tooltip: "Gemini AI flagged carrier as high-risk for fraud." }, // Added AI
];

/**
 * Mapping for rule resource types, including UI crumbs for navigation.
 * Each entry defines how a specific resource type is presented in rule management.
 */
export const RULE_RESOURCE_TYPE_MAPPING: Record<
  string,
  { name: string; headerCrumbs: { name: string; path: string } }
> = {
  PaymentOrder: {
    name: "Payment Order",
    headerCrumbs: {
      name: "Approval Rules",
      path: "/settings/payments/rules?section=paymentOrders",
    },
  },
  ExternalAccount: {
    name: "External Account",
    headerCrumbs: {
      name: "Approval Rules",
      path: "/settings/payments/rules?section=externalAccounts",
    },
  },
  ComplianceCase: {
    name: "Compliance Case",
    headerCrumbs: {
      name: "Case Rules",
      path: "/settings/compliance/rules",
    },
  },
  ComplianceKybRule: {
    name: "Compliance Rule",
    headerCrumbs: {
      name: "KYB Rules", // More specific
      path: "/settings/compliance/rules?section=kyb",
    },
  },
  Transaction: {
    name: "Transaction",
    headerCrumbs: {
      name: "Transaction Rules",
      path: "/settings/transactions/rules",
    },
  },
  WebhookEndpoint: {
    name: "Webhook Endpoint",
    headerCrumbs: {
      name: "Webhook Rules",
      path: "/settings/webhooks/rules",
    },
  },
  User: {
    name: "User Onboarding",
    headerCrumbs: {
      name: "User Rules",
      path: "/settings/users/rules",
    },
  },
  VirtualAccount: {
    name: "Virtual Account",
    headerCrumbs: {
      name: "Virtual Account Rules",
      path: "/settings/virtual_accounts/rules",
    },
  },
  LedgerAccount: {
    name: "Ledger Account",
    headerCrumbs: {
      name: "Ledger Account Rules",
      path: "/settings/ledger_accounts/rules",
    },
  },
};

/**
 * Detailed mapping of rule keys to human-readable labels for various resource types.
 * These keys are used to define the conditions for rules.
 */
export const RULE_KEY_MAPPING: Record<string, Record<string, string>> = {
  PaymentOrder: {
    amount: "Amount",
    metadata_keys_and_values: "Metadata",
    payment_type: "Payment Type",
    direction: "Direction",
    originating_account_id: "Internal Account",
    created_by_user: "Created By",
    creation_source: "Creation Source",
    receiving_entity_type: "Receiving Account Type",
    priority: "Payment Priority", // Added
    currency: "Currency Code", // Added
    counterparty_id: "Counterparty", // Added
    estimated_delivery_time: "Estimated Delivery Time", // Added
    is_foreign_exchange: "Is Foreign Exchange", // Added
    gemini_ai_risk_score: "Gemini AI Risk Score", // Added AI integration
  },
  ExternalAccount: {
    metadata_keys_and_values: "Metadata",
    created_by_user: "Created By User",
    creation_source: "Creation Source",
    verified_by: "Verified By",
    account_number_hash: "Account Number Hash", // Added for security
    routing_number: "Routing Number", // Added
    bank_name: "Bank Name", // Added
    country_code: "Country Code", // Added
    risk_score: "Risk Score (Gemini AI)", // Added AI integration
    date_opened: "Date Opened", // Added
  },
  ComplianceCase: {
    decision_score: "Decision Score",
    decision_type: "Decision Type",
    case_status: "Case Status", // Added
    assigned_to_user: "Assigned To", // Added
    triggered_by_event: "Triggered By Event", // Added
    risk_level_ai: "AI Risk Level", // Added AI integration
    time_to_resolution: "Time To Resolution (days)", // Added for predictive rules
    compliance_officer_override: "Compliance Officer Override", // Added
  },
  ComplianceKybRule: {
    business_name: "Name",
    tin: "TIN",
    people_verification: "People Verification",
    watchlist: "Watchlist",
    sos_domestic: "SOS Domestic",
    sos_match: "SOS Match",
    sos_active: "SOS Active",
    sos_inactive: "SOS Inactive",
    sos_unknown: "SOS Unknown",
    sos_not_found: "SOS Not Found",
    address_property_type: "Address Property Type", // Typo fix
    address_registered_agent: "Address Registered Agent",
    address_cmra: "Address CMRA",
    address_deliverability: "Address Deliverability",
    website_status: "Website Status",
    website_verification: "Website Verification",
    website_parked: "Website Parked",
    industry: "True Industry",
    phone: "Phone",
    email_domain_risk: "Email Domain Risk (Gemini AI)", // Added AI integration
    social_media_presence: "Social Media Presence", // Added
    regulatory_sanctions_check: "Regulatory Sanctions Check", // Added
    ultimate_beneficial_owner_verified: "UBO Verified", // Added
  },
  Transaction: {
    amount: "Transaction Amount",
    type: "Transaction Type",
    status: "Transaction Status",
    currency: "Currency",
    created_at: "Creation Date",
    source_account_id: "Source Account",
    destination_account_id: "Destination Account",
    fraud_prediction_score: "Fraud Prediction Score (Gemini AI)", // Added AI
    transaction_purpose: "Transaction Purpose", // Added
  },
  User: {
    email_domain: "Email Domain",
    registration_ip: "Registration IP",
    country: "Country",
    last_login_device_type: "Last Login Device Type",
    kyc_status: "KYC Status",
    ai_risk_assessment: "AI Risk Assessment", // Added AI
    account_creation_date: "Account Creation Date", // Added
    is_admin: "Is Administrator", // Added
  },
};

/**
 * Standard rule values, including special keywords for rule conditions.
 */
export const RULE_VALUE_MAPPING: Record<string, string> = {
  null: "null",
  any: "any",
  true: "True",
  false: "False",
  undefined: "undefined",
  empty_string: "Empty String",
  not_applicable: "N/A",
  ai_recommended: "AI Recommended", // Added AI integration
  system_default: "System Default",
};

/**
 * Operators for constructing rules, allowing for flexible condition building.
 */
export const RULE_OPERATOR_MAPPING: Record<string, string> = {
  contains: "contains",
  eql: "is equal to",
  in: "is one of",
  less_than: "is less than",
  greater_than: "is greater than",
  starts_with: "starts with", // Added
  ends_with: "ends with", // Added
  matches_regex: "matches regex", // Added
  between: "is between", // Added
  not_eql: "is not equal to", // Added for completeness, often handled by negated.
  is_present: "is present", // Checks for existence
  is_blank: "is blank", // Checks for null/empty/undefined
};

/**
 * Negated operators for constructing rules.
 * Provides the inverse logic for each standard operator.
 */
export const NEGATED_RULE_OPERATOR_MAPPING: Record<string, string> = {
  contains: "does not contain",
  eql: "is not equal to",
  in: "is not one of",
  less_than: "greater than or equal to",
  greater_than: "less than or equal to",
  starts_with: "does not start with", // Added
  ends_with: "does not end with", // Added
  matches_regex: "does not match regex", // Added
  between: "is not between", // Added
  not_eql: "is equal to", // Added for completeness.
  is_present: "is not present",
  is_blank: "is not blank",
};

export const REQUEST_LOGS_METHOD_OPTIONS: SelectOption[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD", // Added
  "OPTIONS", // Added
  "CONNECT", // Added
  "TRACE", // Added
].map((option) => ({ value: option, label: option }));

const RESPONSE_STATUSES_MAPPING = {
  200: "200 OK",
  201: "201 Created",
  202: "202 Accepted",
  204: "204 No Content",
  400: "400 Bad Request", // Added
  401: "401 Unauthorized", // Added
  404: "404 Not Found",
  403: "403 Forbidden",
  409: "409 Conflict",
  413: "413 Payload Too Large",
  422: "422 Unprocessable Entity",
  429: "429 Too Many Requests",
  500: "500 Internal Server Error",
  502: "502 Bad Gateway", // Added
  503: "503 Service Unavailable", // Added
  504: "504 Gateway Timeout", // Added
  100: "100 Continue", // Added
  101: "101 Switching Protocols", // Added
};

export const RESPONSE_STATUS_OPTIONS = makeOptionsFromObject(
  RESPONSE_STATUSES_MAPPING,
);

export const LEDGER_SYNC_STATUS_OPTIONS: SelectOption[] = [
  { value: "unsynced", label: "Pending Sync" },
  { value: "synced", label: "Synced" },
  { value: "skipped", label: "Skipped" },
  { value: "failed", label: "Sync Failed" }, // Added
  { value: "in_progress", label: "Sync In Progress" }, // Added
  { value: "partially_synced", label: "Partially Synced" }, // Added
];

export const LEDGER_TRANSACTION_STATUS_MAPPING: Record<string, string> = {
  pending: "Pending",
  posted: "Posted",
  archived: "Archived",
  reverted: "Reverted", // Added
  failed: "Failed to Post", // Added
  scheduled: "Scheduled", // Added
  pending_approval: "Pending Approval", // Added
};

export const LEDGER_TRANSACTION_STATUS_OPTIONS = makeOptionsFromObject(
  LEDGER_TRANSACTION_STATUS_MAPPING,
);

export const LEDGER_ACCOUNT_SETTLEMENT_STATUS_MAPPING: Record<string, string> =
  {
    processing: "Processing",
    pending: "Pending",
    posted: "Posted",
    archiving: "Archiving",
    archived: "Archived",
    failed: "Failed Settlement", // Added
    reconciled: "Reconciled", // Added
    partially_settled: "Partially Settled", // Added
  };

export const LEDGER_ACCOUNT_SETTLEMENT_STATUS_OPTIONS = makeOptionsFromObject(
  LEDGER_ACCOUNT_SETTLEMENT_STATUS_MAPPING,
);

const EVENTS_RESOURCE_MAPPING = {
  balance_report: "Balance Report",
  expected_payment: "Expected Payment",
  "expected_payment.async": "Expected Payment Async",
  external_account: "External Account",
  incoming_payment_detail: "Incoming Payment Detail",
  ledger_transaction: "Ledger Transaction",
  ledger_account_payout: "Ledger Account Payout",
  ledger_account_settlement: "Ledger Account Settlement",
  ledgerable_event: "Ledgerable Event",
  ledger_event_handler: "Ledger Event Handler",
  paper_item: "Paper Item",
  payment_order: "Payment Order",
  payment_reference: "Payment Reference",
  return: "Return",
  reversal: "Reversal",
  transaction: "Transaction",
  user_onboarding: "User Onboarding",
  decision: "Decision",
  case: "Case",
  bulk_request: "Bulk Request",
  bulk_result: "Bulk Result",
  virtual_account: "Virtual Account", // Added
  api_key: "API Key", // Added
  rule: "Rule Configuration", // Added
  organization: "Organization Settings", // Added
  user: "User Management", // Added
  compliance_report: "Compliance Report", // Added
  customer_profile: "Customer Profile", // Added
  partner_integration: "Partner Integration", // Added
  system_health: "System Health", // Added
};

export const EVENTS_RESOURCE_OPTIONS = makeOptionsFromObject(
  EVENTS_RESOURCE_MAPPING,
);

const EVENTS_NAME_MAPPING = {
  acknowledged: "acknowledged",
  approved: "approved",
  begin_processing: "begin_processing",
  cancelled: "cancelled",
  completed: "completed",
  confirmed: "confirmed",
  created: "created",
  denied: "denied",
  expired: "expired",
  failed_verification: "failed_verification",
  failed: "failed",
  finish_processing: "finish_processing",
  nsf_deferment: "nsf_deferment",
  nsf_plaid_error_but_processing: "nsf_plaid_error_but_processing",
  overdue: "overdue",
  partially_reconciled: "partially_reconciled",
  reconciled: "reconciled",
  return_failed: "return_failed",
  returned: "returned",
  reversed: "reversed",
  tentatively_reconciled: "tentatively_reconciled",
  updated: "updated",
  unreconciled: "unreconciled",
  verified: "verified",
  deleted: "deleted", // Added
  suspended: "suspended", // Added
  activated: "activated", // Added
  review_pending: "review_pending", // Added
  ai_flagged: "ai_flagged", // Added AI integration
  anomaly_detected: "anomaly_detected", // Added AI integration
  risk_mitigated: "risk_mitigated", // Added AI integration
  escalated: "escalated", // Added
  resolved: "resolved", // Added
  manual_intervention: "manual_intervention", // Added
};

export const EVENTS_NAME_OPTIONS = makeOptionsFromObject(EVENTS_NAME_MAPPING);

const RECONCILIATION_RULES_STATUS_MAPPING = {
  inactive: "Inactive",
  active: "Active",
  draft: "Draft", // Added
  archived: "Archived", // Added
  pending_review: "Pending Review", // Added
  ai_recommended: "AI Recommended (Active)", // Added AI integration
  superseded: "Superseded", // Added
};

export const RECONCILIATION_RULES_STATUS_OPTIONS = makeOptionsFromObject(
  RECONCILIATION_RULES_STATUS_MAPPING,
);

export const PAYMENT_REFERENCE_TYPE_MAPPING: Record<string, string> = {
  ach_original_trace_number: "ACH Original Trace Number",
  ach_trace_number: "ACH Trace Number",
  bankprov_payment_activity_date: "BankProv Payment Activity Date",
  bankprov_payment_id: "BankProv Payment ID",
  bnk_dev_prenotification_id: "Increase Prenotification ID",
  bnk_dev_transfer_id: "Increase Transfer ID",
  bofa_end_to_end_id: "Bank of America End To End ID",
  bofa_transaction_id: "Bank of America Transaction ID",
  check_number: "Check Number",
  column_transfer_id: "Column Transfer ID",
  column_fx_quote_id: "Column Foreign Exchange (FX) Quote ID",
  column_reversal_pair_transfer_id: "Column Reversal Pair Transfer ID",
  cross_river_payment_id: "Cross River Payment ID",
  cross_river_transaction_id: "Cross River Transaction ID",
  currencycloud_conversion_id: "Currencycloud Conversion ID",
  currencycloud_payment_id: "Currencycloud Payment ID",
  dc_bank_transaction_id: "DC Bank Transaction ID",
  dwolla_transaction_id: "Dwolla Transaction ID",
  eft_trace_number: "EFT Trace Number",
  evolve_transaction_id: "Evolve Transaction ID",
  fedwire_imad: "FedWire Input Message Accountability Data (IMAD)",
  fedwire_omad: "FedWire Output Message Accountability Data (OMAD)",
  first_republic_internal_id: "First Republic Internal ID",
  goldman_sachs_collection_request_id: "Goldman Sachs Collection Request ID",
  goldman_sachs_end_to_end_id: "Goldman Sachs End To End ID",
  goldman_sachs_payment_request_id: "Goldman Sachs Payment Request ID",
  goldman_sachs_request_id: "Goldman Sachs Request ID",
  goldman_sachs_unique_payment_id: "Goldman Sachs Unique Payment ID",
  interac_message_id: "Interac Message ID",
  jpmc_ccn: "JPMC CCN",
  jpmc_end_to_end_id: "JPMC End to End ID",
  jpmc_firm_root_id: "JPMC Firm Root ID",
  jpmc_p3_id: "JPMC P3 ID",
  jpmc_payment_batch_id: "JPMC Payment Batch ID",
  jpmc_payment_information_id: "JPMC Payment Information ID",
  jpmc_payment_returned_datetime: "JPMC Payment Returned Datetime",
  lob_check_id: "Lob Check ID",
  other: "Other",
  partial_swift_mir: "Partial SWIFT Message Input Reference (MIR)",
  pnc_clearing_reference: "PNC Clearing Reference",
  pnc_instruction_id: "PNC Instruction ID",
  pnc_multipayment_id: "PNC Multipayment ID",
  pnc_payment_trace_id: "PNC Trace ID",
  rtp_instruction_id: "RTP Instruction ID",
  signet_api_reference_id: "Signet Reference ID",
  signet_confirmation_id: "Signet Confirmation ID",
  signet_request_id: "Signet Request ID",
  silvergate_payment_id: "Silvergate Payment ID",
  swift_mir: "SWIFT Message Input Reference (MIR)",
  swift_uetr: "SWIFT Unique End-to-end Transaction Reference (UETR)",
  umb_product_partner_account_number: "UMB Product Partner Account Number",
  usbank_payment_id: "US Bank Payment ID",
  wells_fargo_payment_id: "Wells Fargo Payment ID",
  wells_fargo_trace_number: "Wells Fargo Trace Number",
  custom_merchant_id: "Custom Merchant ID", // Added
  blockchain_transaction_hash: "Blockchain Transaction Hash", // Added for crypto integration
  gemini_ai_transaction_id: "Gemini AI Transaction ID", // Added AI
  fednow_payment_id: "FedNow Payment ID", // Added
  sepa_end_to_end_id: "SEPA End-to-End ID", // Added
};

export const PAYMENT_REFERENCE_TYPE_OPTIONS = makeOptionsFromObject(
  PAYMENT_REFERENCE_TYPE_MAPPING,
);

export const PAYMENT_TYPES_WITH_NSF = ["ach", "eft", "check", "sepa_direct_debit"]; // Expanded for direct debits

export const PAYMENT_TYPES_WITH_TM = ["ach", "wire", "check", "eft", "rtp", "sepa", "card", "fednow"]; // Expanded for real-time and card

export const TRANSACTION_LINE_ITEM_TRANSACTABLE_TYPE_MAPPING = {
  PaymentOrderAttempt: "Payment Order",
  PaperItem: "Paper Item",
  Reversal: "Reversal",
  Return: "Return",
  IncomingPaymentDetail: "Incoming Payment Detail",
  LedgerTransaction: "Ledger Transaction", // Added
  ManualEntry: "Manual Journal Entry", // Added
  Fee: "Fee", // Added
  FXTrade: "FX Trade", // Added for foreign exchange
};

export const BALANCE_REPORT_TYPES: Record<string, string> = {
  intraday: "Intraday",
  previous_day: "Previous Day",
  real_time: "Real Time",
  other: "Other",
  end_of_day: "End of Day", // Added
  start_of_day: "Start of Day", // Added
  weekly_summary: "Weekly Summary", // Added
};

export const BALANCE_REPORT_TYPE_OPTIONS =
  makeOptionsFromObject(BALANCE_REPORT_TYPES);

export const TRANSACTION_LINE_ITEM_TRANSACTABLE_TYPE_OPTIONS =
  makeOptionsFromObject(TRANSACTION_LINE_ITEM_TRANSACTABLE_TYPE_MAPPING);

/**
 * Suggestions for audit record event names.
 * This mapping supports autocomplete/lookup for audit events in search interfaces.
 */
export const AUDIT_RECORD_EVENT_NAME_SUGGESTION_MAPPING: {
  [value: string]: string;
} = {
  "account_collection.create": "account_collection.create",
  "account_collection.update": "account_collection.update", // Added
  "account_collection.delete": "account_collection.delete", // Added
  "account_detail.create": "account_detail.create",
  "account_detail.read": "account_detail.read",
  "account_detail.update": "account_detail.update", // Added
  "accounting/ledger.delete": "ledger.delete",
  "accounting/ledger.update": "ledger.update",
  "accounting/ledger.create": "ledger.create", // Added
  "address.create": "address.create",
  "address.update": "address.update", // Added
  "address.delete": "address.delete", // Added
  "api_key.create": "api_key.create",
  "api_key.delete": "api_key.delete",
  "api_key.read_secret": "api_key.read_secret",
  "api_key.update": "api_key.update",
  "bulk_import.download": "bulk_import.download",
  "bulk_import.upload": "bulk_import.upload", // Added
  "bulk_import.process_start": "bulk_import.process_start", // Added
  "counterparty.create": "counterparty.create",
  "counterparty.delete": "counterparty.delete",
  "counterparty.update": "counterparty.update",
  "counterparty.read": "counterparty.read",
  "counterparty.archive": "counterparty.archive", // Added
  "email.failed_to_send": "email.failed_to_send",
  "email.sent": "email.sent",
  "email.received": "email.received", // Added
  "document.create": "document.create",
  "document.delete": "document.delete",
  "document.read": "document.read", // Added
  "expected_payment.create": "expected_payment.create",
  "expected_payment.mark_as_reconciled": "expected_payment.mark_as_reconciled",
  "expected_payment.reconcile": "expected_payment.reconcile",
  "expected_payment.unreconcile": "expected_payment.unreconcile",
  "expected_payment.update": "expected_payment.update",
  "expected_payment.archive": "expected_payment.archive", // Added
  "exporting/export.create": "export.create",
  "exporting/export.download": "export.download",
  "exporting/export.status_update": "export.status_update", // Added
  "external_account.create": "external_account.create",
  "external_account.delete": "external_account.delete",
  "external_account.update": "external_account.update",
  "external_account.verify": "external_account.verify", // Added
  "external_account.link": "external_account.link", // Added
  "group.create": "group.create",
  "group.update": "group.update",
  "group.delete": "group.delete", // Added
  "group_user.create": "group_user.create",
  "group_user.update": "group_user.update",
  "group_user.delete": "group_user.delete", // Added
  "incoming_payment_detail.read": "incoming_payment_detail.read",
  "incoming_payment_detail.update": "incoming_payment_detail.update", // Added
  "incoming_payment_detail.reconcile": "incoming_payment_detail.reconcile", // Added
  "internal_account.create": "internal_account.create",
  "internal_account.update": "internal_account.update",
  "internal_account.read": "internal_account.read", // Added
  "internal_account.suspend": "internal_account.suspend", // Added
  "invoices/invoice.create": "invoice.create",
  "invoices/invoice.update": "invoice.update",
  "invoices/invoice.delete": "invoice.delete", // Added
  "invoices/invoice.pay": "invoice.pay", // Added
  "ledger_account.create": "ledger_account.create",
  "ledger_account.delete": "ledger_account.delete",
  "ledger_account.update": "ledger_account.update",
  "ledger.create": "ledger.create",
  "ledger.delete": "ledger.delete",
  "ledger_transaction.create": "ledger_transaction.create",
  "ledger_transaction.update": "ledger_transaction.update",
  "ledger_transaction.void": "ledger_transaction.void", // Added
  "ledger_transaction.post": "ledger_transaction.post", // Added
  "ledger.update": "ledger.update",
  "line_item.create": "line_item.create",
  "line_item.update": "line_item.update",
  "line_item.delete": "line_item.delete", // Added
  "notification_group.create": "notification_group.create",
  "notification_group.delete": "notification_group.delete",
  "notification_group.update": "notification_group.update", // Added
  "organization.update": "organization.update",
  "organization.read": "organization.read", // Added
  "organization.create": "organization.create", // Added
  "organization_user.create": "organization_user.create",
  "organization_user.delete": "organization_user.delete",
  "organization_user.update": "organization_user.update",
  "organization_user.invite": "organization_user.invite", // Added
  "paper_item.update": "paper_item.update",
  "paper_item.create": "paper_item.create", // Added
  "paper_item.void": "paper_item.void", // Added
  "payment_order.approve": "payment_order.approve",
  "payment_order.cancel": "payment_order.cancel",
  "payment_order.create": "payment_order.create",
  "payment_order.deny": "payment_order.deny",
  "payment_order.redraft": "payment_order.redraft",
  "payment_order.reversed": "payment_order.reversed",
  "payment_order.undo_approval": "payment_order.undo_approval",
  "payment_order.update": "payment_order.update",
  "payment_order.schedule": "payment_order.schedule", // Added
  "payment_order.complete": "payment_order.complete", // Added
  "reporting/folder.create": "report_folder.create",
  "reporting/folder.delete": "report_folder.delete",
  "reporting/folder.update": "report_folder.update",
  "reporting/report.create": "report.create",
  "reporting/report.delete": "report.delete",
  "reporting/reporting_permission.create": "reporting_permission.create",
  "reporting/reporting_permission.delete": "reporting_permission.delete",
  "reporting/report.update": "report.update",
  "reporting/report.generate": "report.generate", // Added
  "return.read": "return.read",
  "return.create": "return.create", // Added
  "return.process": "return.process", // Added
  "reversal.create": "reversal.create",
  "reversal.approve": "reversal.approve", // Added
  "routing_detail.create": "routing_detail.create",
  "routing_detail.update": "routing_detail.update", // Added
  "routing_detail.delete": "routing_detail.delete", // Added
  "rule.create": "rule.create",
  "rule.delete": "rule.delete",
  "rule.update": "rule.update",
  "rule.activate": "rule.activate", // Added
  "rule.deactivate": "rule.deactivate", // Added
  "session.create": "session.create",
  "session.delete": "session.delete", // Added
  "transaction_line_item.create": "transaction_line_item.create",
  "transaction_line_item.update": "transaction_line_item.update",
  "transaction_line_item.read": "transaction_line_item.read",
  "transaction.reconcile": "transaction.reconcile",
  "transaction.unreconcile": "transaction.unreconcile",
  "transaction.update": "transaction.update",
  "transaction.flag_for_review": "transaction.flag_for_review", // Added
  "transaction.auto_categorize": "transaction.auto_categorize", // Added AI
  "user.create": "user.create",
  "user.delete": "user.delete",
  "user.update": "user.update",
  "user.login": "user.login", // Added
  "user.logout": "user.logout", // Added
  "user.password_reset": "user.password_reset", // Added
  "user.2fa_enabled": "user.2fa_enabled", // Added
  "verification_attempt.create": "verification_attempt.create",
  "verification_attempt.update": "verification_attempt.update",
  "verification_attempt.fail": "verification_attempt.fail", // Added
  "verification_attempt.success": "verification_attempt.success", // Added
  "virtual_account.create": "virtual_account.create",
  "virtual_account.delete": "virtual_account.delete",
  "virtual_account.update": "virtual_account.update",
  "webhook_endpoint.create": "webhook_endpoint.create",
  "webhook_endpoint.delete": "webhook_endpoint.delete",
  "webhook_endpoint.update": "webhook_endpoint.update", // Added
  "webhook_event.resend": "webhook_event.resend",
  "webhook_event.failure": "webhook_event.failure", // Added
  "compliance.ai_decision": "compliance.ai_decision", // Added AI integration
  "compliance.ai_review": "compliance.ai_review", // Added AI integration
  "system.health_check": "system.health_check", // Added
  "system.configuration_update": "system.configuration_update", // Added
  "system.maintenance_start": "system.maintenance_start", // Added
};

export const AUDIT_RECORD_EVENT_NAME_SUGGESTION_OPTIONS = makeOptionsFromObject(
  AUDIT_RECORD_EVENT_NAME_SUGGESTION_MAPPING,
);

export const AUDIT_RECORD_ENTITY_TYPE_MAPPINGS = {
  AccountDetail: "Account Detail",
  "Accounting::Ledger": "Accounting Ledger",
  Address: "Address",
  APIKey: "API Key",
  BulkImport: "Bulk Import",
  "Compliance::Decision": "Compliance Decision",
  "Compliance::Case": "Compliance Case",
  Counterparty: "Counterparty",
  Document: "Document",
  ExpectedPayment: "Expected Payment",
  "Exporting::Export": "Export",
  ExternalAccount: "External Account",
  Group: "Group",
  GroupUser: "Group User",
  IncomingPaymentDetail: "Incoming Payment Detail",
  InternalAccount: "Internal Account",
  "Invoices::Invoice": "Invoice",
  Ledger: "Ledger",
  LedgerAccount: "Ledger Account",
  LedgerTransaction: "Ledger Transaction",
  LineItem: "Line Item",
  NotificationGroup: "Notification Group",
  Organization: "Organization",
  OrganizationUser: "Organization User",
  PaperItem: "Paper Item",
  PaymentOrder: "Payment Order",
  "Reporting::Report": "Report",
  "Reporting::ReportingPermission": "Reporting Permission",
  Reversal: "Reversal",
  Return: "Return", // Added
  RoutingDetail: "Routing Detail",
  Rule: "Rule",
  Transaction: "Transaction",
  TransactionLineItem: "Transaction Line Item",
  User: "User",
  "Compliance::UserOnboarding": "User Onboarding",
  VerificationAttempt: "Verification Attempt",
  VirtualAccount: "Virtual Account",
  WebhookEndpoint: "Webhook Endpoint",
  "System::Configuration": "System Configuration", // Added
  "AI::Model": "AI Model", // Added AI integration
  "AI::Agent": "AI Agent", // Added AI integration
};

export const AUDIT_RECORD_ACTOR_TYPE_MAPPINGS = {
  APIKey: "API",
  User: "User",
  System: "System", // Added
  "AI::Agent": "AI Agent", // Added AI integration
  "ScheduledTask": "Scheduled Task", // Added
};

export const AUDIT_RECORD_ENTITY_TYPE_OPTIONS = makeOptionsFromObject(
  AUDIT_RECORD_ENTITY_TYPE_MAPPINGS,
);

export const AUDIT_RECORD_ACTOR_TYPE_OPTIONS = makeOptionsFromObject(
  AUDIT_RECORD_ACTOR_TYPE_MAPPINGS,
);

export enum CreateResourceHeadline {
  ExpectedPayments = "New Expected Payment",
  PaymentOrders = "New Payment Order",
  Counterparties = "New Counterparty",
  ExternalAccount = "New External Account", // Added
  VirtualAccount = "New Virtual Account", // Added
  LedgerAccount = "New Ledger Account", // Added
  User = "New User", // Added
  APIKey = "New API Key", // Added
}

export const PRETTY_DECISION_STATUSES = {
  pending: "Pending",
  needs_approval: "Needs Approval",
  approved: "Approved",
  denied: "Denied",
  cancelled: "Cancelled",
  completed: "Completed",
  rejected: "Rejected", // Added
  escalated: "Escalated", // Added
  reviewed_by_ai: "Reviewed by Gemini AI", // Added AI
  manual_override: "Manual Override", // Added
};

export const DECISIONS_SCORES = {
  low: "Low",
  medium: "Medium",
  high: "High",
  very_high: "Very High",
  critical: "Critical", // Added
  pending: "Pending",
  ai_calculated: "AI Calculated", // Added AI
  manual_assessment: "Manual Assessment", // Added
};

export const VERIFICATION_STATUS_TYPES = {
  verified: "Verified",
  unverified: "Pending Generation",
  failed: "Failed",
  verifying: "Pending Verification",
  removed: "Removed",
  expired: "Expired", // Added
  manual_override: "Manual Override", // Added
  ai_assisted: "AI Assisted Verification", // Added AI
  submitted: "Submitted for Review", // Added
};

export const COMPLIANCE_DECISION_TYPES = {
  transaction_monitoring: "Transaction Monitoring",
  user_onboarding: "User Onboarding",
  kyc_review: "KYC Review", // Added
  aml_check: "AML Check", // Added
  fraud_analysis: "Fraud Analysis", // Added
  sanctions_screening: "Sanctions Screening", // Added
  ai_risk_assessment: "AI Risk Assessment", // Added AI
  adverse_media_screening: "Adverse Media Screening", // Added
};

export const ALL_ACCOUNTS_ID = "all-accounts";
export const ALL_ACCOUNT_GROUPS_ID = "all-account-groups";
export const ALL_CONNECTIONS_ID = "all-connections";
export const ALL_CURRENCIES_ID = "all-currencies"; // Added
export const ALL_PAYMENT_TYPES_ID = "all-payment-types"; // Added
export const ALL_COMPLIANCE_CASES_ID = "all-compliance-cases"; // Added

const BULK_IMPORT_RESOURCE_MAPPING = {
  Counterparty: "Counterparty",
  PaymentOrder: "Payment Order",
  ExpectedPayment: "Expected Payment",
  "Invoices::Invoice": "Invoice",
  ExternalAccount: "External Account", // Added
  User: "User", // Added
  LedgerAccount: "Ledger Account", // Added
  ProductCatalog: "Product Catalog", // Added for generalized system
};

export const BULK_IMPORT_RESOURCE_OPTIONS = makeOptionsFromObject(
  BULK_IMPORT_RESOURCE_MAPPING,
);

export const QUERY_KEYS_TO_OMIT = [
  "total",
  "page",
  "perPage",
  "endCursor",
  "startCursor",
  "paginationDirection",
  "reportType",
  "showShareModal",
  "section",
  "sortBy", // Added
  "sortDirection", // Added
  "globalFilter", // Added
  "resetFilters", // Added
  "currentPage", // Added
];

export const TIME_ZONE_OPTIONS: SelectOption[] = [
  ...moment.tz.names().map((timezoneString) => {
    const timezone = moment.tz(timezoneString);
    return {
      value: timezoneString,
      label: `${timezoneString} (UTC${timezone.format("Z")})`, // Changed "Z" to "UTCZ" for clarity
      tooltip: `Current offset: ${timezone.format("Z")}`, // Added tooltip
    };
  }),
];

/**
 * Gets the ordinal suffix for a number (e.g., "st", "nd", "rd", "th").
 * @param n The number.
 * @returns The ordinal suffix.
 * @throws {Error} If the input is not an integer.
 */
function getOrdinalFor(n: number): string {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new Error('Input for getOrdinalFor must be an integer.');
  }
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Generates an array of SelectOption objects for ordinal numbers up to a given bound.
 * E.g., 1st, 2nd, 3rd.
 *
 * @param upperBound The maximum number to generate options for. Must be a positive integer.
 * @returns An array of SelectOption objects.
 * @throws {Error} If upperBound is not a positive integer.
 */
export function getOrdinalNumberOptions(upperBound: number): SelectOption<number>[] {
  if (typeof upperBound !== 'number' || !Number.isInteger(upperBound) || upperBound <= 0) {
    throw new Error('upperBound for getOrdinalNumberOptions must be a positive integer.');
  }
  const ordinalOptions: SelectOption<number>[] = [];
  for (let i = 1; i <= upperBound; i += 1) {
    ordinalOptions.push({ value: i, label: `${i}${getOrdinalFor(i)}` });
  }
  return ordinalOptions;
}

export const DAY_OF_WEEK_OPTIONS: SelectOption<string>[] = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

/**
 * Enum defining valid increments for time of day options.
 * Each value represents how many steps are in an hour (e.g., 1 for hourly, 2 for half-hourly).
 * Should be a factor of 60 to ensure even divisions.
 */
export enum TimeOfDayIncrement {
  Hour = 1,
  HalfHour = 2,
  QuarterHour = 4,
  TenMinutes = 6, // Added (60 / 10 = 6)
  FiveMinutes = 12, // Added (60 / 5 = 12)
  OneMinute = 60, // Added (60 / 1 = 60)
}

/**
 * Generates an array of SelectOption objects for times of day,
 * based on a specified increment.
 *
 * @param increment The desired increment for time options (e.g., TimeOfDayIncrement.HalfHour).
 * @returns An array of SelectOption objects, where value is hour + minute/60.
 * @throws {Error} If TimeOfDayIncrement is not a factor of 60.
 */
export function getTimeOfDayOptions(increment: TimeOfDayIncrement): SelectOption<number>[] {
  if (60 % increment !== 0) {
    throw new Error("TimeOfDayIncrement must be a factor of 60.");
  }
  const options: SelectOption<number>[] = [];
  for (let i = 0; i < 24; i += 1) {
    const amOrPm = i < 12 ? "AM" : "PM";
    const hour12 = !(i % 12) ? 12 : i % 12;

    for (let j = 0; j < increment.valueOf(); j += 1) {
      const minute = (60 / increment.valueOf()) * j;
      const formattedMinute = minute.toString().padStart(2, "0");
      const label = `${hour12}:${formattedMinute} ${amOrPm}`;
      options.push({ label, value: parseFloat((i + minute / 60).toFixed(4)) }); // Ensure precise float
    }
  }
  return options;
}

export const SCHEDULING_FREQUENCY_OPTIONS: SelectOption[] = [
  { label: "Daily", value: "day", tooltip: "Schedule runs every day." },
  { label: "Weekly", value: "week", tooltip: "Schedule runs on a specific day of the week." },
  { label: "Monthly", value: "month", tooltip: "Schedule runs on a specific day of the month." },
  { label: "Yearly", value: "year", tooltip: "Schedule runs on a specific date every year." }, // Added
  { label: "Custom Interval", value: "custom", tooltip: "Define a custom cron-like interval." }, // Added
];

/**
 * Enum representing specific cell identifiers in a global financial network.
 * These might relate to specific data centers, regions, or processing hubs
 * for distributed ledger or processing capabilities.
 */
export enum CellEnum {
  US000 = "us000", // US East Coast Primary
  US001 = "us001", // US West Coast Primary
  US002 = "us002", // US Central Backup
  US005 = "us005", // US Disaster Recovery
  EU010 = "eu010", // European Primary
  APAC020 = "apac020", // Asia-Pacific Primary
  LATAM030 = "latam030", // Latin America Primary
  AFR040 = "afr040", // Africa Primary
  MIDDLE_EAST050 = "me050", // Middle East Primary
}

/**
 * Configurations for Gemini AI services integration.
 * This interface defines parameters required to connect and utilize various Gemini AI models.
 */
export interface GeminiAIServiceConfig {
  apiKey: string; // The API key for Gemini AI. Should be securely managed.
  endpoint: string; // The base URL for the Gemini AI API.
  defaultGenerativeModel: string; // Identifier for the default text generation model.
  defaultEmbeddingModel: string; // Identifier for the default embedding generation model.
  defaultVisionModel?: string; // Optional identifier for a default vision model (e.g., for document analysis).
  safetySettings: { // Configuration for content moderation and safety filters.
    harassment: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    hateSpeech: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    sexualContent: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    dangerousContent: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
  };
  rateLimits?: { // Optional rate limit configuration for AI calls.
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

/**
 * Default configuration for connecting to Gemini AI services.
 * In a production environment, this data would typically be loaded from
 * environment variables, a secure vault, or a dedicated configuration service.
 * Placeholder values are used for demonstration.
 */
export const GEMINI_AI_DEFAULT_CONFIG: GeminiAIServiceConfig = {
  apiKey: "GEM_AI_SK_YOUR_SECURE_KEY_HERE_1234567890ABCDEF", // Replace with actual secure key
  endpoint: "https://generativelanguage.googleapis.com/v1beta",
  defaultGenerativeModel: "gemini-1.5-flash", // Latest efficient model
  defaultEmbeddingModel: "text-embedding-004", // Latest efficient embedding model
  defaultVisionModel: "gemini-1.5-pro-vision", // For visual tasks
  safetySettings: {
    harassment: "BLOCK_NONE", // Adjust based on application needs
    hateSpeech: "BLOCK_NONE",
    sexualContent: "BLOCK_NONE",
    dangerousContent: "BLOCK_NONE",
  },
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
};

/**
 * Enum for different types of insights Gemini AI can provide.
 * These categories define the scope and nature of AI-generated analysis.
 */
export enum GeminiAIInsightType {
  FraudDetection = "FRAUD_DETECTION",
  AnomalyDetection = "ANOMALY_DETECTION",
  PredictiveRiskAssessment = "PREDICTIVE_RISK_ASSESSMENT",
  SentimentAnalysis = "SENTIMENT_ANALYSIS",
  DocumentCategorization = "DOCUMENT_CATEGORIZATION",
  AutomatedReconciliation = "AUTOMATED_RECONCILIATION",
  SmartRoutingRecommendation = "SMART_ROUTING_RECOMMENDATION",
  ComplianceCasePrioritization = "COMPLIANCE_CASE_PRIORITIZATION",
  MarketTrendAnalysis = "MARKET_TREND_ANALYSIS",
  UserBehaviorProfiling = "USER_BEHAVIOR_PROFILING",
  AutomatedKYCAMLReview = "AUTOMATED_KYC_AML_REVIEW", // Added
  RegulatoryImpactAnalysis = "REGULATORY_IMPACT_ANALYSIS", // Added
}

/**
 * Mapping of Gemini AI Insight Types to human-readable labels.
 * Provides user-friendly descriptions for AI functionalities.
 */
export const GEMINI_AI_INSIGHT_TYPE_MAPPING: Record<GeminiAIInsightType, string> = {
  [GeminiAIInsightType.FraudDetection]: "Transaction Fraud Detection",
  [GeminiAIInsightType.AnomalyDetection]: "System Anomaly Detection",
  [GeminiAIInsightType.PredictiveRiskAssessment]: "Predictive Risk Assessment",
  [GeminiAIInsightType.SentimentAnalysis]: "Customer Sentiment Analysis",
  [GeminiAIInsightType.DocumentCategorization]: "Document Content Categorization",
  [GeminiAIInsightType.AutomatedReconciliation]: "Automated Account Reconciliation",
  [GeminiAIInsightType.SmartRoutingRecommendation]: "Optimal Payment Routing Recommendation",
  [GeminiAIInsightType.ComplianceCasePrioritization]: "Compliance Case Prioritization",
  [GeminiAIInsightType.MarketTrendAnalysis]: "Financial Market Trend Analysis",
  [GeminiAIInsightType.UserBehaviorProfiling]: "User Behavioral Risk Profiling",
  [GeminiAIInsightType.AutomatedKYCAMLReview]: "Automated KYC/AML Review",
  [GeminiAIInsightType.RegulatoryImpactAnalysis]: "Regulatory Change Impact Analysis",
};

export const GEMINI_AI_INSIGHT_TYPE_OPTIONS = makeOptionsFromObject(GEMINI_AI_INSIGHT_TYPE_MAPPING);

/**
 * Interface representing a generic AI-generated recommendation or insight.
 * This structure helps standardize the output from various AI analyses.
 */
export interface GeminiAIRecommendation {
  type: GeminiAIInsightType;
  score: number; // A numeric score, e.g., risk score (0-1), confidence score (0-1).
  description: string; // A human-readable explanation of the insight.
  recommendedAction: string; // A suggested action based on the insight.
  sourceDataIdentifiers: string[]; // List of IDs of data points that informed the insight (e.g., transaction IDs, user IDs).
  timestamp: string; // ISO timestamp when the recommendation was generated.
  modelUsed: string; // The specific AI model identifier used to generate the insight.
  confidenceLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"; // Qualitative confidence level.
  rawOutput?: Record<string, any>; // Optional raw output from the AI model for debugging/audit.
}

/**
 * Simulates calling a Gemini AI service to get a recommendation for a given input.
 * In a real-world scenario, this would involve an asynchronous API call to the Gemini AI endpoint.
 * This mock function demonstrates potential logic and response structure.
 *
 * @param inputData - The data to send to the AI for analysis (e.g., transaction details, user profile, document content).
 * @param insightType - The type of insight requested from the AI.
 * @param config - Optional Gemini AI service configuration. Defaults to `GEMINI_AI_DEFAULT_CONFIG`.
 * @returns A promise resolving to a GeminiAIRecommendation object.
 */
export async function getGeminiAIRecommendation(
  inputData: Record<string, any>,
  insightType: GeminiAIInsightType,
  config: GeminiAIServiceConfig = GEMINI_AI_DEFAULT_CONFIG,
): Promise<GeminiAIRecommendation> {
  // Simulate API call delay to mimic network latency
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 200));

  const timestamp = moment().toISOString();
  let score = 0.5;
  let description = `AI analysis for ${insightType} completed.`;
  let recommendedAction = "Review manually for further action.";
  let confidenceLevel: GeminiAIRecommendation['confidenceLevel'] = "MEDIUM";

  // Mock logic based on insight type
  switch (insightType) {
    case GeminiAIInsightType.FraudDetection:
      score = Math.random() * 0.4 + 0.6; // Higher score for fraud probability
      description = `Potential fraudulent activity detected based on pattern matching and behavioral analysis. Key factors include: ${Object.keys(inputData).join(', ')}.`;
      recommendedAction = score > 0.8 ? "Block transaction and escalate to fraud prevention team immediately." : "Flag transaction for expedited review and notify relevant stakeholders.";
      confidenceLevel = score > 0.85 ? "VERY_HIGH" : score > 0.7 ? "HIGH" : "MEDIUM";
      break;
    case GeminiAIInsightType.AnomalyDetection:
      score = Math.random() * 0.3 + 0.5; // Score indicating degree of anomaly
      description = `Unusual pattern observed, deviating significantly from historical norms for the entity or transaction type.`;
      recommendedAction = "Investigate the root cause of deviation; check related activities and historical data.";
      confidenceLevel = score > 0.75 ? "HIGH" : "MEDIUM";
      break;
    case GeminiAIInsightType.PredictiveRiskAssessment:
      score = Math.random() * 0.5; // Lower score for lower risk prediction
      description = `Predicted risk level for this entity/transaction is ${score < 0.3 ? 'low' : score < 0.7 ? 'medium' : 'high'}.`;
      recommendedAction = "Proceed with standard processing. Implement enhanced monitoring if risk is medium/high. Consider proactive outreach for high-risk profiles.";
      confidenceLevel = score < 0.2 ? "VERY_HIGH" : score < 0.4 ? "HIGH" : "MEDIUM"; // Confidence in prediction
      break;
    case GeminiAIInsightType.AutomatedReconciliation:
      score = Math.random() * 0.2 + 0.8; // High score for successful reconciliation
      description = `Transaction automatically reconciled with high confidence, matching multiple data points across ledgers.`;
      recommendedAction = "Confirm reconciliation and close out the item. AI confidence score: " + (score * 100).toFixed(2) + "%.";
      confidenceLevel = score > 0.9 ? "VERY_HIGH" : "HIGH";
      break;
    case GeminiAIInsightType.ComplianceCasePrioritization:
      score = Math.random();
      const priority = score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low";
      description = `Compliance case prioritized as ${priority} based on aggregated risk factors and regulatory urgency analysis.`;
      recommendedAction = `Assign to ${priority} priority queue for manual review by a compliance officer. Expedite data collection for high-priority cases.`;
      confidenceLevel = score > 0.8 ? "VERY_HIGH" : score > 0.6 ? "HIGH" : "MEDIUM";
      break;
    case GeminiAIInsightType.AutomatedKYCAMLReview:
      score = Math.random();
      const kycStatus = score > 0.8 ? "Approved" : score > 0.5 ? "Needs more info" : "Rejected";
      description = `Automated KYC/AML review suggests: ${kycStatus}. Identified discrepancies: [mock discrepancies].`;
      recommendedAction = `For ${kycStatus} status, proceed with next step. For others, request additional documentation or escalate.`;
      confidenceLevel = score > 0.85 ? "HIGH" : "MEDIUM";
      break;
    case GeminiAIInsightType.RegulatoryImpactAnalysis:
      score = Math.random() * 0.5 + 0.5; // Represents relevance
      description = `Analyzed recent regulatory updates. Potential impact on operations in region X is Y.`;
      recommendedAction = `Review AI summary and initiate internal assessment for regulatory adherence.`;
      confidenceLevel = "HIGH";
      break;
    default:
      // Fallback for other insight types, generate generic recommendation
      score = Math.random();
      break;
  }

  return {
    type: insightType,
    score: parseFloat(score.toFixed(4)),
    description,
    recommendedAction,
    sourceDataIdentifiers: [inputData.id || `mock-id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`],
    timestamp,
    modelUsed: config.defaultGenerativeModel,
    confidenceLevel,
    rawOutput: { // Mocking some raw output
      inputEcho: inputData,
      generatedTextSnippet: `Insight: ${description}. Action: ${recommendedAction}`,
    },
  };
}

/**
 * Interface for AI-driven dynamic rule thresholds.
 * These thresholds can be adjusted automatically by AI models based on real-time data
 * and risk assessments, making rule enforcement more adaptive.
 */
export interface GeminiAIDynamicRuleThreshold {
  ruleKey: string; // The specific key of the rule parameter (e.g., "amount", "risk_score").
  minThreshold: number; // The dynamically adjusted minimum allowed value.
  maxThreshold: number; // The dynamically adjusted maximum allowed value.
  lastUpdated: string; // ISO timestamp of the last AI adjustment.
  sourceAIModel: string; // The AI model responsible for the adjustment.
  reasoning: string; // Explanation for the threshold adjustment.
  effectiveUntil?: string; // Optional expiry for the dynamic threshold.
  status: "ACTIVE" | "PENDING_REVIEW" | "REJECTED"; // Status of the dynamic threshold.
}

/**
 * Simulates fetching dynamic rule thresholds adjusted by Gemini AI.
 * These thresholds can change over time based on observed patterns, fraud trends,
 * and evolving compliance requirements, providing an adaptive rule engine.
 *
 * @param ruleCategory - The category of rules for which to fetch dynamic thresholds (e.g., 'PaymentOrder', 'ComplianceCase').
 * @param config - Optional Gemini AI service configuration. Defaults to `GEMINI_AI_DEFAULT_CONFIG`.
 * @returns A promise resolving to an array of dynamic rule thresholds.
 */
export async function getGeminiAIDynamicRuleThresholds(
  ruleCategory: keyof typeof RULE_KEY_MAPPING,
  config: GeminiAIServiceConfig = GEMINI_AI_DEFAULT_CONFIG,
): Promise<GeminiAIDynamicRuleThreshold[]> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 150)); // Simulate network delay

  const thresholds: GeminiAIDynamicRuleThreshold[] = [];
  const now = moment().toISOString();
  const model = config.defaultGenerativeModel;

  switch (ruleCategory) {
    case 'PaymentOrder':
      thresholds.push({
        ruleKey: 'amount',
        minThreshold: 100 + Math.floor(Math.random() * 50), // Dynamic min based on recent small transaction volume
        maxThreshold: 10000 + Math.floor(Math.random() * 2000), // Dynamic max based on observed large transaction patterns
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Adjusted based on recent payment volume, observed fraud trends, and regional economic indicators.',
        status: "ACTIVE",
      });
      thresholds.push({
        ruleKey: 'gemini_ai_risk_score',
        minThreshold: 0.1,
        maxThreshold: 0.7 + Math.random() * 0.1, // AI continually calibrates acceptable risk range
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Calibrated for optimal balance between false positive and false negative rates in real-time fraud detection.',
        status: "ACTIVE",
        effectiveUntil: moment().add(7, 'days').toISOString(),
      });
      break;
    case 'ComplianceCase':
      thresholds.push({
        ruleKey: 'decision_score',
        minThreshold: 0.3 + Math.random() * 0.1, // Minimum score to trigger automatic escalation
        maxThreshold: 0.95, // Maximum score before mandatory immediate human intervention
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Updated to reflect evolving regulatory requirements and observed patterns in successful case resolutions.',
        status: "PENDING_REVIEW", // Example: needs human approval before activation
      });
      thresholds.push({
        ruleKey: 'time_to_resolution',
        minThreshold: 1, // Cases should not resolve in less than 1 day generally
        maxThreshold: 5 + Math.floor(Math.random() * 3), // Dynamic max based on current compliance team bandwidth and case complexity
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Adjusted to optimize case load distribution and ensure timely resolution, considering AI predictions for case complexity.',
        status: "ACTIVE",
      });
      break;
    case 'ExternalAccount':
      thresholds.push({
        ruleKey: 'risk_score',
        minThreshold: 0.2 + Math.random() * 0.1,
        maxThreshold: 0.85 - Math.random() * 0.05,
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Based on global external account fraud patterns and recent surges in account takeover attempts.',
        status: "ACTIVE",
      });
      break;
    case 'User':
      thresholds.push({
        ruleKey: 'ai_risk_assessment',
        minThreshold: 0.05,
        maxThreshold: 0.6 + Math.random() * 0.1,
        lastUpdated: now,
        sourceAIModel: model,
        reasoning: 'Tailored for user onboarding risk, adapting to new account fraud vectors.',
        status: "ACTIVE",
      });
      break;
  }
  return thresholds;
}

/**
 * Interface for feature flags, allowing dynamic control over application features.
 * Feature flags can be conditionally enabled/disabled based on various factors.
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number; // Percentage of users for whom the feature is enabled (0-100).
  targetAudiences?: string[]; // Specific roles or groups for targeted rollouts.
  enabledByAI?: boolean; // Indicates if this flag's state can be dynamically managed by an AI.
  startDate?: string; // ISO date string when the feature should become active.
  endDate?: string; // ISO date string when the feature should be deactivated.
}

/**
 * Defines various feature flags that can control application behavior dynamically.
 * These flags are crucial for A/B testing, phased rollouts, and emergency kill switches.
 */
export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "GEMINI_AI_FRAUD_PREVENTION",
    enabled: true,
    description: "Enables real-time fraud detection using Gemini AI on all payment orders.",
    rolloutPercentage: 100,
    enabledByAI: false, // Core AI feature, not dynamically enabled by AI itself
  },
  {
    key: "DARK_MODE_THEME",
    enabled: true,
    description: "Allows users to switch to a dark theme for improved accessibility and user preference.",
  },
  {
    key: "ADVANCED_ANALYTICS_DASHBOARD",
    enabled: false,
    description: "Unlocks a new analytics dashboard with advanced reporting capabilities, including AI-driven insights.",
    targetAudiences: ["admin", "analyst", "finance_manager"],
    startDate: moment().subtract(1, 'month').toISOString(),
  },
  {
    key: "DYNAMIC_RULE_ADJUSTMENTS_AI",
    enabled: true,
    description: "Enables Gemini AI to dynamically adjust compliance rule thresholds based on real-time risk data.",
    rolloutPercentage: 75,
    targetAudiences: ["compliance_manager", "super_admin"],
    enabledByAI: true, // AI can determine if it's ready for more users
    startDate: moment().subtract(2, 'weeks').toISOString(),
  },
  {
    key: "MULTI_FACTOR_AUTH_REQUIRED",
    enabled: true,
    description: "Forces all users to enable Multi-Factor Authentication for enhanced security.",
    rolloutPercentage: 100,
  },
  {
    key: "INSTANT_PAYMENTS_ENABLED",
    enabled: false, // Currently in beta
    description: "Allows instant payments via FedNow/Faster Payments for eligible transactions.",
    targetAudiences: ["premium_customers", "beta_users"],
    enabledByAI: false, // Business decision
  },
  {
    key: "NEW_REPORTING_ENGINE",
    enabled: false,
    description: "Activates the new, performant reporting engine with faster data retrieval and custom report building.",
    enabledByAI: true, // AI might decide performance is ready for broader rollout based on system metrics
    startDate: moment().add(1, 'week').toISOString(),
  },
  {
    key: "AI_POWERED_CUSTOMER_SUPPORT_BOT",
    enabled: false,
    description: "Integrates a Gemini AI-powered chatbot into the customer support portal for initial query handling.",
    rolloutPercentage: 10,
    targetAudiences: ["support_agent"], // Internal testing first
    startDate: moment().add(1, 'month').toISOString(),
  },
  {
    key: "REALTIME_TRANSACTION_UPDATES_WEBSOCKET",
    enabled: true,
    description: "Enables real-time updates for transaction statuses via WebSockets on the dashboard.",
    rolloutPercentage: 100,
  },
  {
    key: "CRYPTOCURRENCY_PAYMENTS",
    enabled: false,
    description: "Allows processing of payments using selected cryptocurrencies.",
    targetAudiences: ["pilot_program"],
    startDate: moment().add(3, 'months').toISOString(),
  },
];

/**
 * Utility function to check if a feature is enabled for the current context.
 * This function considers the flag's state, rollout percentage, target audience, and dates.
 *
 * @param key The unique key of the feature flag.
 * @param userId (Optional) The ID of the current user, used for consistent rollout percentage checks.
 * @param roles (Optional) An array of roles assigned to the current user, used for audience targeting.
 * @returns True if the feature is enabled for the current context, false otherwise.
 */
export function isFeatureEnabled(
  key: string,
  userId?: string,
  roles?: string[]
): boolean {
  const flag = FEATURE_FLAGS.find((f) => f.key === key);
  if (!flag) {
    return false; // Feature not defined or recognized
  }
  if (!flag.enabled) {
    return false; // Explicitly disabled
  }

  const now = moment();
  if (flag.startDate && now.isBefore(moment(flag.startDate))) {
    return false; // Feature not yet active
  }
  if (flag.endDate && now.isAfter(moment(flag.endDate))) {
    return false; // Feature has expired
  }

  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    // A simple, deterministic hashing mechanism for rollout percentage.
    // In a real system, a more robust A/B testing or feature flag service would be used.
    const uniqueIdentifier = userId || "anonymous-user";
    let hash = 0;
    for (let i = 0; i < uniqueIdentifier.length; i++) {
      hash = uniqueIdentifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const userRolloutValue = Math.abs(hash) % 100; // Value between 0-99
    if (userRolloutValue >= flag.rolloutPercentage) {
      return false; // User not in the enabled percentage
    }
  }

  if (flag.targetAudiences && roles) {
    const isTargeted = flag.targetAudiences.some(targetRole => roles.includes(targetRole));
    if (!isTargeted) {
      return false; // User does not have a target role
    }
  } else if (flag.targetAudiences && !roles) {
    // If target audiences are defined but no roles are provided, it implies not enabled for current context.
    return false;
  }

  return true; // Feature is enabled under the given conditions
}

/**
 * Standard HTTP headers and their common values or purposes.
 * Useful for building API requests, configuring proxies, or parsing responses.
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: "Authorization", // For authentication credentials
  CONTENT_TYPE: "Content-Type", // Media type of the resource
  ACCEPT: "Accept", // Media types that are acceptable for the response
  X_REQUEST_ID: "X-Request-ID", // Unique request identifier for tracing
  X_API_KEY: "X-API-Key", // API key for direct API access
  CACHE_CONTROL: "Cache-Control", // Caching mechanisms in requests and responses
  PRAGMA: "Pragma", // Backward-compatible caching header
  EXPIRES: "Expires", // Date/time after which the response is considered stale
  USER_AGENT: "User-Agent", // User agent string of the client
  REFERER: "Referer", // Address of the previous web page from which a link was followed
  X_GEMINI_AI_SESSION: "X-Gemini-AI-Session-ID", // AI-specific header for session tracing
  ETAG: "ETag", // Entity tag for specific version of a resource
  IF_NONE_MATCH: "If-None-Match", // Conditional GET for caching
  LOCATION: "Location", // URL of a redirected resource
  RETRY_AFTER: "Retry-After", // Amount of time after which to retry
};

/**
 * Common content types for HTTP requests/responses.
 * Essential for correctly parsing and generating HTTP payloads.
 */
export const HTTP_CONTENT_TYPES = {
  JSON: "application/json",
  FORM_URL_ENCODED: "application/x-www-form-urlencoded",
  MULTIPART_FORM_DATA: "multipart/form-data",
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
  APPLICATION_XML: "application/xml",
  OCTET_STREAM: "application/octet-stream", // For arbitrary binary data
  CSV: "text/csv", // For comma-separated values
  PDF: "application/pdf", // For PDF documents
};

/**
 * Regular expression patterns for common data validations.
 * Centralizing these patterns promotes consistency and reusability.
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, // Basic URL validation
  ALPHA_NUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]*$/,
  NUMERIC_ONLY: /^\d+$/,
  IP_ADDRESS_V4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  PHONE_NUMBER_US: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, // Basic US phone number
  ZIP_CODE_US: /^\d{5}(?:[-\s]\d{4})?$/, // US ZIP code
};

/**
 * Currency codes and their display names, symbols, and potential AI-driven risk factors.
 * The AI risk factor could indicate volatility, sanctions risk, or other financial health indicators.
 */
export const CURRENCY_MAPPINGS: Record<string, { name: string; symbol: string; ai_risk_factor?: number; description?: string }> = {
  USD: { name: "United States Dollar", symbol: "$", ai_risk_factor: 0.1, description: "The primary global reserve currency." },
  EUR: { name: "Euro", symbol: "€", ai_risk_factor: 0.08, description: "Currency of the Eurozone member states." },
  GBP: { name: "British Pound Sterling", symbol: "£", ai_risk_factor: 0.07, description: "The official currency of the United Kingdom." },
  JPY: { name: "Japanese Yen", symbol: "¥", ai_risk_factor: 0.05, description: "The official currency of Japan." },
  CAD: { name: "Canadian Dollar", symbol: "C$", ai_risk_factor: 0.09, description: "The official currency of Canada." },
  AUD: { name: "Australian Dollar", symbol: "A$", ai_risk_factor: 0.11, description: "The official currency of Australia." },
  CHF: { name: "Swiss Franc", symbol: "CHF", ai_risk_factor: 0.04, description: "A strong, stable currency often considered a safe haven." },
  CNY: { name: "Chinese Yuan", symbol: "¥", ai_risk_factor: 0.15, description: "The official currency of the People's Republic of China." },
  INR: { name: "Indian Rupee", symbol: "₹", ai_risk_factor: 0.18, description: "The official currency of India." },
  BRL: { name: "Brazilian Real", symbol: "R$", ai_risk_factor: 0.25, description: "The official currency of Brazil, prone to volatility." },
  SGD: { name: "Singapore Dollar", symbol: "S$", ai_risk_factor: 0.06, description: "The official currency of Singapore, known for stability." },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$", ai_risk_factor: 0.12, description: "The official currency of New Zealand." },
  MXN: { name: "Mexican Peso", symbol: "Mex$", ai_risk_factor: 0.22, description: "The official currency of Mexico." },
  ZAR: { name: "South African Rand", symbol: "R", ai_risk_factor: 0.30, description: "The official currency of South Africa, often volatile." },
  RUB: { name: "Russian Ruble", symbol: "₽", ai_risk_factor: 0.40, description: "The official currency of Russia, currently subject to sanctions risk." }, // High risk example
  AED: { name: "United Arab Emirates Dirham", symbol: "د.إ", ai_risk_factor: 0.07, description: "The official currency of the UAE." },
  SAR: { name: "Saudi Riyal", symbol: "﷼", ai_risk_factor: 0.09, description: "The official currency of Saudi Arabia." },
  NGN: { name: "Nigerian Naira", symbol: "₦", ai_risk_factor: 0.45, description: "The official currency of Nigeria, facing significant inflation." }, // Another high risk example
  KRW: { name: "South Korean Won", symbol: "₩", ai_risk_factor: 0.06, description: "The official currency of South Korea." },
};

export const CURRENCY_OPTIONS: SelectOption[] = Object.entries(CURRENCY_MAPPINGS).map(([code, data]) => ({
  value: code,
  label: `${data.name} (${data.symbol})`,
  tooltip: data.ai_risk_factor ? `AI Risk Factor: ${data.ai_risk_factor.toFixed(2)} - ${data.description}` : data.description,
  metadata: { aiRisk: data.ai_risk_factor },
}));

/**
 * Interface for API endpoint definitions, centralizing their configuration.
 * This structure helps in API client generation, routing, and access control.
 */
export interface ApiEndpoint {
  path: string; // The URL path for the endpoint.
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"; // HTTP method.
  description: string; // A brief description of the endpoint's purpose.
  authenticationRequired: boolean; // True if an authentication token is required.
  rateLimitCategory?: string; // Optional category for applying specific rate limits (e.g., "read", "write", "ai_compute").
  aiMonitor?: boolean; // Indicates if this endpoint's usage should be monitored by Gemini AI for anomalies.
  permissions?: string[]; // Required permissions for this endpoint (e.g., ["payment_order:create"]).
  tags?: string[]; // Categorization tags for the endpoint (e.g., ["payments", "compliance"]).
}

/**
 * Centralized API endpoint definitions for a robust system.
 * This object serves as a single source of truth for all API endpoints,
 * facilitating documentation, client generation, and consistent usage.
 */
export const API_ENDPOINTS: Record<string, ApiEndpoint> = {
  GET_PAYMENT_ORDERS: {
    path: "/api/v1/payment_orders",
    method: "GET",
    description: "Retrieve a list of payment orders, optionally filtered.",
    authenticationRequired: true,
    rateLimitCategory: "read",
    aiMonitor: true,
    permissions: ["payment_order:read"],
    tags: ["payments", "read"],
  },
  CREATE_PAYMENT_ORDER: {
    path: "/api/v1/payment_orders",
    method: "POST",
    description: "Create a new payment order with specified details.",
    authenticationRequired: true,
    rateLimitCategory: "write",
    aiMonitor: true,
    permissions: ["payment_order:create", "payment_order:manage"],
    tags: ["payments", "write"],
  },
  GET_EXTERNAL_ACCOUNTS: {
    path: "/api/v1/external_accounts",
    method: "GET",
    description: "Retrieve external accounts associated with the organization.",
    authenticationRequired: true,
    rateLimitCategory: "read",
    permissions: ["external_accounts:read"],
    tags: ["accounts", "read"],
  },
  ANALYZE_TRANSACTION_AI: {
    path: "/api/v1/ai/analyze_transaction",
    method: "POST",
    description: "Submit transaction data for Gemini AI fraud and anomaly detection, receiving real-time insights.",
    authenticationRequired: true,
    rateLimitCategory: "ai_compute",
    aiMonitor: false, // This is an AI endpoint itself, internal AI monitoring might apply, but not external
    permissions: ["ai:analyze_data"],
    tags: ["ai", "compliance", "fraud"],
  },
  GET_COMPLIANCE_CASES: {
    path: "/api/v1/compliance/cases",
    method: "GET",
    description: "Retrieve compliance cases based on various criteria.",
    authenticationRequired: true,
    rateLimitCategory: "read",
    aiMonitor: true,
    permissions: ["compliance:read"],
    tags: ["compliance", "read"],
  },
  UPDATE_COMPLIANCE_CASE_AI_OVERRIDE: {
    path: "/api/v1/compliance/cases/:id/ai_override",
    method: "PATCH",
    description: "Override an AI-generated decision for a specific compliance case, requiring high-level permissions.",
    authenticationRequired: true,
    rateLimitCategory: "write",
    aiMonitor: true,
    permissions: ["compliance:ai_override"],
    tags: ["compliance", "ai", "write"],
  },
  UPLOAD_DOCUMENT: {
    path: "/api/v1/documents",
    method: "POST",
    description: "Upload a document for processing, potentially with AI-driven categorization.",
    authenticationRequired: true,
    rateLimitCategory: "write",
    aiMonitor: true,
    permissions: ["document:create"],
    tags: ["documents"],
  },
  GET_USER_PROFILE: {
    path: "/api/v1/users/:id",
    method: "GET",
    description: "Retrieve a specific user's profile information.",
    authenticationRequired: true,
    rateLimitCategory: "read",
    permissions: ["user:read"],
    tags: ["users"],
  },
  UPDATE_USER_SETTINGS: {
    path: "/api/v1/users/:id/settings",
    method: "PATCH",
    description: "Update a specific user's personalized settings.",
    authenticationRequired: true,
    rateLimitCategory: "write",
    permissions: ["user:update"],
    tags: ["users"],
  },
};

/**
 * Interface for a general notification configuration.
 * Defines the parameters for setting up and managing system notifications.
 */
export interface NotificationConfig {
  id: string; // Unique identifier for the notification configuration.
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in-app' | 'slack' | 'microsoft_teams'; // Channel for the notification.
  eventTriggers: string[]; // List of event names (from AUDIT_RECORD_EVENT_NAME_SUGGESTION_MAPPING) that trigger this notification.
  recipients?: string[]; // Target recipients (email addresses, phone numbers, user IDs, channel names).
  webhookUrl?: string; // URL for webhook notifications.
  active: boolean; // Whether the notification configuration is currently active.
  priority: 'low' | 'medium' | 'high' | 'critical'; // Importance level of the notification.
  aiSuggested?: boolean; // Whether this notification rule was recommended or optimized by an AI.
  templateId?: string; // Optional ID for a specific notification template.
  coolDownMinutes?: number; // Minimum time in minutes between repeat notifications for the same trigger.
}

/**
 * Pre-defined notification templates or configurations for common system events.
 * These serve as starting points for notification setup and ensure consistency.
 */
export const DEFAULT_NOTIFICATION_CONFIGS: NotificationConfig[] = [
  {
    id: "payment_failure_email",
    type: "email",
    eventTriggers: ["payment_order.failed", "return.failed", "reversal.failed"],
    recipients: ["finance_team@example.com", "operations@example.com"],
    active: true,
    priority: "critical",
    templateId: "PAYMENT_FAILED_ALERT",
    coolDownMinutes: 15,
  },
  {
    id: "compliance_escalation_sms",
    type: "sms",
    eventTriggers: ["compliance.case_escalated", "compliance.ai_flagged_critical"], // Added AI trigger
    recipients: ["+15551234567", "+15557654321"],
    active: true,
    priority: "high",
    aiSuggested: true, // Example of AI influence in rule creation
    templateId: "COMPLIANCE_ESCALATION_SMS",
    coolDownMinutes: 30,
  },
  {
    id: "new_counterparty_in_app",
    type: "in-app",
    eventTriggers: ["counterparty.create", "counterparty.update"],
    active: true,
    priority: "low",
    templateId: "NEW_COUNTERPARTY_ALERT",
    coolDownMinutes: 60,
  },
  {
    id: "system_health_webhook",
    type: "webhook",
    eventTriggers: ["system.health_check.failure", "system.maintenance_start"],
    webhookUrl: "https://monitoring.example.com/alerts/system-health",
    active: true,
    priority: "critical",
    aiSuggested: false,
    coolDownMinutes: 5,
  },
  {
    id: "ai_model_performance_slack",
    type: "slack",
    eventTriggers: ["ai:model_performance_degraded", "ai:model_anomaly_detected"], // AI-specific events
    recipients: ["#ai-ops-alerts"], // Slack channel
    active: true,
    priority: "high",
    aiSuggested: true,
    templateId: "AI_OPS_PERF_ALERT",
    coolDownMinutes: 10,
  },
  {
    id: "new_user_login_activity",
    type: "email",
    eventTriggers: ["user.login"],
    recipients: ["security_team@example.com"],
    active: true,
    priority: "medium",
    templateId: "USER_LOGIN_NOTIFICATION",
    coolDownMinutes: 120, // Avoid spamming for frequent logins
  },
];

export const NOTIFICATION_PRIORITY_OPTIONS = makeOptionsFromObject({
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
});

export const NOTIFICATION_TYPE_OPTIONS = makeOptionsFromObject({
  email: "Email",
  sms: "SMS",
  push: "Push Notification",
  webhook: "Webhook",
  "in-app": "In-App Notification",
  slack: "Slack Message", // Added
  microsoft_teams: "Microsoft Teams Message", // Added
});


export * from "../../common/constants"; // Existing export, must not be changed.
```