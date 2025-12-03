// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { LoadingLine } from "../../../common/ui-components";
import MetadataView from "../../components/MetadataView";
import { InternalAccount } from "../../../generated/dashboard/graphqlSchema";
import { INTERNAL_ACCOUNT } from "../../../generated/dashboard/types/resources";

interface InternalAccountMetadataProps {
  internalAccount: InternalAccount | null | undefined;
}

function InternalAccountMetadata({
  internalAccount,
}: InternalAccountMetadataProps) {
  if (internalAccount) {
    return (
      <MetadataView
        initialMetadata={
          JSON.parse(internalAccount.metadata) as Array<{
            key: string;
            value: string;
          }>
        }
        enableActions={false}
        resource={INTERNAL_ACCOUNT}
      />
    );
  }

  return (
    <div className="flex h-6 w-auto">
      <LoadingLine noHeight />
    </div>
  );
}

export default InternalAccountMetadata;
