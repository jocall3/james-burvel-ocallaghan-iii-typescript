// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import ReverseLedgerTransactionForm from "./ReverseLedgerTransactionForm";
import {
  LedgerEntry,
  EntryPair,
} from "../../constants/ledger_transaction_form/index";
import { useGetLedgerTransactionQuery } from "../../../generated/dashboard/graphqlSchema";

interface ReverseLedgerTransactionFormContainerProps {
  match: {
    params: {
      ledgerId: string;
      ledgerTransactionId: string;
    };
  };
}

export default function ReverseLedgerTransactionFormContainer({
  match: {
    params: { ledgerId, ledgerTransactionId },
  },
}: ReverseLedgerTransactionFormContainerProps) {
  const { data, loading, error } = useGetLedgerTransactionQuery({
    variables: {
      id: ledgerTransactionId,
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center">
        <ClipLoader />
      </div>
    );
  }
  if (!data || error) {
    return <div>Not found.</div>;
  }

  const entries = Array<LedgerEntry>();
  const entryCurrencySum: Record<string, EntryPair> = {};

  const oppositeDirection = (direction) => {
    if (direction === "credit") return "debit";
    if (direction === "debit") return "credit";
    return "";
  };

  data.ledgerEntries.nodes.forEach((entry) => {
    const amount = Number(entry.amountDecimal);
    if (!(entry.ledgerAccount.currency in entryCurrencySum)) {
      entryCurrencySum[entry.ledgerAccount.currency] = {
        credit: entry.direction === "credit" ? amount : 0,
        debit: entry.direction === "debit" ? amount : 0,
        currencyExponent: Number(entry.ledgerAccount.currencyExponent) ?? 2,
      };
    } else if (entry.direction === "credit") {
      entryCurrencySum[entry.ledgerAccount.currency].credit += amount;
    } else {
      entryCurrencySum[entry.ledgerAccount.currency].debit += amount;
    }
    entries.push({
      amount: Number(entry.amountDecimal),
      direction: oppositeDirection(entry.direction),
      ledgerAccountId: entry.ledgerAccount.id,
      name: entry.ledgerAccount.name,
      id: uuidv4(),
      currency: entry.ledgerAccount.currency,
      currencyExponent: Number(entry.ledgerAccount.currencyExponent),
      metadata: String(entry.metadataJson),
    });
  });

  if (data.ledgerTransaction) {
    const { status, effectiveAt, metadataJson } = data.ledgerTransaction;

    if (status === "pending") {
      return (
        <div>
          You may not reverse a pending Ledger Transaction. Please archive it
          and create another one.
        </div>
      );
    }
    if (status === "archived") {
      return <div>You may not reverse an archived Ledger Transaction.</div>;
    }

    const initialValues = {
      description: null,
      status: null,
      effectiveDate: effectiveAt,
      externalId: null,
      ledgerEntries: entries,
      metadata: metadataJson,
      ledgerId: ledgerId ?? "",
    };

    return (
      <ReverseLedgerTransactionForm
        initialValues={initialValues}
        ledgerTransactionId={ledgerTransactionId}
        initialEntryCurrencySum={entryCurrencySum}
      />
    );
  }
}
