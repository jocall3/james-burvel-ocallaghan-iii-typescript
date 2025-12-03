// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { TRANSACTION } from "~/generated/dashboard/types/resources";
import { getInternalAccountTransactionSearchComponents } from "~/common/search_components/internalAccountTransactionSearchComponents";
import { mapTransactionQueryToVariables } from "../../../common/search_components/transactionSearchComponents";
import { TransactionsHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import ListView from "../../components/ListView";
import { getDrawerContent } from "../../../common/utilities/getDrawerContent";
import { rowHighlightFunction } from "../TransactionsHome";

interface InternalAccountTransactionsProps {
  internalAccountId: string;
  currency: string;
  scrollX?: boolean;
}

function InternalAccountTransactionsTable({
  internalAccountId,
  currency,
  scrollX = false,
}: InternalAccountTransactionsProps) {
  const searchComponents = getInternalAccountTransactionSearchComponents();

  return (
    <ListView
      renderDrawerContent={getDrawerContent}
      resource={TRANSACTION}
      graphqlDocument={TransactionsHomeDocument}
      constantQueryVariables={{
        internalAccountIds: [internalAccountId],
        currency,
      }}
      mapQueryToVariables={mapTransactionQueryToVariables}
      additionalSearchComponents={searchComponents.additionalComponents}
      defaultSearchComponents={searchComponents.defaultComponents}
      rowHighlightFunction={rowHighlightFunction}
      customizableColumns
      scrollX={scrollX}
    />
  );
}

export default InternalAccountTransactionsTable;
