// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import LedgerAccountCategoryForm from "./LedgerAccountCategoryForm";
import { useLedgerViewQuery } from "../../../generated/dashboard/graphqlSchema";
import { ISO_CODES } from "../../constants";
import { CUSTOM_CURRENCY_OPTION } from "../../constants/ledger_account_form";

interface LedgerAccountCategoryFormContainerProps {
  match: {
    params: {
      ledgerId: string;
    };
  };
}

function LedgerAccountCategoryFormContainer({
  match: {
    params: { ledgerId },
  },
}: LedgerAccountCategoryFormContainerProps) {
  const { data, loading, error } = useLedgerViewQuery({
    variables: { id: ledgerId },
  });
  if (!data || !data.ledger || loading || error) {
    return <> </>;
  }

  const isCustomCurrency =
    !ISO_CODES.includes(data.ledger.currency ?? "") &&
    data.ledger.currency !== null;
  const initialValues = {
    id: "",
    name: "",
    currency: isCustomCurrency
      ? CUSTOM_CURRENCY_OPTION
      : data.ledger.currency ?? "",
    customCurrency: isCustomCurrency ? data.ledger.currency ?? "" : "",
    currencyExponent:
      isCustomCurrency && data.ledger.currencyExponent
        ? data.ledger.currencyExponent
        : null,
    description: "",
    normalBalance: "",
    ledgerId,
    metadata: {},
    category: [],
    categoryError: null,
  };

  return <LedgerAccountCategoryForm initialValues={initialValues} />;
}

export default LedgerAccountCategoryFormContainer;
