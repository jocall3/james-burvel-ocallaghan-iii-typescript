// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { v4 as uuidv4 } from "uuid";

import {
  LedgerEntry,
  EntryPair,
} from "../../constants/ledger_transaction_form";
import { LedgerEntry as LedgerEntryNode } from "../../../generated/dashboard/graphqlSchema";

export const makeBlankLedgerEntry = () => ({
  amount: NaN,
  direction: "",
  ledgerAccountId: "",
  name: "",
  currency: "",
  currencyExponent: NaN,
  id: uuidv4(),
  metadata: "{}",
});

/*
 * Translate entries from the type returned by the GraphQL API
 * to the type expected by LedgerTransactionForm.
 */
export const translateEntries = (entries: Array<LedgerEntryNode>) =>
  entries.map(({ amountDecimal, direction, ledgerAccount, metadataJson }) => ({
    amount: Number(amountDecimal),
    direction,
    ledgerAccountId: ledgerAccount.id,
    name: ledgerAccount.name,
    id: uuidv4(),
    currency: ledgerAccount.currency,
    currencyExponent: ledgerAccount.currencyExponent,
    metadata: metadataJson ? String(metadataJson) : "{}",
  }));

export const formatAmount = (amount: number, exponent: number) =>
  (amount / 10 ** exponent).toFixed(exponent);

export const conditionalRemove = (
  setEntryCurrencySum: React.Dispatch<
    React.SetStateAction<Record<string, EntryPair>>
  >,
  entryCurrencySum: Record<string, EntryPair>,
  ledgerEntries: Array<LedgerEntry>,
  index: number,
) => {
  const ledgerEntry = ledgerEntries[index];
  if ((ledgerEntry.amount ?? 0) > 0) {
    const newSum = { ...entryCurrencySum };
    const lastCurrencyEntry =
      ledgerEntries.filter((entry) => entry.currency === ledgerEntry.currency)
        .length === 1;

    if (lastCurrencyEntry) {
      delete newSum[ledgerEntry.currency];
    } else if (ledgerEntry.direction === "debit") {
      newSum[ledgerEntry.currency].debit -= ledgerEntry.amount;
    } else {
      newSum[ledgerEntry.currency].credit -= ledgerEntry.amount;
    }

    setEntryCurrencySum(newSum);
  }
};

export const calculateInitialCurrencySum = (
  ledgerEntries: LedgerEntry[],
): Record<string, EntryPair> => {
  const entryCurrencySum: Record<string, EntryPair> = {};

  ledgerEntries.forEach(({ amount, currency, currencyExponent, direction }) => {
    if (currency in entryCurrencySum) {
      if (direction === "credit") {
        entryCurrencySum[currency].credit += amount;
      } else if (direction === "debit") {
        entryCurrencySum[currency].debit += amount;
      }
    } else {
      entryCurrencySum[currency] = {
        credit: direction === "credit" ? amount : 0,
        debit: direction === "debit" ? amount : 0,
        currencyExponent,
      };
    }
  });

  return entryCurrencySum;
};
