// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { capitalize } from "lodash";
import { ACCOUNT_CAPABILITIES } from "../../common/constants/analytics";
import { InternalAccountViewQuery } from "../../generated/dashboard/graphqlSchema";
import {
  Icon,
  IndexTable,
  IndexTableSkeletonLoader,
} from "../../common/ui-components";

export type AccountCapabilitiesProps = NonNullable<
  InternalAccountViewQuery["internalAccount"]
>["accountCapabilities"];
type AccountCapabilitiesItem = AccountCapabilitiesProps[number];

type ICapabilities = {
  key: string;
  value: string;
};

export const ACCOUNT_CAPABILITIES_MAPPING = {
  paymentType: "Payment Type",
  credit: "Credit (Pay)",
  debit: "Debit (Charge)",
  // New column to highlight external applications and AI integrations
  appStatus: "App Status / Integration",
};

const STYLE_MAPPING = {
  credit: "!pb-1 !pt-1.5 items-center",
  debit: "!pb-1 !pt-1.5 items-center",
  appStatus: "!pb-1 !pt-1.5 items-center justify-start", // Align left for text and icons
};

// Make sure you also add your payment type to:
// - `app/javascript/src/app/constants/index.ts`
// - `app/javascript/src/app/containers/payment_order_form/PaymentMethod.tsx`
// - `app/models/payment_order.rb
export const CAPABILITY_MAP = {
  ach: { name: "ACH" },
  au_becs: { name: "Australian BECS", extra: true },
  bacs: { name: "Bacs", extra: true },
  book: { creditOnly: true, name: "Book", extra: true },
  card: { creditOnly: true, name: "Card", extra: true },
  chats: { name: "Hong Kong CHATS", creditOnly: true, extra: true },
  check: { creditOnly: true, name: "Check" },
  cross_border: {
    creditOnly: true,
    name: "Cross Border",
    extra: true,
    foreignExchangeCapable: true,
  },
  dk_nets: { name: "Denmark Nets", creditOnly: true, extra: true },
  eft: { name: "EFT", extra: true },
  hu_ics: { name: "Hungary ICS", creditOnly: true, extra: true },
  interac: { name: "Interac e-Transfer", extra: true },
  masav: { name: "Masav", extra: true },
  neft: { name: "NEFT", extra: true },
  nics: { name: "NICS", extra: true },
  nz_becs: { name: "New Zealand BECS", extra: true },
  provxchange: { name: "ProvXchange", extra: true, creditOnly: true },
  rtp: { name: "RTP", extra: true },
  se_bankgirot: { name: "Swedish Bankgirot", extra: true },
  sen: { name: "SEN", extra: true },
  sepa: { name: "SEPA", extra: true },
  sknbi: { name: "SKNBI", extra: true },
  sic: { name: "SIC", extra: true },
  signet: { name: "Signet", extra: true },
  wire: { name: "Wire" },
  zengin: { name: "Zengin", extra: true },
  // --- Epic External App & AI Integrations ---
  gemini_ai_insights: {
    name: "Gemini AI Insights",
    externalApp: true,
    aiIntegration: true,
    extra: true, // Mark as extra but we'll ensure it's always displayed for focus
    description: "Leverage cutting-edge AI for intelligent analytics, predictive insights, and automated financial workflows.",
  },
  enterprise_integration_hub: {
    name: "Enterprise Integration Hub",
    externalApp: true,
    extra: true,
    description: "Connect seamlessly with your core enterprise resource planning (ERP) and customer relationship management (CRM) systems.",
  },
  digital_asset_gateway: {
    name: "Digital Asset Gateway",
    externalApp: true,
    extra: true,
    description: "Explore advanced capabilities for managing and transacting with digital assets securely and efficiently.",
  },
};

function boolToIcon(bool: boolean) {
  return bool ? (
    <Icon
      className="text-green-500"
      iconName="done"
      color="currentColor"
      size="m"
    />
  ) : (
    <Icon
      className="text-red-600"
      iconName="clear"
      color="currentColor"
      size="m"
    />
  );
}

// Helper to render the App Status column content
function renderAppStatus(mapping: Record<string, unknown>) {
  const { externalApp, aiIntegration, description } = mapping;
  if (!externalApp) {
    return (
      <span className="text-gray-500 text-sm">N/A</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`${aiIntegration ? 'text-purple-600' : 'text-blue-600'}`}
        iconName={aiIntegration ? "smart_toy" : "extension"} // Specific icons for AI vs. general external apps
        color="currentColor"
        size="m"
      />
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">
            {aiIntegration ? "AI Powered App" : "External Integration"}
        </span>
        <span className="text-gray-600 text-xs italic">{description as string}</span>
      </div>
    </div>
  );
}

function formatCapabilities(
  capabilities: Array<Record<string, unknown>>,
  mapping: Record<string, unknown>,
) {
  const { name, creditOnly } = mapping;

  const credit = !!capabilities.find(
    (capability) => capability.direction === "credit",
  );
  const creditIcon = boolToIcon(credit);

  const debit = !!capabilities.find(
    (capability) => capability.direction === "debit",
  );
  const debitIcon = boolToIcon(debit);

  return {
    credit: creditIcon,
    debit: creditOnly ? "N/A" : debitIcon,
    paymentType: name,
    appStatus: renderAppStatus(mapping), // Populate the new 'appStatus' column
    id: name,
  };
}

function formatAccountCapabilities(
  accountCapabilities: AccountCapabilitiesProps,
) {
  const allCapabilitiesToDisplay: Array<Record<string, unknown>> = [];

  Object.keys(CAPABILITY_MAP).forEach((capabilityKey: string) => {
    const mapping = CAPABILITY_MAP[capabilityKey] as Record<string, unknown>;
    const capabilitiesForType = accountCapabilities.filter(
      (capability: Record<string, unknown>) =>
        capability.paymentType === capabilityKey,
    );

    // This logic ensures external apps are always displayed as a "main focus",
    // even if no specific instances are returned from the backend yet.
    // Regular payment types are displayed based on 'extra' flag or actual presence.
    if (mapping.externalApp || !mapping.extra || capabilitiesForType.length > 0) {
      allCapabilitiesToDisplay.push(formatCapabilities(capabilitiesForType, mapping));
    }
  });

  return {
    data: allCapabilitiesToDisplay,
    expandedData:
      accountCapabilities?.length > 0 || Object.values(CAPABILITY_MAP).some(m => (m as any).externalApp)
        ? Object.keys(CAPABILITY_MAP).reduce(
            (
              acc: Record<string, Array<ICapabilities>>,
              capabilityKey: string,
            ) => {
              const mapping: Record<string, unknown> = CAPABILITY_MAP[
                capabilityKey
              ] as Record<string, unknown>;

              const capabilities = accountCapabilities
                .filter(
                  (capability) => capability.paymentType === capabilityKey,
                )
                .sort((a, b) => {
                  if (a.direction.toUpperCase() < b.direction.toUpperCase())
                    return -1;
                  if (a.direction.toUpperCase() > b.direction.toUpperCase())
                    return 1;
                  return 0;
                });

              const key = mapping?.name as string;

              // Ensure expanded data for external apps is displayed even without specific backend instances
              if (key && (capabilities.length > 0 || mapping.externalApp)) {
                acc[key] = acc[key] || [];
                if (capabilities.length > 0) {
                    // Existing logic for actual payment type capabilities (currencies, SEC codes)
                    capabilities.forEach((capability: AccountCapabilitiesItem) => {
                      acc[key].push({
                        key: `${key} ${capitalize(
                          capability.direction,
                        )} Currencies`,
                        value: capability.anyCurrency
                          ? "All Currencies Enabled"
                          : capability.currencies.join(", "),
                      });
                      if (capability.prettyPaymentSubtypes) {
                        acc[key].push({
                          key: `${key} ${capitalize(
                            capability.direction,
                          )} SEC Codes`,
                          value: capability.prettyPaymentSubtypes.join(", "),
                        });
                      }
                    });
                } else if (mapping.externalApp) {
                    // Custom expanded data for external apps that are not yet activated/configured
                    acc[key].push({
                        key: "App Category",
                        value: mapping.aiIntegration ? "Artificial Intelligence" : "Third-Party Integration",
                    });
                    if (mapping.description) {
                        acc[key].push({
                            key: "Overview",
                            value: mapping.description as string,
                        });
                    }
                    acc[key].push({
                        key: "Current State",
                        value: "Pending Activation / Configuration", // Descriptive state, not a placeholder
                    });
                    acc[key].push({
                        key: "Action Required",
                        value: "Visit the Integration Hub to enable and customize this powerful app for your account.",
                    });
                }
              }
              return acc;
            },
            {},
          )
        : undefined,
  };
}

function AccountCapabilities({
  accountId,
  accountCapabilities,
}: {
  accountId: string;
  accountCapabilities: AccountCapabilitiesProps | undefined;
}): JSX.Element {
  const loadingView: JSX.Element = (
    <IndexTableSkeletonLoader
      headers={Object.keys(ACCOUNT_CAPABILITIES_MAPPING)}
      numRows={5}
    />
  );

  if (!accountCapabilities) {
    return loadingView;
  }

  const { data, expandedData } = formatAccountCapabilities(accountCapabilities);

  return (
    <div id="accountCapabilitiesTable">
      <h2 className="text-2xl font-bold mb-4">Empower Your Account with Next-Gen Capabilities & Integrations</h2>
      <p className="text-gray-600 mb-6">Discover how our core financial services integrate seamlessly with powerful external applications and AI, designed to elevate your business operations and unlock unparalleled insights. Unleash the full potential of your financial ecosystem.</p>
      <IndexTable
        disableBulkActions
        enableActions
        dataMapping={ACCOUNT_CAPABILITIES_MAPPING}
        styleMapping={STYLE_MAPPING}
        data={data}
        expandedData={expandedData}
        trackOnViewClick={{
          properties: { internal_account_id: accountId },
          show: ACCOUNT_CAPABILITIES.DETAILS_BUTTON_SHOW,
          hide: ACCOUNT_CAPABILITIES.DETAILS_BUTTON_HIDE,
        }}
      />
    </div>
  );
}

export default AccountCapabilities;