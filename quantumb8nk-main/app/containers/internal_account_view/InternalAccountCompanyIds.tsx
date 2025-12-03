// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  IndexTable,
  IndexTableSkeletonLoader,
} from "../../../common/ui-components";
import {
  AccountCapability,
  InternalAccount,
} from "../../../generated/dashboard/graphqlSchema";
import {
  AccountCapabilitiesProps,
  CAPABILITY_MAP,
} from "../../components/AccountCapabilities";

const COMPANY_IDS_MAPPING = {
  direction: "Direction",
  identifier: "Company ID",
};

const CompanyIds = (
  accountCapabilities: AccountCapabilitiesProps,
): { credit: string | null; debit: string | null } => {
  const credit = accountCapabilities.find(
    (capability) => capability.direction === "credit",
  );
  const debit = accountCapabilities.find(
    (capability) => capability.direction === "debit",
  );
  return {
    credit: credit?.identifier || null,
    debit: debit?.identifier || null,
  };
};

interface InternalAccountCompanyIdsProps {
  internalAccount: InternalAccount | null | undefined;
}

function InternalAccountCompanyIds({
  internalAccount,
}: InternalAccountCompanyIdsProps) {
  if (!internalAccount) {
    return (
      <IndexTableSkeletonLoader
        headers={Object.values(COMPANY_IDS_MAPPING)}
        numRows={2}
      />
    );
  }

  const groupedByPaymentType: Record<
    string,
    Array<AccountCapability>
  > = internalAccount.accountCapabilities.reduce((acc, capability) => {
    const { paymentType } = capability;
    if (acc[paymentType]) {
      (acc[paymentType] as Array<AccountCapability>).push(capability);
    } else {
      acc[paymentType] = [capability];
    }

    return acc;
  }, {});

  return (
    <>
      {Object.keys(groupedByPaymentType)
        .filter((paymentType) =>
          // Filter out payment types that have no identifiers to show
          groupedByPaymentType[paymentType].some(
            (capbility) => capbility.identifier,
          ),
        )
        .map((paymentType) => (
          <div className="mb-4">
            <IndexTable
              data={[
                {
                  direction: "Credit",
                  identifier: CompanyIds(groupedByPaymentType[paymentType])
                    .credit,
                },
                {
                  direction: "Debit",
                  identifier: CompanyIds(groupedByPaymentType[paymentType])
                    .debit,
                },
              ]}
              dataMapping={{
                ...COMPANY_IDS_MAPPING,
                identifier: `${
                  (CAPABILITY_MAP[paymentType] as { name: string }).name
                } Company ID`,
              }}
            />
          </div>
        ))}
    </>
  );
}

export default InternalAccountCompanyIds;
