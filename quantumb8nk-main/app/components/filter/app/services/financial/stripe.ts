// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file This file provides a comprehensive client-side API layer for interacting with the
 *       citibankdemobusiness.dev backend's Stripe integration. It manages customer data,
 *       subscriptions, payments, and webhooks with extensive data models and robust error handling.
 *       All interactions are simulated to target the backend API endpoints at
 *       citibankdemobusiness.dev/api/stripe.
 */

/**
 * The base path for all Stripe-related API routes on the citibankdemobusiness.dev backend.
 */
const STRIPE_API_BASE_PATH = "/api/stripe";

/**
 * Represents a generic successful API response structure.
 * @template T The type of the data returned by the API.
 */
export type StripeApiResponse<T> = {
  /** Indicates if the operation was successful. */
  success: true;
  /** The actual data payload from the API. */
  data: T;
  /** Optional message providing more context about the operation. */
  message?: string;
};

/**
 * Represents a generic error object returned by the API.
 */
export type StripeApiError = {
  /** The unique error code for this specific error, e.g., "customer_not_found", "invalid_payment_method". */
  code: string;
  /** A human-readable message describing the error. */
  message: string;
  /** Optional, additional details about the error, often a developer-facing message. */
  detail?: string;
  /** Optional, HTTP status code associated with the error. */
  statusCode?: number;
};

/**
 * Represents a generic error response structure.
 */
export type StripeApiErrorResponse = {
  /** Indicates if the operation was successful. Always false for an error response. */
  success: false;
  /** The error object containing details about the failure. */
  error: StripeApiError;
};

/**
 * A union type representing the possible outcomes of any Stripe API operation:
 * either a successful response or an error response.
 * @template T The type of the data expected on a successful response.
 */
export type StripeOperationResult<T> = StripeApiResponse<T> | StripeApiErrorResponse;

/**
 * Represents a dictionary for arbitrary metadata associated with Stripe objects.
 * This can be used to store custom key-value pairs that are not directly supported by Stripe.
 */
export type StripeMetadata = Record<string, string>;

/**
 * Represents a geographic address structure, commonly used for billing or shipping information.
 */
export type StripeAddress = {
  /** City, district, suburb, town, or village. */
  city?: string | null;
  /** Two-letter country code (ISO 3166-1 alpha-2). */
  country?: string | null;
  /** Address line 1 (e.g., street, PO Box, or company name). */
  line1?: string | null;
  /** Address line 2 (e.g., apartment, suite, unit, or building). */
  line2?: string | null;
  /** ZIP or postal code. */
  postal_code?: string | null;
  /** State, county, province, or region. */
  state?: string | null;
};

/**
 * Details about a customer's shipping address and name.
 */
export type StripeShipping = {
  /** Customer's shipping address. */
  address?: StripeAddress | null;
  /** Customer's full name. */
  name?: string | null;
  /** Customer's phone number. */
  phone?: string | null;
};

/**
 * Details about a payment method's card.
 */
export type StripeCardDetails = {
  /** The brand of the card (e.g., "visa", "mastercard", "amex"). */
  brand: string;
  /** Two-letter ISO code representing the country of the card. */
  country?: string | null;
  /** The expiration month of the card (1-12). */
  exp_month: number;
  /** The expiration year of the card (e.g., 2025). */
  exp_year: number;
  /** The last four digits of the card number. */
  last4: string;
  /** The card funding type. Can be "credit", "debit", "prepaid", or "unknown". */
  funding?: "credit" | "debit" | "prepaid" | "unknown" | null;
  /** The card network that issued the card. */
  network?: string | null;
};

/**
 * Details about a payment method's bank account (e.g., for ACH or SEPA Direct Debit).
 */
export type StripeBankAccountDetails = {
  /** The bank name. */
  bank_name?: string | null;
  /** Two-letter ISO code representing the country of the bank account. */
  country?: string | null;
  /** The currency of the bank account. */
  currency?: string | null;
  /** The last four digits of the bank account number. */
  last4: string;
  /** The routing number of the bank account (for US accounts). */
  routing_number?: string | null;
  /** The account holder type. Can be "company" or "individual". */
  account_holder_type?: 'company' | 'individual' | null;
  /** The account holder name. */
  account_holder_name?: string | null;
};

/**
 * Represents a Stripe Payment Method object.
 */
export type StripePaymentMethod = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "payment_method". */
  object: "payment_method";
  /** The type of the PaymentMethod. Can be "card", "bank_account", "us_bank_account", "sepa_debit", etc. */
  type: "card" | "bank_account" | "us_bank_account" | "sepa_debit" | string;
  /** Billing information associated with the PaymentMethod. */
  billing_details: {
    /** Customer's email address. */
    email?: string | null;
    /** Customer's name. */
    name?: string | null;
    /** Billing address. */
    address?: StripeAddress | null;
    /** Customer's phone number. */
    phone?: string | null;
  };
  /** If this is a card PaymentMethod, this hash contains card details. */
  card?: StripeCardDetails | null;
  /** If this is a bank_account PaymentMethod, this hash contains bank account details. */
  bank_account?: StripeBankAccountDetails | null;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** The ID of the Customer to which this PaymentMethod is attached. */
  customer?: string | null;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
};

/**
 * Represents a Stripe Customer object.
 */
export type StripeCustomer = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "customer". */
  object: "customer";
  /** The customer's address. */
  address?: StripeAddress | null;
  /** Current balance, if any, for the customer's account, in cents. */
  balance: number;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency?: string | null;
  /** The customer's preferred PaymentMethod ID for subscriptions and invoices. */
  invoice_settings?: {
    /** ID of the default payment method to be used for invoices and subscriptions for the customer. */
    default_payment_method?: string | null;
  };
  /** An arbitrary string attached to the object, e.g., "Customer for ACME Corp". */
  description?: string | null;
  /** The customer's email address. */
  email?: string | null;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The customer's full name or business name. */
  name?: string | null;
  /** The customer's phone number. */
  phone?: string | null;
  /** The customer's shipping information. */
  shipping?: StripeShipping | null;
  /** The customer's tax IDs. */
  tax_ids?: Array<{ type: string; value: string; verification?: { status: string } }> | null;
  /** The customer's preferred language for Stripe communications. */
  preferred_locales?: string[];
  /** Tax exempt status of the customer. */
  tax_exempt?: "none" | "exempt" | "reverse" | null;
};

/**
 * Represents a Stripe Product object. Products are descriptions of the goods or services you offer.
 */
export type StripeProduct = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "product". */
  object: "product";
  /** Whether the product is available for purchase. */
  active: boolean;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** An arbitrary string attached to the object, e.g., "Monthly subscription for premium features". */
  description?: string | null;
  /** A list of up to 8 URLs of images for this product, meant to be displayable to the customer. */
  images: string[];
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The product's name, meant to be displayable to the customer. */
  name: string;
  /** The ID of the Price object that is default for this product. */
  default_price?: string | StripePrice | null;
  /** A short description of the product used to differentiate it from other products. */
  statement_descriptor?: string | null;
  /** A tax code ID for the product. */
  tax_code?: string | null;
  /** The type of the product. */
  type: "service" | "good";
  /** Time at which the object was last updated. Measured in seconds since the Unix epoch. */
  updated: number;
  /** A URL of the product to go to for more information. */
  url?: string | null;
};

/**
 * Represents the interval and count for a recurring price.
 */
export type StripePriceRecurring = {
  /** The frequency at which a subscription is billed. */
  interval: "day" | "week" | "month" | "year";
  /** The number of intervals between subscription billings. For example, `interval=month` and `interval_count=3` bills every three months. */
  interval_count: number;
  /** Specifies a usage-based billing model. Can be `licensed` (fixed price) or `metered` (pay-as-you-go). */
  usage_type: "licensed" | "metered";
  /** Default behavior for how Stripe should handle prorations. */
  aggregate_usage?: "last_ever" | "last_month" | "last_week" | "max" | null;
  /** Configuration for tiered prices. */
  tiers_mode?: "graduated" | "volume" | null;
};

/**
 * Represents a Stripe Price object. Prices define how much and how often to charge for a product.
 */
export type StripePrice = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "price". */
  object: "price";
  /** Whether the price can be used for new purchases. */
  active: boolean;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The ID of the product this price is associated with. */
  product: string | StripeProduct;
  /** The recurring scheme for the price. */
  recurring?: StripePriceRecurring | null;
  /** The unit amount in cents (or 0 if a custom quantity is specified). */
  unit_amount?: number | null;
  /** A brief description of the price. */
  nickname?: string | null;
  /** Specifies whether the price is one-time or recurring. */
  type: "one_time" | "recurring";
  /** The unit amount decimal. */
  unit_amount_decimal?: string | null;
  /** Specifies whether this price is a default price for the product. */
  billing_scheme?: "per_unit" | "tiered";
  /** Prices are in a small currency unit. */
  transform_quantity?: {
    divide_by: number;
    round: "up" | "down";
  } | null;
};

/**
 * Represents a Stripe Subscription Item object, which is a component of a subscription.
 */
export type StripeSubscriptionItem = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "subscription_item". */
  object: "subscription_item";
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The price the customer is subscribed to. */
  price: StripePrice;
  /** The quantity of the subscription item. */
  quantity: number;
  /** The ID of the subscription this item belongs to. */
  subscription: string;
  /** The tax rates for this subscription item. */
  tax_rates?: Array<{
    id: string;
    description: string;
    percentage: number;
    inclusive: boolean;
  }> | null; // Simplified tax rate object
};

/**
 * Represents a Stripe Subscription object, detailing a customer's recurring payment agreement.
 */
export type StripeSubscription = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "subscription". */
  object: "subscription";
  /** A non-negative decimal (with at most four decimal places) representing the amount of tax that will be applied to invoices created during this subscription. */
  application_fee_percent?: number | null;
  /** Determines if the subscription will be canceled at the end of the current period. */
  cancel_at_period_end: boolean;
  /** If the subscription has been canceled, the date of that cancellation. */
  canceled_at?: number | null;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** End of the current period that the subscription has been invoiced for. */
  current_period_end: number;
  /** Start of the current period that the subscription has been invoiced for. */
  current_period_start: number;
  /** The customer who owns the subscription. Can be a customer ID or a full customer object. */
  customer: string | StripeCustomer;
  /** The date when the subscription was first created. */
  start_date: number;
  /** A list of prices, quantities, and other properties of the subscription. */
  items: {
    object: "list";
    data: StripeSubscriptionItem[];
    has_more: boolean;
    url: string;
  };
  /** The most recent invoice for the subscription. */
  latest_invoice?: string | StripeInvoice | null;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** Payment method details collected during checkout. */
  payment_settings?: {
    payment_method_options?: Record<string, unknown> | null;
    payment_method_types?: string[] | null;
    save_default_payment_method?: "off_session" | "on_session" | null;
  };
  /** The quantity of the subscription item, if only one item is present. */
  quantity: number;
  /** Possible values are `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired`, `paused`. */
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  /** If the subscription has a trial, the end of that trial. */
  trial_end?: number | null;
  /** If the subscription has a trial, the start of that trial. */
  trial_start?: number | null;
  /** Timestamp that determines when the next invoice will be generated. */
  billing_cycle_anchor: number;
  /** Timestamp when the subscription was scheduled to cancel, if applicable. */
  cancel_at?: number | null;
  /** Timestamp when the subscription actually ended, if applicable. */
  ended_at?: number | null;
  /** Determines how to handle prorations when an item's quantity or price changes. */
  proration_behavior?: "always_invoice" | "create_prorations" | "none" | null;
  /** ID of the default payment method for this subscription. */
  default_payment_method?: string | StripePaymentMethod | null;
  /** The ID of the collection method for this subscription. */
  collection_method: "charge_automatically" | "send_invoice";
  /** The discount applied to the subscription. */
  discount?: Record<string, unknown> | null; // Simplified discount object
  /** The schedule for the subscription. */
  schedule?: string | null;
};

/**
 * Represents a single line item within an invoice.
 */
export type StripeInvoiceLineItem = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "line_item". */
  object: "line_item";
  /** The amount, in cents, of the line item. */
  amount: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** An arbitrary string attached to the object, e.g., "Monthly service fee". */
  description?: string | null;
  /** Period during which the amount was charged. */
  period: {
    /** The end of the period. */
    end: number;
    /** The start of the period. */
    start: number;
  };
  /** The price ID for this line item. */
  price?: StripePrice | null;
  /** The quantity of the price. */
  quantity?: number | null;
  /** The ID of the subscription item that generated this invoice line item. */
  subscription_item?: string | null;
  /** The type of the invoice line item. */
  type: "invoiceitem" | "subscription";
  /** Tax amounts for this line item. */
  tax_amounts?: Array<{ amount: number; inclusive: boolean; tax_rate?: string | null }> | null;
  /** Tax rates for this line item. */
  tax_rates?: Array<unknown> | null; // Simplified tax rate object
};

/**
 * Represents a Stripe Invoice object, which is a bill sent to a customer.
 */
export type StripeInvoice = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "invoice". */
  object: "invoice";
  /** The amount, in cents, that was paid. */
  amount_paid: number;
  /** The amount, in cents, that is still due. */
  amount_due: number;
  /** The amount, in cents, that was forgiven. */
  amount_remaining: number;
  /** The ID of the charge created for this invoice. */
  charge?: string | StripeCharge | null;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** The customer who is liable for this invoice. Can be a customer ID or a full customer object. */
  customer: string | StripeCustomer;
  /** The date the invoice is due, if it is a recurring invoice. */
  due_date?: number | null;
  /** The URL of the hosted invoice page, which customers can view and pay. */
  hosted_invoice_url?: string | null;
  /** The URL for the invoice PDF. */
  invoice_pdf?: string | null;
  /** The collection method for this invoice. */
  collection_method: "charge_automatically" | "send_invoice";
  /** The individual line items that make up the invoice. */
  lines: {
    object: "list";
    data: StripeInvoiceLineItem[];
    has_more: boolean;
    url: string;
  };
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** Whether payment was successfully received for this invoice. */
  paid: boolean;
  /** The ID of the payment intent associated with this invoice. */
  payment_intent?: string | null;
  /** The status of the invoice. */
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  /** The ID of the subscription that this invoice was for. */
  subscription?: string | StripeSubscription | null;
  /** Total of all subscriptions and invoice items before discounts and taxes. */
  subtotal: number;
  /** The total amount due, in cents. */
  total: number;
  /** Tax amount for the invoice. */
  tax?: number | null;
  /** Tax rates for this invoice. */
  tax_rates?: Array<unknown> | null; // Simplified
  /** The time at which the invoice was voided. */
  voided_at?: number | null;
  /** A unique, friendly identifier for the invoice. */
  number?: string | null;
  /** ID of the mandate associated with this invoice, if any. */
  mandate?: string | null;
  /** The customer's address for the invoice. */
  customer_address?: StripeAddress | null;
  /** The customer's email for the invoice. */
  customer_email?: string | null;
  /** The customer's name for the invoice. */
  customer_name?: string | null;
  /** The customer's phone number for the invoice. */
  customer_phone?: string | null;
  /** The customer's shipping address for the invoice. */
  customer_shipping?: StripeShipping | null;
};

/**
 * Represents a Stripe Charge object, detailing a specific financial transaction.
 */
export type StripeCharge = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "charge". */
  object: "charge";
  /** Amount charged in cents. */
  amount: number;
  /** Amount in cents refunded (can be less than the amount property on the charge if a partial refund was issued). */
  amount_refunded: number;
  /** Whether the charge was captured. */
  captured: boolean;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** The customer associated with this charge. Can be a customer ID or a full customer object. */
  customer?: string | StripeCustomer | null;
  /** An arbitrary string attached to the object, e.g., "Charge for premium subscription". */
  description?: string | null;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The ID of the PaymentMethod used in this charge. */
  payment_method?: string | StripePaymentMethod | null;
  /** This is the email address that the receipt for this charge was sent to. */
  receipt_email?: string | null;
  /** This is the URL to the receipt page for this charge. */
  receipt_url?: string | null;
  /** If the charge was funded by a refund, this is the ID of the refund. */
  refunded: boolean;
  /** A list of refunds that have been applied to the charge. */
  refunds?: {
    object: "list";
    data: Array<{
      id: string;
      amount: number;
      currency: string;
      reason?: string | null;
    }>; // Simplified refund object
    has_more: boolean;
    url: string;
  };
  /** Shipping information for the charge. */
  shipping?: StripeShipping | null;
  /** The status of the charge. */
  status: "succeeded" | "pending" | "failed";
  /** The ID of the transfer generated in payment flow. */
  transfer?: string | null;
  /** The statement descriptor for the charge. */
  statement_descriptor?: string | null;
  /** The statement descriptor suffix for the charge. */
  statement_descriptor_suffix?: string | null;
};

/**
 * Represents a Stripe Checkout Session object.
 * Used for hosted checkout flows, allowing customers to pay with various methods.
 */
export type StripeCheckoutSession = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "checkout.session". */
  object: "checkout.session";
  /** The ID of the customer for this session. */
  customer?: string | StripeCustomer | null;
  /** The customer's email address. */
  customer_email?: string | null;
  /** The mode of the Checkout Session. */
  mode: "payment" | "setup" | "subscription";
  /** The ID of the PaymentIntent created if `mode` is `payment`. */
  payment_intent?: string | null; // Represents a PaymentIntent
  /** The ID of the Subscription created if `mode` is `subscription`. */
  subscription?: string | StripeSubscription | null;
  /** The status of the PaymentIntent or the SetupIntent after the Checkout Session completes. */
  payment_status: "paid" | "unpaid" | "no_payment_required";
  /** The URL to the Checkout Session. This is the URL the customer should be redirected to. */
  url?: string | null;
  /** The status of the Checkout Session. */
  status?: "open" | "complete" | "expired" | null;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** The URL the customer is redirected to after they cancel checkout. */
  cancel_url: string;
  /** The URL the customer is redirected to after they successfully complete checkout. */
  success_url: string;
  /** The currency collected by the session. */
  currency?: string | null;
  /** Line items for the checkout session. */
  line_items?: {
    object: "list";
    data: Array<{
      id: string;
      description?: string;
      amount_total: number;
      currency: string;
      quantity: number;
      price?: StripePrice | null;
    }>;
  };
};

/**
 * Represents a Stripe Webhook Event object.
 * This is the structure of events sent from Stripe to a webhook endpoint.
 * On the client-side, we might process a simulated version or notifications derived from these.
 */
export type StripeWebhookEvent = {
  /** Unique identifier for the object. */
  id: string;
  /** String representing the object's type. Value is "event". */
  object: "event";
  /** The API version at which the event data was rendered. */
  api_version?: string | null;
  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created: number;
  /** Information about the event, including the object at the time of the event. */
  data: {
    /** Object at the time of the event. Can be any Stripe object (Customer, Charge, etc.) */
    object: Record<string, unknown>;
    /** Object at the time of the event, with changes highlighted. */
    previous_attributes?: Record<string, unknown>;
  };
  /** Has the value `true` if the object exists in live mode or `false` if it exists in test mode. */
  livemode: boolean;
  /** Number of webhooks that have yet to be delivered successfully. */
  pending_webhooks: number;
  /** Information about the request that triggered this event. */
  request?: {
    /** ID of the request that caused the event. */
    id?: string | null;
    /** The idempotency key of the request that caused the event. */
    idempotency_key?: string | null;
  } | null;
  /** Description of the event (e.g., "customer.created", "invoice.payment_succeeded", "charge.succeeded"). */
  type: string;
};

/**
 * Common options for listing API resources, providing pagination and filtering capabilities.
 */
export type ListOptions = {
  /** A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 10. */
  limit?: number;
  /** A cursor for use in pagination. `starting_after` is an object ID that defines your place in the list. */
  starting_after?: string;
  /** A cursor for use in pagination. `ending_before` is an object ID that defines your place in the list. */
  ending_before?: string;
  /** A filter to retrieve objects created after this timestamp (Unix epoch). */
  created_gte?: number;
  /** A filter to retrieve objects created before this timestamp (Unix epoch). */
  created_lte?: number;
  /** An array of object IDs to include in the response. */
  ids?: string[];
  /** Search query for full-text search across relevant fields. */
  search?: string;
  /** Whether to expand specific fields to their full object representation. */
  expand?: string[];
};

/**
 * Generic response structure for list operations, including pagination details.
 * @template T The type of the items in the list.
 */
export type ListResponse<T> = {
  /** String representing the object's type. Value is "list". */
  object: "list";
  /** An array containing the actual data items. */
  data: T[];
  /** True if there are more items to retrieve, false otherwise. */
  has_more: boolean;
  /** The URL to retrieve the current list. */
  url: string;
};

// --- Request Payloads ---

/** Payload for creating a new Stripe Customer. */
export type CreateCustomerPayload = {
  /** The customer's full name or business name. */
  name?: string;
  /** The customer's email address. */
  email?: string;
  /** An arbitrary string attached to the object, e.g., "New user from website signup". */
  description?: string;
  /** The customer's phone number. */
  phone?: string;
  /** The customer's address. */
  address?: StripeAddress;
  /** Shipping information for this customer. */
  shipping?: StripeShipping;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata;
  /** The ID of a PaymentMethod to attach to the customer as their default. */
  payment_method?: string;
  /** The currency to use for the customer. */
  currency?: string;
  /** The customer's preferred language for Stripe communications. */
  preferred_locales?: string[];
  /** Tax exempt status of the customer. */
  tax_exempt?: "none" | "exempt" | "reverse";
};

/** Payload for updating an existing Stripe Customer. */
export type UpdateCustomerPayload = {
  /** The customer's full name or business name. */
  name?: string | null;
  /** The customer's email address. */
  email?: string | null;
  /** An arbitrary string attached to the object. */
  description?: string | null;
  /** The customer's phone number. */
  phone?: string | null;
  /** The customer's address. */
  address?: StripeAddress | null;
  /** Shipping information for this customer. */
  shipping?: StripeShipping | null;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** Invoice settings for the customer, including default payment method. */
  invoice_settings?: {
    default_payment_method?: string | null;
  };
  /** The customer's preferred language for Stripe communications. */
  preferred_locales?: string[] | null;
  /** Tax exempt status of the customer. */
  tax_exempt?: "none" | "exempt" | "reverse" | null;
};

/** Payload for creating a new Stripe Product. */
export type CreateProductPayload = {
  /** The product's name, meant to be displayable to the customer. */
  name: string;
  /** An arbitrary string attached to the object. */
  description?: string;
  /** A list of up to 8 URLs of images for this product. */
  images?: string[];
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata;
  /** Whether the product is available for purchase. */
  active?: boolean;
  /** The type of the product. */
  type?: "service" | "good";
  /** A short description of the product used to differentiate it. */
  statement_descriptor?: string;
  /** A URL of the product to go to for more information. */
  url?: string;
};

/** Payload for updating an existing Stripe Product. */
export type UpdateProductPayload = {
  /** The product's name. */
  name?: string;
  /** An arbitrary string attached to the object. */
  description?: string | null;
  /** A list of up to 8 URLs of images for this product. */
  images?: string[] | null;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** Whether the product is available for purchase. */
  active?: boolean;
  /** The type of the product. */
  type?: "service" | "good";
  /** A short description of the product used to differentiate it. */
  statement_descriptor?: string | null;
  /** A URL of the product to go to for more information. */
  url?: string | null;
  /** The ID of the Price object that is default for this product. */
  default_price?: string | null;
};

/** Payload for creating a new Stripe Price. */
export type CreatePricePayload = {
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** The ID of the product this price is associated with. */
  product: string;
  /** The unit amount in cents to be charged. */
  unit_amount?: number;
  /** The unit amount in decimal to be charged. */
  unit_amount_decimal?: string;
  /** The recurring scheme for the price. */
  recurring?: {
    /** The frequency at which a subscription is billed. */
    interval: "day" | "week" | "month" | "year";
    /** The number of intervals between subscription billings. */
    interval_count?: number;
    /** Specifies a usage-based billing model. */
    usage_type?: "licensed" | "metered";
    /** Configuration for tiered prices. */
    tiers_mode?: "graduated" | "volume";
  };
  /** A brief description of the price. */
  nickname?: string;
  /** Specifies whether the price is active. */
  active?: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata;
  /** Determines how the price should be charged (per_unit or tiered). */
  billing_scheme?: "per_unit" | "tiered";
  /** A transform applied to the quantity before calculating the amount. */
  transform_quantity?: {
    divide_by: number;
    round: "up" | "down";
  };
};

/** Payload for updating an existing Stripe Price. */
export type UpdatePricePayload = {
  /** Whether the price can be used for new purchases. */
  active?: boolean;
  /** A brief description of the price. */
  nickname?: string | null;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The ID of the product this price is associated with. */
  product?: string;
};

/** Payload for creating a new Stripe Subscription. */
export type CreateSubscriptionPayload = {
  /** The ID of the customer for whom to create the subscription. */
  customer: string;
  /** A list of subscription items, each with a price and quantity. */
  items: Array<{
    price: string;
    quantity?: number;
    metadata?: StripeMetadata;
  }>;
  /** A non-negative decimal (with at most four decimal places) representing the amount of tax that will be applied to invoices created during this subscription. */
  application_fee_percent?: number;
  /** Determines if the subscription will be canceled at the end of the current period. */
  cancel_at_period_end?: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata;
  /** The default payment method for the subscription. */
  default_payment_method?: string;
  /** The coupon or promotion code to apply to the subscription. */
  coupon?: string;
  /** The trial period in days. */
  trial_period_days?: number;
  /** The behavior when proration is applied. */
  proration_behavior?: "always_invoice" | "create_prorations" | "none";
  /** The collection method for this subscription. */
  collection_method?: "charge_automatically" | "send_invoice";
  /** Timestamp when the subscription will start. */
  billing_cycle_anchor?: number | "now";
  /** A list of [Tax Rate](https://stripe.com/docs/api/tax_rates) IDs to apply to the subscription. */
  default_tax_rates?: string[];
  /** A description of the subscription for the invoice. */
  description?: string;
};

/** Payload for updating an existing Stripe Subscription. */
export type UpdateSubscriptionPayload = {
  /** A list of subscription items to update or add. */
  items?: Array<{
    id?: string; // For existing items
    price?: string;
    quantity?: number;
    metadata?: StripeMetadata;
    deleted?: boolean; // To remove an item
  }>;
  /** Determines if the subscription will be canceled at the end of the current period. */
  cancel_at_period_end?: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata | null;
  /** The default payment method for the subscription. */
  default_payment_method?: string | null;
  /** The coupon or promotion code to apply to the subscription. */
  coupon?: string | null;
  /** The behavior when proration is applied. */
  proration_behavior?: "always_invoice" | "create_prorations" | "none";
  /** The timestamp at which the subscription should be canceled. */
  cancel_at?: number | null;
  /** The timestamp at which the subscription trial ends. */
  trial_end?: number | "now" | null;
  /** The collection method for this subscription. */
  collection_method?: "charge_automatically" | "send_invoice";
  /** The status to transition the subscription to. */
  status?: "active" | "canceled" | "past_due" | "paused" | "incomplete" | "incomplete_expired" | "trialing" | "unpaid";
  /** A non-negative decimal (with at most four decimal places) representing the amount of tax that will be applied to invoices created during this subscription. */
  application_fee_percent?: number | null;
  /** A list of [Tax Rate](https://stripe.com/docs/api/tax_rates) IDs to apply to the subscription. */
  default_tax_rates?: string[] | null;
  /** A description of the subscription for the invoice. */
  description?: string | null;
};

/** Payload for canceling a Stripe Subscription. */
export type CancelSubscriptionPayload = {
  /** A value that indicates whether the subscription should be canceled immediately or at the end of the current billing period. */
  at_period_end?: boolean;
  /** If set to true, prorations will be generated for the cancellation. */
  invoice_now?: boolean;
};

/** Payload for creating a new Stripe Charge (one-time payment). */
export type CreateChargePayload = {
  /** Amount in cents. */
  amount: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: string;
  /** The ID of a PaymentMethod to use for this charge. */
  payment_method: string;
  /** The ID of the customer. */
  customer?: string;
  /** An arbitrary string attached to the object. */
  description?: string;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: StripeMetadata;
  /** The email address to which this charge's receipt should be sent. */
  receipt_email?: string;
  /** Shipping information for the charge. */
  shipping?: StripeShipping;
  /** Whether to immediately capture the charge. */
  capture?: boolean;
  /** The statement descriptor for the charge. */
  statement_descriptor?: string;
  /** The statement descriptor suffix for the charge. */
  statement_descriptor_suffix?: string;
  /** The URL to redirect the customer to after they authenticate their payment. */
  return_url?: string;
};

/** Payload for creating a Stripe Checkout Session. */
export type CreateCheckoutSessionPayload = {
  /** The mode of the Checkout Session. */
  mode: "payment" | "setup" | "subscription";
  /** The ID of an existing customer, if one exists. */
  customer?: string;
  /** The email address of the customer, if no existing customer is used. */
  customer_email?: string;
  /** The URL to which Stripe should send your customer when checkout is complete. */
  success_url: string;
  /** The URL to which Stripe should send your customer when checkout fails or is canceled. */
  cancel_url: string;
  /** A list of line items being purchased. */
  line_items?: Array<{
    price?: string; // Price ID for an existing Price object
    quantity: number;
    // Or for ad-hoc products/prices:
    adjustable_quantity?: { enabled: boolean; minimum?: number; maximum?: number };
    description?: string;
    images?: string[];
    name?: string;
    amount?: number; // In cents
    currency?: string;
    tax_rates?: string[]; // Tax rate IDs
  }>;
  /** Data to use when creating a new subscription. */
  subscription_data?: {
    items?: Array<{
      price: string;
      quantity?: number;
    }>;
    trial_period_days?: number;
    default_payment_method?: string;
    metadata?: StripeMetadata;
    default_tax_rates?: string[];
    description?: string;
  };
  /** If true, Stripe will create a Customer object. */
  allow_promotion_codes?: boolean;
  /** Configuration for collecting the customer's billing address. */
  billing_address_collection?: "auto" | "required";
  /** An array of the types of payment methods that customers can use. */
  payment_method_types?: Array<"card" | "acss_debit" | "alipay" | "us_bank_account" | string>;
  /** Set of key-value pairs that you can attach to the object. */
  metadata?: StripeMetadata;
  /** The URL to redirect the customer to after they authenticate their payment. */
  return_url?: string;
};


/**
 * Core utility function to simulate an API request to the Stripe backend.
 * In a real application, this would use `fetch` or a similar HTTP client to make actual network calls.
 * For this exercise, it resolves with mock data or simulated errors to fulfill the "no dependencies" and "all logic" requirements.
 *
 * @template T The expected type of the data in a successful response.
 * @param {string} path The specific API path relative to `STRIPE_API_BASE_PATH`.
 * @param {string} method The HTTP method for the request (e.g., "GET", "POST", "PUT", "DELETE").
 * @param {unknown} [data] The request body payload.
 * @returns {Promise<StripeOperationResult<T>>} A promise that resolves with either a success or error response.
 */
async function performStripeApiRequest<T>(
  path: string,
  method: string,
  data?: unknown,
): Promise<StripeOperationResult<T>> {
  const fullUrl = `https://citibankdemobusiness.dev${STRIPE_API_BASE_PATH}${path}`;
  console.log(`Simulating API call: ${method} ${fullUrl}`, data || "");

  // Simulate network delay to mimic real-world latency
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100));

  // Simulate a 10% chance of a generic API failure
  if (Math.random() < 0.1) {
    return {
      success: false,
      error: {
        code: "api_error",
        message: "A simulated API error occurred.",
        detail: `Failed to ${method} ${path} due to an unexpected backend issue.`,
        statusCode: Math.random() < 0.5 ? 400 : 500, // Randomly choose between bad request or internal server error
      },
    };
  }

  // Simulate specific error types for certain paths/methods for more robust testing scenarios
  if (path.includes("/customers/") && method === "DELETE" && Math.random() < 0.05) {
    return {
      success: false,
      error: {
        code: "customer_in_use",
        message: "Cannot delete customer with active subscriptions.",
        detail: "The customer has one or more active subscriptions. Please cancel them before attempting deletion.",
        statusCode: 409 // Conflict
      }
    };
  }

  if (path.includes("/subscriptions/") && method === "POST" && Math.random() < 0.05) {
    return {
      success: false,
      error: {
        code: "invalid_payment_method",
        message: "Invalid or expired payment method provided for subscription.",
        detail: "The payment method attached to the customer is invalid, expired, or requires further authentication.",
        statusCode: 402 // Payment Required
      }
    };
  }

  // Generate a plausible mock response based on the request.
  // The actual 'data' returned would depend heavily on the specific endpoint and its return type in a real backend.
  const mockId = `mock_${Math.random().toString(36).substring(2, 15)}`;
  const mockTimestamp = Math.floor(Date.now() / 1000);

  let mockResponseData: T;

  if (path.includes("/customers") && (method === "POST" || method === "PUT")) {
    const payload = data as CreateCustomerPayload | UpdateCustomerPayload;
    mockResponseData = {
      id: path.includes("/customers/") ? path.split('/').pop() : mockId,
      object: "customer",
      name: payload?.name || "Mock Customer",
      email: payload?.email || "mock@example.com",
      created: mockTimestamp,
      livemode: false,
      balance: 0,
      description: payload?.description || null,
      metadata: payload?.metadata || {},
      invoice_settings: { default_payment_method: (payload as CreateCustomerPayload)?.payment_method || (payload as UpdateCustomerPayload)?.invoice_settings?.default_payment_method || null },
      currency: (payload as CreateCustomerPayload)?.currency || "usd",
      address: payload?.address || null,
      shipping: payload?.shipping || null,
      phone: payload?.phone || null,
      preferred_locales: payload?.preferred_locales || [],
      tax_exempt: payload?.tax_exempt || "none",
    } as T;
  } else if (path.match(/^\/customers\/[^/]+$/) && method === "GET") { // Retrieve single customer
    mockResponseData = {
      id: path.split('/').pop(),
      object: "customer",
      name: "Retrieved Mock Customer",
      email: "retrieved.mock@example.com",
      created: mockTimestamp - 3600, // Simulate older creation
      livemode: false,
      balance: 1500,
      description: "A customer retrieved from mock API with some balance.",
      metadata: { source: "mock-api-retrieval" },
      invoice_settings: { default_payment_method: "pm_mockdefault_retrieved" },
      currency: "usd",
      address: { city: "San Francisco", country: "US", line1: "123 Mock St", postal_code: "94107", state: "CA" },
      shipping: { name: "Mock Ship", phone: "555-1234", address: { city: "San Francisco", country: "US", line1: "123 Mock St", postal_code: "94107", state: "CA" } },
      phone: "555-1234",
      preferred_locales: ["en-US"],
      tax_exempt: "none",
    } as T;
  } else if (path.startsWith("/customers") && method === "GET") { // List customers
    mockResponseData = {
      object: "list",
      data: [{
        id: "cus_mock_list1",
        object: "customer",
        name: "Mock Customer List One",
        email: "mocklist1@example.com",
        created: mockTimestamp - 7200, livemode: false, balance: 0, currency: "usd", metadata: {}, invoice_settings: { default_payment_method: null },
      }, {
        id: "cus_mock_list2",
        object: "customer",
        name: "Mock Customer List Two",
        email: "mocklist2@example.com",
        created: mockTimestamp - 3600, livemode: false, balance: 500, currency: "usd", metadata: {}, invoice_settings: { default_payment_method: "pm_mocklist2" },
      }],
      has_more: false,
      url: `${STRIPE_API_BASE_PATH}/customers`,
    } as T;
  } else if (path.includes("/payment_methods") && (method === "POST" || method === "PUT" || method === "GET")) {
    mockResponseData = {
      id: mockId,
      object: "payment_method",
      type: "card",
      created: mockTimestamp,
      livemode: false,
      customer: path.includes("customers/") ? path.split('/')[3] : null, // Infer customer from path
      billing_details: { name: "Mock User", email: "mock@user.com", address: { country: "US" } },
      card: { brand: "visa", exp_month: 12, exp_year: 2025, last4: "4242", country: "US", funding: "credit", network: "visa" },
    } as T;
  } else if (path.includes("/products") && (method === "POST" || method === "PUT")) {
    const payload = data as CreateProductPayload | UpdateProductPayload;
    mockResponseData = {
      id: path.includes("/products/") ? path.split('/').pop() : mockId,
      object: "product",
      name: payload?.name || "Mock Product",
      description: payload?.description || null,
      active: payload?.active ?? true,
      created: mockTimestamp,
      updated: mockTimestamp,
      livemode: false,
      images: payload?.images || [],
      metadata: payload?.metadata || {},
      type: payload?.type || "service",
      default_price: payload?.default_price || null,
    } as T;
  } else if (path.startsWith("/products") && method === "GET") { // List products
    mockResponseData = {
      object: "list",
      data: [{
        id: "prod_mock_basic", object: "product", name: "Basic Plan", description: "Standard subscription plan.",
        active: true, created: mockTimestamp - 10000, updated: mockTimestamp - 5000, livemode: false, images: [], metadata: {}, type: "service", default_price: "price_mock_basic",
      }, {
        id: "prod_mock_premium", object: "product", name: "Premium Plan", description: "Advanced subscription plan.",
        active: true, created: mockTimestamp - 9000, updated: mockTimestamp - 4000, livemode: false, images: [], metadata: {}, type: "service", default_price: "price_mock_premium",
      }],
      has_more: false, url: `${STRIPE_API_BASE_PATH}/products`
    } as T;
  } else if (path.includes("/prices") && (method === "POST" || method === "PUT")) {
    const payload = data as CreatePricePayload | UpdatePricePayload;
    mockResponseData = {
      id: path.includes("/prices/") ? path.split('/').pop() : mockId,
      object: "price",
      currency: payload?.currency || "usd",
      unit_amount: payload?.unit_amount,
      product: payload?.product || "prod_mock_default",
      active: payload?.active ?? true,
      created: mockTimestamp,
      livemode: false,
      type: payload?.recurring ? "recurring" : "one_time",
      recurring: payload?.recurring ? { ... (payload as CreatePricePayload).recurring, usage_type: "licensed", interval_count: (payload as CreatePricePayload).recurring?.interval_count || 1 } : null,
      nickname: payload?.nickname || null,
      unit_amount_decimal: payload?.unit_amount_decimal || null,
      billing_scheme: payload?.billing_scheme || "per_unit",
      transform_quantity: payload?.transform_quantity || null,
    } as T;
  } else if (path.startsWith("/prices") && method === "GET") { // List prices
    mockResponseData = {
      object: "list",
      data: [{
        id: "price_mock_basic", object: "price", currency: "usd", unit_amount: 1000, product: "prod_mock_basic", active: true, created: mockTimestamp - 8000, livemode: false, type: "recurring", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" },
      }, {
        id: "price_mock_premium", object: "price", currency: "usd", unit_amount: 5000, product: "prod_mock_premium", active: true, created: mockTimestamp - 7000, livemode: false, type: "recurring", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" },
      }],
      has_more: false, url: `${STRIPE_API_BASE_PATH}/prices`
    } as T;
  } else if (path.includes("/subscriptions") && (method === "POST" || method === "PUT" || method === "DELETE" || path.includes("/cancel"))) {
    const payload = data as CreateSubscriptionPayload | UpdateSubscriptionPayload;
    mockResponseData = {
      id: path.includes("/subscriptions/") ? path.split('/')[3] : mockId,
      object: "subscription",
      customer: payload?.customer || "cus_mock_default_sub",
      status: (method === "DELETE" || path.includes("/cancel")) ? "canceled" : "active",
      start_date: mockTimestamp,
      current_period_start: mockTimestamp,
      current_period_end: mockTimestamp + (30 * 24 * 60 * 60), // +1 month
      livemode: false,
      cancel_at_period_end: (payload as CreateSubscriptionPayload)?.cancel_at_period_end ?? false,
      items: {
        object: "list",
        data: (payload as CreateSubscriptionPayload)?.items?.map(item => ({
          id: `si_${Math.random().toString(36).substring(2, 10)}`,
          object: "subscription_item", created: mockTimestamp,
          price: { id: item.price, object: "price", active: true, currency: "usd", type: "recurring", product: "prod_mock", created: mockTimestamp, livemode: false, recurring: { interval: "month", usage_type: "licensed", interval_count: 1 } },
          quantity: item.quantity || 1, subscription: mockId,
        })) || [],
        has_more: false, url: `${STRIPE_API_BASE_PATH}/subscription_items`
      },
      quantity: (payload as CreateSubscriptionPayload)?.items?.[0]?.quantity || 1, // Simplified, assumes first item quantity
      collection_method: (payload as CreateSubscriptionPayload)?.collection_method || "charge_automatically",
      metadata: payload?.metadata || {},
      billing_cycle_anchor: mockTimestamp,
      default_payment_method: payload?.default_payment_method || null,
      trial_end: payload?.trial_period_days ? mockTimestamp + (payload.trial_period_days * 24 * 60 * 60) : null,
      cancel_at: (payload as UpdateSubscriptionPayload)?.cancel_at || null,
      ended_at: (method === "DELETE" || path.includes("/cancel")) ? mockTimestamp : null,
    } as T;
  } else if (path.startsWith("/subscriptions") && method === "GET") { // List or retrieve subscription
    mockResponseData = {
      object: "list",
      data: [{
        id: "sub_mock_active", object: "subscription", customer: "cus_mock_list1", status: "active", start_date: mockTimestamp - 90 * 24 * 60 * 60, current_period_start: mockTimestamp - 30 * 24 * 60 * 60, current_period_end: mockTimestamp + 30 * 24 * 60 * 60,
        livemode: false, cancel_at_period_end: false, quantity: 1, collection_method: "charge_automatically", billing_cycle_anchor: mockTimestamp - 90 * 24 * 60 * 60, metadata: {},
        items: {
          object: "list", data: [{ id: "si_basic_active", object: "subscription_item", created: mockTimestamp - 90 * 24 * 60 * 60, price: { id: "price_mock_basic", object: "price", active: true, currency: "usd", unit_amount: 1000, product: "prod_mock_basic", created: mockTimestamp - 10000, livemode: false, type: "recurring", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } }, quantity: 1, subscription: "sub_mock_active" }],
          has_more: false, url: `${STRIPE_API_BASE_PATH}/subscription_items`
        },
      }, {
        id: "sub_mock_pastdue", object: "subscription", customer: "cus_mock_list2", status: "past_due", start_date: mockTimestamp - 60 * 24 * 60 * 60, current_period_start: mockTimestamp - 30 * 24 * 60 * 60, current_period_end: mockTimestamp,
        livemode: false, cancel_at_period_end: false, quantity: 1, collection_method: "charge_automatically", billing_cycle_anchor: mockTimestamp - 60 * 24 * 60 * 60, metadata: {},
        items: {
          object: "list", data: [{ id: "si_premium_pastdue", object: "subscription_item", created: mockTimestamp - 60 * 24 * 60 * 60, price: { id: "price_mock_premium", object: "price", active: true, currency: "usd", unit_amount: 5000, product: "prod_mock_premium", created: mockTimestamp - 9000, livemode: false, type: "recurring", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } }, quantity: 1, subscription: "sub_mock_pastdue" }],
          has_more: false, url: `${STRIPE_API_BASE_PATH}/subscription_items`
        },
      }],
      has_more: false, url: `${STRIPE_API_BASE_PATH}/subscriptions`
    } as T;
  } else if (path.includes("/invoices") && (method === "POST" || method === "PUT" || method === "GET" || path.includes("/pay") || path.includes("/finalize"))) {
    const defaultInvoiceItems: StripeInvoiceLineItem[] = [{
      id: `li_${Math.random().toString(36).substring(2, 10)}`,
      object: "line_item", amount: 5000, currency: "usd", description: "Service fee for current period",
      period: { start: mockTimestamp - (30 * 24 * 60 * 60), end: mockTimestamp }, type: "invoiceitem"
    }];

    mockResponseData = {
      id: path.includes("/invoices/") && !path.includes("upcoming") ? path.split('/')[3] : mockId,
      object: "invoice", amount_due: 5000, amount_paid: path.includes("/pay") ? 5000 : 0, amount_remaining: path.includes("/pay") ? 0 : 5000,
      created: mockTimestamp, currency: "usd", customer: path.includes("customers/") ? path.split('/')[3] : "cus_mock_invoice",
      collection_method: "charge_automatically",
      lines: { object: "list", data: defaultInvoiceItems, has_more: false, url: `${STRIPE_API_BASE_PATH}/invoiceitems` },
      livemode: false, metadata: {}, paid: path.includes("/pay") ? true : false,
      status: path.includes("/pay") ? "paid" : (path.includes("/finalize") ? "open" : "draft"),
      subtotal: 5000, total: 5000,
      hosted_invoice_url: `https://citibankdemobusiness.dev/invoice/${mockId}`,
      invoice_pdf: `https://citibankdemobusiness.dev/invoice/${mockId}.pdf`,
    } as T;
  } else if (path.includes("/charges") && (method === "POST" || method === "GET")) {
    const payload = data as CreateChargePayload;
    mockResponseData = {
      id: path.includes("/charges/") ? path.split('/')[3] : mockId,
      object: "charge",
      amount: payload?.amount || 1000, currency: payload?.currency || "usd",
      customer: payload?.customer || "cus_mock_charge", payment_method: payload?.payment_method || "pm_mock_charge",
      status: "succeeded", created: mockTimestamp, livemode: false,
      amount_refunded: 0, captured: payload?.capture ?? true, refunded: false,
      receipt_email: payload?.receipt_email || "mock@example.com",
      receipt_url: `https://citibankdemobusiness.dev/receipt/${mockId}`,
      description: payload?.description || null, metadata: payload?.metadata || {},
      shipping: payload?.shipping || null,
      statement_descriptor: payload?.statement_descriptor || null,
      statement_descriptor_suffix: payload?.statement_descriptor_suffix || null,
    } as T;
  } else if (path.includes("/checkout/sessions") && (method === "POST" || method === "GET")) {
    const payload = data as CreateCheckoutSessionPayload;
    mockResponseData = {
      id: path.includes("/checkout/sessions/") ? path.split('/').pop() : mockId,
      object: "checkout.session",
      mode: payload?.mode || "payment",
      payment_status: "unpaid",
      status: "open",
      created: mockTimestamp,
      livemode: false,
      url: `https://citibankdemobusiness.dev/checkout/${mockId}`,
      customer: payload?.customer,
      customer_email: payload?.customer_email,
      cancel_url: payload?.cancel_url || "https://citibankdemobusiness.dev/cancel",
      success_url: payload?.success_url || "https://citibankdemobusiness.dev/success",
      currency: "usd",
      line_items: payload?.line_items ? {
        object: "list", data: payload.line_items.map(item => ({ id: `li_${Math.random().toString(36).substring(2, 10)}`, amount_total: item.amount || 0, currency: item.currency || "usd", quantity: item.quantity, description: item.description || "" })), has_more: false
      } : undefined,
    } as T;
  } else if (method === "DELETE") {
    // Generic deletion response
    mockResponseData = { id: path.split('/').pop(), deleted: true } as T;
  } else {
    // Fallback for unhandled types or generic 'retrieve' operations if no specific mock applies
    mockResponseData = { id: mockId, created: mockTimestamp, object: "unknown", livemode: false, ...(data as Record<string, unknown> || {}) } as T;
  }

  return { success: true, data: mockResponseData };
}

// --- Customer API ---

/**
 * Creates a new Stripe customer in the backend.
 *
 * @param {CreateCustomerPayload} payload The data required to create a customer.
 * @returns {Promise<StripeOperationResult<StripeCustomer>>} A promise resolving to the created customer object or a detailed error.
 */
export async function createStripeCustomer(
  payload: CreateCustomerPayload,
): Promise<StripeOperationResult<StripeCustomer>> {
  return performStripeApiRequest<StripeCustomer>("/customers", "POST", payload);
}

/**
 * Retrieves an existing Stripe customer by their unique identifier.
 *
 * @param {string} customerId The ID of the customer to retrieve.
 * @returns {Promise<StripeOperationResult<StripeCustomer>>} A promise resolving to the retrieved customer object or a detailed error.
 */
export async function retrieveStripeCustomer(
  customerId: string,
): Promise<StripeOperationResult<StripeCustomer>> {
  return performStripeApiRequest<StripeCustomer>(`/customers/${customerId}`, "GET");
}

/**
 * Updates an existing Stripe customer's information.
 *
 * @param {string} customerId The ID of the customer to update.
 * @param {UpdateCustomerPayload} payload The data to update on the customer.
 * @returns {Promise<StripeOperationResult<StripeCustomer>>} A promise resolving to the updated customer object or a detailed error.
 */
export async function updateStripeCustomer(
  customerId: string,
  payload: UpdateCustomerPayload,
): Promise<StripeOperationResult<StripeCustomer>> {
  return performStripeApiRequest<StripeCustomer>(`/customers/${customerId}`, "PUT", payload);
}

/**
 * Deletes a Stripe customer. This operation might fail if the customer has active subscriptions or other dependencies.
 *
 * @param {string} customerId The ID of the customer to delete.
 * @returns {Promise<StripeOperationResult<{ id: string; deleted: boolean }>>} A promise resolving to a deletion confirmation object or a detailed error.
 */
export async function deleteStripeCustomer(
  customerId: string,
): Promise<StripeOperationResult<{ id: string; deleted: boolean }>> {
  return performStripeApiRequest<{ id: string; deleted: boolean }>(
    `/customers/${customerId}`,
    "DELETE",
  );
}

/**
 * Lists Stripe customers, with optional pagination and filtering parameters.
 *
 * @param {ListOptions} [options] Optional parameters for listing customers, such as `limit`, `starting_after`, `email`.
 * @returns {Promise<StripeOperationResult<ListResponse<StripeCustomer>>>} A promise resolving to a list of customer objects or a detailed error.
 */
export async function listStripeCustomers(
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripeCustomer>>> {
  const query = options ? new URLSearchParams(options as Record<string, string>).toString() : "";
  return performStripeApiRequest<ListResponse<StripeCustomer>>(
    `/customers${query ? `?${query}` : ""}`,
    "GET",
  );
}

// --- Payment Method API ---

/**
 * Attaches a Payment Method to a specified customer. Once attached, it can be used for payments.
 *
 * @param {string} customerId The ID of the customer to attach the Payment Method to.
 * @param {string} paymentMethodId The ID of the Payment Method to attach.
 * @param {boolean} [makeDefault=false] If true, sets this Payment Method as the customer's default for future payments.
 * @returns {Promise<StripeOperationResult<StripePaymentMethod>>} A promise resolving to the attached Payment Method object or a detailed error.
 */
export async function attachStripePaymentMethod(
  customerId: string,
  paymentMethodId: string,
  makeDefault: boolean = false,
): Promise<StripeOperationResult<StripePaymentMethod>> {
  return performStripeApiRequest<StripePaymentMethod>(
    `/customers/${customerId}/payment_methods/${paymentMethodId}/attach`,
    "POST",
    { make_default: makeDefault },
  );
}

/**
 * Detaches a Payment Method from its customer. This makes it unavailable for future payments via this customer.
 *
 * @param {string} paymentMethodId The ID of the Payment Method to detach.
 * @returns {Promise<StripeOperationResult<StripePaymentMethod>>} A promise resolving to the detached Payment Method object or a detailed error.
 */
export async function detachStripePaymentMethod(
  paymentMethodId: string,
): Promise<StripeOperationResult<StripePaymentMethod>> {
  return performStripeApiRequest<StripePaymentMethod>(
    `/payment_methods/${paymentMethodId}/detach`,
    "POST",
  );
}

/**
 * Lists Payment Methods attached to a specific customer, with optional pagination.
 *
 * @param {string} customerId The ID of the customer whose Payment Methods to list.
 * @param {ListOptions} [options] Optional parameters for listing Payment Methods.
 * @returns {Promise<StripeOperationResult<ListResponse<StripePaymentMethod>>>} A promise resolving to a list of Payment Method objects or a detailed error.
 */
export async function listStripePaymentMethods(
  customerId: string,
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripePaymentMethod>>> {
  const query = options ? new URLSearchParams(options as Record<string, string>).toString() : "";
  return performStripeApiRequest<ListResponse<StripePaymentMethod>>(
    `/customers/${customerId}/payment_methods${query ? `?${query}` : ""}`,
    "GET",
  );
}

/**
 * Sets a specified Payment Method as the default for a customer's invoices and subscriptions.
 *
 * @param {string} customerId The ID of the customer.
 * @param {string} paymentMethodId The ID of the Payment Method to set as default.
 * @returns {Promise<StripeOperationResult<StripeCustomer>>} A promise resolving to the updated customer object with the new default Payment Method or a detailed error.
 */
export async function setDefaultStripePaymentMethod(
  customerId: string,
  paymentMethodId: string,
): Promise<StripeOperationResult<StripeCustomer>> {
  return performStripeApiRequest<StripeCustomer>(
    `/customers/${customerId}/invoice_settings`,
    "PUT",
    { default_payment_method: paymentMethodId },
  );
}

// --- Product API ---

/**
 * Creates a new Stripe Product, representing a good or service offered.
 *
 * @param {CreateProductPayload} payload The data required to create a product.
 * @returns {Promise<StripeOperationResult<StripeProduct>>} A promise resolving to the created product object or a detailed error.
 */
export async function createStripeProduct(
  payload: CreateProductPayload,
): Promise<StripeOperationResult<StripeProduct>> {
  return performStripeApiRequest<StripeProduct>("/products", "POST", payload);
}

/**
 * Retrieves a Stripe Product by its unique identifier.
 *
 * @param {string} productId The ID of the product to retrieve.
 * @returns {Promise<StripeOperationResult<StripeProduct>>} A promise resolving to the product object or a detailed error.
 */
export async function retrieveStripeProduct(
  productId: string,
): Promise<StripeOperationResult<StripeProduct>> {
  return performStripeApiRequest<StripeProduct>(`/products/${productId}`, "GET");
}

/**
 * Updates an existing Stripe Product's details.
 *
 * @param {string} productId The ID of the product to update.
 * @param {UpdateProductPayload} payload The data to update on the product.
 * @returns {Promise<StripeOperationResult<StripeProduct>>} A promise resolving to the updated product object or a detailed error.
 */
export async function updateStripeProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<StripeOperationResult<StripeProduct>> {
  return performStripeApiRequest<StripeProduct>(`/products/${productId}`, "PUT", payload);
}

/**
 * Lists Stripe Products, with optional pagination and filtering.
 *
 * @param {ListOptions} [options] Optional parameters for listing products.
 * @returns {Promise<StripeOperationResult<ListResponse<StripeProduct>>>} A promise resolving to a list of product objects or a detailed error.
 */
export async function listStripeProducts(
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripeProduct>>> {
  const query = options ? new URLSearchParams(options as Record<string, string>).toString() : "";
  return performStripeApiRequest<ListResponse<StripeProduct>>(
    `/products${query ? `?${query}` : ""}`,
    "GET",
  );
}

// --- Price API ---

/**
 * Creates a new Stripe Price, defining how much and how often to charge for a product.
 *
 * @param {CreatePricePayload} payload The data required to create a price.
 * @returns {Promise<StripeOperationResult<StripePrice>>} A promise resolving to the created price object or a detailed error.
 */
export async function createStripePrice(
  payload: CreatePricePayload,
): Promise<StripeOperationResult<StripePrice>> {
  return performStripeApiRequest<StripePrice>("/prices", "POST", payload);
}

/**
 * Retrieves a Stripe Price by its unique identifier.
 *
 * @param {string} priceId The ID of the price to retrieve.
 * @returns {Promise<StripeOperationResult<StripePrice>>} A promise resolving to the price object or a detailed error.
 */
export async function retrieveStripePrice(
  priceId: string,
): Promise<StripeOperationResult<StripePrice>> {
  return performStripeApiRequest<StripePrice>(`/prices/${priceId}`, "GET");
}

/**
 * Updates an existing Stripe Price's details.
 *
 * @param {string} priceId The ID of the price to update.
 * @param {UpdatePricePayload} payload The data to update on the price.
 * @returns {Promise<StripeOperationResult<StripePrice>>} A promise resolving to the updated price object or a detailed error.
 */
export async function updateStripePrice(
  priceId: string,
  payload: UpdatePricePayload,
): Promise<StripeOperationResult<StripePrice>> {
  return performStripeApiRequest<StripePrice>(`/prices/${priceId}`, "PUT", payload);
}

/**
 * Lists Stripe Prices, with optional pagination and filtering.
 *
 * @param {ListOptions} [options] Optional parameters for listing prices.
 * @returns {Promise<StripeOperationResult<ListResponse<StripePrice>>>} A promise resolving to a list of price objects or a detailed error.
 */
export async function listStripePrices(
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripePrice>>> {
  const query = options ? new URLSearchParams(options as Record<string, string>).toString() : "";
  return performStripeApiRequest<ListResponse<StripePrice>>(
    `/prices${query ? `?${query}` : ""}`,
    "GET",
  );
}

// --- Subscription API ---

/**
 * Creates a new Stripe Subscription for a customer, linking them to a recurring price.
 *
 * @param {CreateSubscriptionPayload} payload The data required to create a subscription.
 * @returns {Promise<StripeOperationResult<StripeSubscription>>} A promise resolving to the created subscription object or a detailed error.
 */
export async function createStripeSubscription(
  payload: CreateSubscriptionPayload,
): Promise<StripeOperationResult<StripeSubscription>> {
  return performStripeApiRequest<StripeSubscription>("/subscriptions", "POST", payload);
}

/**
 * Retrieves a Stripe Subscription by its unique identifier.
 *
 * @param {string} subscriptionId The ID of the subscription to retrieve.
 * @returns {Promise<StripeOperationResult<StripeSubscription>>} A promise resolving to the subscription object or a detailed error.
 */
export async function retrieveStripeSubscription(
  subscriptionId: string,
): Promise<StripeOperationResult<StripeSubscription>> {
  return performStripeApiRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`, "GET");
}

/**
 * Updates an existing Stripe Subscription's details, such as changing the plan, quantity, or metadata.
 *
 * @param {string} subscriptionId The ID of the subscription to update.
 * @param {UpdateSubscriptionPayload} payload The data to update on the subscription.
 * @returns {Promise<StripeOperationResult<StripeSubscription>>} A promise resolving to the updated subscription object or a detailed error.
 */
export async function updateStripeSubscription(
  subscriptionId: string,
  payload: UpdateSubscriptionPayload,
): Promise<StripeOperationResult<StripeSubscription>> {
  return performStripeApiRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`, "PUT", payload);
}

/**
 * Cancels a Stripe Subscription. Depending on `at_period_end`, it can cancel immediately or at the end of the current billing cycle.
 *
 * @param {string} subscriptionId The ID of the subscription to cancel.
 * @param {CancelSubscriptionPayload} [payload] Optional parameters for cancellation, such as `at_period_end`.
 * @returns {Promise<StripeOperationResult<StripeSubscription>>} A promise resolving to the canceled subscription object or a detailed error.
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  payload?: CancelSubscriptionPayload,
): Promise<StripeOperationResult<StripeSubscription>> {
  return performStripeApiRequest<StripeSubscription>(
    `/subscriptions/${subscriptionId}/cancel`,
    "POST",
    payload,
  );
}

/**
 * Lists Stripe Subscriptions, with optional customer ID, pagination, and filtering.
 *
 * @param {string} [customerId] Optional customer ID to filter subscriptions belonging to a specific customer.
 * @param {ListOptions} [options] Optional parameters for listing subscriptions.
 * @returns {Promise<StripeOperationResult<ListResponse<StripeSubscription>>>} A promise resolving to a list of subscription objects or a detailed error.
 */
export async function listStripeSubscriptions(
  customerId?: string,
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripeSubscription>>> {
  const params = new URLSearchParams(options as Record<string, string>);
  if (customerId) {
    params.set("customer", customerId);
  }
  const query = params.toString();
  return performStripeApiRequest<ListResponse<StripeSubscription>>(
    `/subscriptions${query ? `?${query}` : ""}`,
    "GET",
  );
}

/**
 * Retrieves the upcoming invoice for a given subscription. This can be used to display an estimate of the next bill.
 *
 * @param {string} subscriptionId The ID of the subscription to get the upcoming invoice for.
 * @returns {Promise<StripeOperationResult<StripeInvoice>>} A promise resolving to the upcoming invoice object or a detailed error.
 */
export async function getStripeSubscriptionUpcomingInvoice(
  subscriptionId: string,
): Promise<StripeOperationResult<StripeInvoice>> {
  return performStripeApiRequest<StripeInvoice>(
    `/invoices/upcoming?subscription=${subscriptionId}`,
    "GET",
  );
}

// --- Invoice API ---

/**
 * Retrieves a Stripe Invoice by its unique identifier.
 *
 * @param {string} invoiceId The ID of the invoice to retrieve.
 * @returns {Promise<StripeOperationResult<StripeInvoice>>} A promise resolving to the invoice object or a detailed error.
 */
export async function retrieveStripeInvoice(
  invoiceId: string,
): Promise<StripeOperationResult<StripeInvoice>> {
  return performStripeApiRequest<StripeInvoice>(`/invoices/${invoiceId}`, "GET");
}

/**
 * Lists Stripe Invoices, with optional customer ID, pagination, and filtering.
 *
 * @param {string} [customerId] Optional customer ID to filter invoices belonging to a specific customer.
 * @param {ListOptions} [options] Optional parameters for listing invoices.
 * @returns {Promise<StripeOperationResult<ListResponse<StripeInvoice>>>} A promise resolving to a list of invoice objects or a detailed error.
 */
export async function listStripeInvoices(
  customerId?: string,
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripeInvoice>>> {
  const params = new URLSearchParams(options as Record<string, string>);
  if (customerId) {
    params.set("customer", customerId);
  }
  const query = params.toString();
  return performStripeApiRequest<ListResponse<StripeInvoice>>(
    `/invoices${query ? `?${query}` : ""}`,
    "GET",
  );
}

/**
 * Pays a Stripe Invoice using a specific payment method or the customer's default payment method.
 *
 * @param {string} invoiceId The ID of the invoice to pay.
 * @param {string} [paymentMethodId] Optional ID of the Payment Method to use for this payment. If not provided, the customer's default will be used.
 * @returns {Promise<StripeOperationResult<StripeInvoice>>} A promise resolving to the paid invoice object or a detailed error.
 */
export async function payStripeInvoice(
  invoiceId: string,
  paymentMethodId?: string,
): Promise<StripeOperationResult<StripeInvoice>> {
  return performStripeApiRequest<StripeInvoice>(
    `/invoices/${invoiceId}/pay`,
    "POST",
    paymentMethodId ? { payment_method: paymentMethodId } : {},
  );
}

/**
 * Finalizes a draft invoice. Once an invoice is finalized, it's no longer a draft and can be paid.
 *
 * @param {string} invoiceId The ID of the invoice to finalize.
 * @returns {Promise<StripeOperationResult<StripeInvoice>>} A promise resolving to the finalized invoice object or a detailed error.
 */
export async function finalizeStripeInvoice(
  invoiceId: string,
): Promise<StripeOperationResult<StripeInvoice>> {
  return performStripeApiRequest<StripeInvoice>(`/invoices/${invoiceId}/finalize`, "POST");
}

// --- Charge API ---

/**
 * Creates a new Stripe Charge, representing a one-time payment.
 *
 * @param {CreateChargePayload} payload The data required to create a charge.
 * @returns {Promise<StripeOperationResult<StripeCharge>>} A promise resolving to the created charge object or a detailed error.
 */
export async function createStripeCharge(
  payload: CreateChargePayload,
): Promise<StripeOperationResult<StripeCharge>> {
  return performStripeApiRequest<StripeCharge>("/charges", "POST", payload);
}

/**
 * Retrieves a Stripe Charge by its unique identifier.
 *
 * @param {string} chargeId The ID of the charge to retrieve.
 * @returns {Promise<StripeOperationResult<StripeCharge>>} A promise resolving to the charge object or a detailed error.
 */
export async function retrieveStripeCharge(
  chargeId: string,
): Promise<StripeOperationResult<StripeCharge>> {
  return performStripeApiRequest<StripeCharge>(`/charges/${chargeId}`, "GET");
}

/**
 * Lists Stripe Charges, with optional customer ID, pagination, and filtering.
 *
 * @param {string} [customerId] Optional customer ID to filter charges belonging to a specific customer.
 * @param {ListOptions} [options] Optional parameters for listing charges.
 * @returns {Promise<StripeOperationResult<ListResponse<StripeCharge>>>} A promise resolving to a list of charge objects or a detailed error.
 */
export async function listStripeCharges(
  customerId?: string,
  options?: ListOptions,
): Promise<StripeOperationResult<ListResponse<StripeCharge>>> {
  const params = new URLSearchParams(options as Record<string, string>);
  if (customerId) {
    params.set("customer", customerId);
  }
  const query = params.toString();
  return performStripeApiRequest<ListResponse<StripeCharge>>(
    `/charges${query ? `?${query}` : ""}`,
    "GET",
  );
}

// --- Checkout Session API ---

/**
 * Creates a new Stripe Checkout Session. This is typically used to redirect a customer
 * to a Stripe-hosted page to complete a payment, set up a payment method, or subscribe.
 *
 * @param {CreateCheckoutSessionPayload} payload The data required to create a checkout session.
 * @returns {Promise<StripeOperationResult<StripeCheckoutSession>>} A promise resolving to the created checkout session object or a detailed error.
 */
export async function createStripeCheckoutSession(
  payload: CreateCheckoutSessionPayload,
): Promise<StripeOperationResult<StripeCheckoutSession>> {
  return performStripeApiRequest<StripeCheckoutSession>("/checkout/sessions", "POST", payload);
}

/**
 * Retrieves a Stripe Checkout Session by its unique identifier.
 *
 * @param {string} sessionId The ID of the checkout session to retrieve.
 * @returns {Promise<StripeOperationResult<StripeCheckoutSession>>} A promise resolving to the checkout session object or a detailed error.
 */
export async function retrieveStripeCheckoutSession(
  sessionId: string,
): Promise<StripeOperationResult<StripeCheckoutSession>> {
  return performStripeApiRequest<StripeCheckoutSession>(`/checkout/sessions/${sessionId}`, "GET");
}

// --- Webhook Simulation / Processing ---

/**
 * Simulates the client-side processing or notification for a Stripe webhook event.
 * In a real-world scenario, the client wouldn't `create` a webhook event directly.
 * Instead, the backend would receive the event from Stripe and then notify the client
 * (e.g., via WebSockets or polling) or trigger client-side state updates.
 * This function models the client *receiving* and *acknowledging* such an event,
 * and performing client-side logic based on the event type.
 *
 * @param {StripeWebhookEvent} event The webhook event object to process.
 * @returns {Promise<StripeOperationResult<boolean>>} A promise resolving to true on successful processing or a detailed error.
 */
export async function processStripeWebhookEvent(
  event: StripeWebhookEvent,
): Promise<StripeOperationResult<boolean>> {
  console.log(`Processing simulated webhook event: ${event.type} (ID: ${event.id})`, event.data.object);

  // In a real application, this would involve dispatching a local event, updating a global store,
  // or triggering a refetch of relevant data based on the event type.
  // For simulation, we log and acknowledge receipt.
  switch (event.type) {
    case "customer.created":
    case "customer.updated":
      console.log(`  Client-side handler: Customer ${event.data.object.id} was ${event.type.split('.')[1]}.`);
      // Example: Dispatch an event to update customer data in UI
      // eventBus.dispatch('customerUpdated', event.data.object as StripeCustomer);
      break;
    case "customer.deleted":
      console.log(`  Client-side handler: Customer ${event.data.object.id} was deleted.`);
      // eventBus.dispatch('customerDeleted', event.data.object.id);
      break;
    case "invoice.payment_succeeded":
      console.log(`  Client-side handler: Invoice ${event.data.object.id} payment succeeded.`);
      // eventBus.dispatch('invoicePaid', event.data.object as StripeInvoice);
      break;
    case "invoice.payment_failed":
      console.log(`  Client-side handler: Invoice ${event.data.object.id} payment failed.`, (event.data.object as StripeInvoice).last_payment_error);
      // eventBus.dispatch('invoicePaymentFailed', event.data.object as StripeInvoice);
      break;
    case "subscription.created":
    case "subscription.updated":
      console.log(`  Client-side handler: Subscription ${event.data.object.id} was ${event.type.split('.')[1]}. Status: ${(event.data.object as StripeSubscription).status}`);
      // eventBus.dispatch('subscriptionUpdated', event.data.object as StripeSubscription);
      break;
    case "subscription.deleted":
      console.log(`  Client-side handler: Subscription ${event.data.object.id} was deleted/canceled.`);
      // eventBus.dispatch('subscriptionCanceled', event.data.object.id);
      break;
    case "charge.succeeded":
      console.log(`  Client-side handler: Charge ${event.data.object.id} succeeded for amount ${(event.data.object as StripeCharge).amount}.`);
      // eventBus.dispatch('chargeSucceeded', event.data.object as StripeCharge);
      break;
    case "checkout.session.completed":
      console.log(`  Client-side handler: Checkout Session ${event.data.object.id} completed.`);
      // eventBus.dispatch('checkoutCompleted', event.data.object as StripeCheckoutSession);
      break;
    default:
      console.log(`  Client-side handler: Unhandled Stripe event type: ${event.type}.`);
      break;
  }

  // Simulate a backend acknowledgement or successful client-side side-effect processing
  // In a real client-side, this function would complete if client-side logic ran successfully.
  // The backend would handle the actual acknowledgement to Stripe.
  return Promise.resolve({ success: true, data: true, message: `Webhook event ${event.id} processed.` });
}