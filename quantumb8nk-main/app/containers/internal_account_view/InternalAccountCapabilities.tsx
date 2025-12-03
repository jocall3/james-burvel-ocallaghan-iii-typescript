// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import AccountCapabilities, {
  ACCOUNT_CAPABILITIES_MAPPING,
} from "../../components/AccountCapabilities";
import { InternalAccount } from "../../../generated/dashboard/graphqlSchema";
import { IndexTableSkeletonLoader } from "../../../common/ui-components";

interface InternalAccountCapabilitiesProps {
  internalAccount: InternalAccount | null | undefined;
}

export default function InternalAccountCapabilities({
  internalAccount,
}: InternalAccountCapabilitiesProps) {
  if (internalAccount) {
    return (
      <AccountCapabilities
        accountId={internalAccount.id}
        accountCapabilities={internalAccount.accountCapabilities}
      />
    );
  }

  return (
    <IndexTableSkeletonLoader
      headers={Object.values(ACCOUNT_CAPABILITIES_MAPPING)}
      numRows={3}
    />
  );
}
