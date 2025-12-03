// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { isUndefined } from "lodash";
import LedgerTransactionForm from "./LedgerTransactionForm";
import { EntryPair } from "../../constants/ledger_transaction_form/index";
import {
  calculateInitialCurrencySum,
  makeBlankLedgerEntry,
  translateEntries,
} from "./utilities";
import {
  useGetLedgerTransactionQuery,
  LedgerEntry as LedgerEntryNode,
} from "../../../generated/dashboard/graphqlSchema";

interface LedgerTransactionFormContainerProps {
  match: {
    params: {
      ledgerId: string;
      ledgerTransactionId: string;
    };
  };
}

function LedgerTransactionFormContainer({
  match: {
    params: { ledgerId, ledgerTransactionId },
  },
}: LedgerTransactionFormContainerProps) {
  const { data, loading, error } = useGetLedgerTransactionQuery({
    variables: {
      id: ledgerTransactionId,
    },
    skip: !ledgerTransactionId,
  });
  if (isUndefined(ledgerTransactionId)) {
    const initialValues = {
      description: null,
      effectiveDate: "",
      externalId: null,
      metadata: "{}",
      status: null,
      ledgerId,
      ledgerEntries: [makeBlankLedgerEntry(), makeBlankLedgerEntry()],
    };
    return (
      <LedgerTransactionForm
        initialValues={initialValues}
        ledgerTransactionId=""
        initialEntryCurrencySum={{} as Record<string, EntryPair>}
      />
    );
  }
  if (!data || loading || error) {
    return <> </>;
  }

  const { ledgerTransaction, ledgerEntries } = data;

  const initialLedgerEntries = translateEntries(
    ledgerEntries?.nodes as Array<LedgerEntryNode>,
  );
  const initialValues = {
    description: ledgerTransaction?.description ?? null,
    effectiveDate: (ledgerTransaction?.effectiveAt as string) ?? "",
    status: ledgerTransaction?.status ?? null,
    externalId: ledgerTransaction?.externalId ?? null,
    ledgerEntries: initialLedgerEntries,
    metadata: (ledgerTransaction?.metadataJson as string) ?? "{}",
    ledgerId: ledgerTransaction?.ledgerId ?? "",
  };

  return (
    <LedgerTransactionForm
      initialValues={initialValues}
      ledgerTransactionId={ledgerTransactionId}
      initialEntryCurrencySum={calculateInitialCurrencySum(
        initialLedgerEntries,
      )}
    />
  );
}

export default LedgerTransactionFormContainer;
