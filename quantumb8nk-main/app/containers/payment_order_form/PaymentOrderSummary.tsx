// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { useFormikContext } from "formik";
import React, { useEffect, useState } from "react";
import { isNil, isEmpty } from "lodash";
import moment from "moment";
import ReactTooltip from "react-tooltip";
import {
  Rate,
  useCanRequestQuoteQuery,
  useCreateQuoteInlineMutation,
} from "~/generated/dashboard/graphqlSchema";
import useErrorBanner from "~/common/utilities/useErrorBanner";
import useUserTimezone from "~/common/utilities/useUserTimezone";
import {
  CURRENCY_SYMBOLS_BY_ISO_CODE,
  ForeignExchangeAmountEnum,
} from "../../constants";
import { FormValues } from "../../constants/payment_order_form";
import { Alert, Button, Card, Icon } from "../../../common/ui-components";
import PendingApprovalsContainer from "./PendingApprovalsContainer";
import MatchingPaymentOrderAlert from "./MatchingPaymentOrderAlert";
import sanitizeAmount, {
  getCurrencyDecimalScale,
} from "../../../common/utilities/sanitizeAmount";
import { sanitizeMetadata } from "./PaymentOrderCreateUtils";

interface PaymentOrderSummaryProps {
  originatingAccountLabel: string;
  receivingAccountLabel: string;
  sourcePaymentOrderId: string | null;
  isEditForm: boolean;
  setDisableCreate: (disableCreate: boolean) => void;
  createQuotesFromPOFormEnabled: boolean;
}

function getCurrencySymbol(isoCode?: string) {
  if (isoCode === undefined) {
    return "";
  }
  // find symbol by iso code, otherwise try Intl.NumberFormat
  const currencyString = CURRENCY_SYMBOLS_BY_ISO_CODE[isoCode]
    ? `${CURRENCY_SYMBOLS_BY_ISO_CODE[isoCode] as string} ${isoCode}`
    : Intl.NumberFormat("en-US", {
        style: "currency",
        currency: isoCode,
      }).format(0);
  // Break the string into two parts and get the currency symbol
  const [currencySymbol] = currencyString.replace(/0(\.0+)?/, "").split(" ");
  // If the currency symbol is the same as the currency iso code, then the currency symbol is not needed
  return currencySymbol.trim() === isoCode ? isoCode : currencySymbol;
}

function PaymentOrderSummary({
  originatingAccountLabel,
  receivingAccountLabel,
  sourcePaymentOrderId,
  isEditForm,
  setDisableCreate,
  createQuotesFromPOFormEnabled,
}: PaymentOrderSummaryProps) {
  const userTimeZone = useUserTimezone();
  const {
    values: {
      amount,
      amountType,
      targetCurrency,
      currency,
      direction,
      paymentType,
      originatingAccountId,
      receivingAccountId,
      invoice,
      effectiveDate,
      metadata,
      foreignExchangePaymentEnabled,
    },
  } = useFormikContext<FormValues>();
  const flashError = useErrorBanner();
  const [createQuoteInlineMutation, { loading }] =
    useCreateQuoteInlineMutation();
  const [rate, setRate] = useState<Rate>();
  const [summaryTextLeft, setSummaryTextLeft] = useState("Select Account");
  const [summaryTextRight, setSummaryTextRight] = useState("Select Account");

  const disableCalculateExchange =
    !originatingAccountId || !currency || !targetCurrency || !amount;

  const { data } = useCanRequestQuoteQuery({
    variables: {
      internalAccountId: originatingAccountId,
    },
    skip: !originatingAccountId,
  });

  const foreignExchangeSupportedAccount =
    data?.canRequestQuote?.foreignExchangePaymentSupport;

  const calculateExchange = () => {
    const currentDate = moment(new Date())
      .tz(userTimeZone)
      .format("YYYY-MM-DD");

    const decimalScale = foreignExchangePaymentEnabled
      ? getCurrencyDecimalScale(targetCurrency)
      : getCurrencyDecimalScale(currency);

    createQuoteInlineMutation({
      variables: {
        input: {
          input: {
            internalAccountId: originatingAccountId || "",
            baseCurrency: currency,
            targetCurrency: targetCurrency || "",
            baseAmount:
              amountType === ForeignExchangeAmountEnum.BaseAmount
                ? sanitizeAmount(amount, decimalScale)
                : null,
            targetAmount:
              !amountType ||
              amountType === ForeignExchangeAmountEnum.TargetAmount
                ? sanitizeAmount(amount, decimalScale)
                : null,
            effectiveAt: effectiveDate || currentDate,
            metadata: JSON.stringify(sanitizeMetadata(metadata, [])),
          },
        },
      },
    })
      .then(({ data: response }) => {
        if (response?.requestQuote?.errors) {
          flashError(response?.requestQuote.errors);
        } else {
          const quoteRate = response?.requestQuote?.quote?.rate;

          if (quoteRate) {
            setRate(quoteRate as Rate);
          }
        }
      })
      .catch(() => {
        flashError("An error occurred");
      });
  };

  useEffect(() => {
    if (
      direction === "credit" &&
      originatingAccountLabel &&
      receivingAccountLabel
    ) {
      setSummaryTextLeft(originatingAccountLabel);
      setSummaryTextRight(receivingAccountLabel);
    }

    if (
      direction === "debit" &&
      originatingAccountLabel &&
      receivingAccountLabel
    ) {
      setSummaryTextLeft(receivingAccountLabel);
      setSummaryTextRight(originatingAccountLabel);
    }

    if (
      direction === "credit" &&
      originatingAccountLabel &&
      !receivingAccountLabel
    ) {
      setSummaryTextLeft(originatingAccountLabel);
    }

    if (
      direction === "debit" &&
      originatingAccountLabel &&
      !receivingAccountLabel
    ) {
      setSummaryTextLeft(receivingAccountLabel);
    }

    setRate(undefined);
  }, [
    direction,
    originatingAccountLabel,
    receivingAccountLabel,
    createQuotesFromPOFormEnabled,
  ]);

  useEffect(() => {
    const disableCreate =
      isNil(amount) ||
      isNil(paymentType) ||
      isEmpty(originatingAccountId) ||
      isEmpty(receivingAccountId) ||
      isEmpty(direction);

    setDisableCreate(disableCreate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amount,
    paymentType,
    originatingAccountId,
    receivingAccountId,
    direction,
  ]);

  useEffect(() => {
    const canCalculateExchange =
      originatingAccountId && currency && targetCurrency && amount;

    if (!foreignExchangePaymentEnabled) {
      setRate(undefined);
    }

    if (canCalculateExchange && foreignExchangeSupportedAccount) {
      calculateExchange();
    }

    // (mchaudhry05): eslint complains about calculateExchange not being
    // in the dependency array, adding it results in unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    originatingAccountId,
    effectiveDate,
    amountType,
    amount,
    targetCurrency,
    currency,
    foreignExchangePaymentEnabled,
    foreignExchangeSupportedAccount,
  ]);

  function getAmountString(inputCurrency = currency) {
    const decimalScale = getCurrencyDecimalScale(inputCurrency);

    if (amount && (sourcePaymentOrderId || isEditForm)) {
      // amount will be a string from the backend
      // if edited, amount turns into a number
      if (typeof amount === "string") {
        return amount;
      }

      if (typeof amount === "number") {
        return `${getCurrencySymbol(inputCurrency)} ${Intl.NumberFormat(
          "en-US",
          {
            style: "decimal",
            minimumFractionDigits: decimalScale,
          },
        ).format(amount)}`;
      }
    } else if (amount && !sourcePaymentOrderId) {
      return `${getCurrencySymbol(inputCurrency)} ${Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: decimalScale,
      }).format(amount as number)}`;
    }

    return `${getCurrencySymbol(inputCurrency)} 0.00`;
  }

  const rateRefreshButton = (
    <div className="mt-2 flex flex-row items-center justify-center">
      <Button
        buttonType="link"
        disabled={loading || disableCalculateExchange}
        onClick={() => {
          calculateExchange();
        }}
      >
        <Icon
          iconName="autorenew"
          color="currentColor"
          size="s"
          className="mr-1 text-gray-700"
        />
      </Button>
      <div className="cursor-pointer">
        <span data-tip="Subject to change when payment is executed">
          {rate?.prettyRate}
        </span>
        <ReactTooltip
          data-place="bottom"
          place="bottom"
          data-type="dark"
          data-effect="float"
        />
      </div>
    </div>
  );

  function renderOriginatingSummary() {
    if (
      foreignExchangePaymentEnabled &&
      (!amountType || amountType === ForeignExchangeAmountEnum.TargetAmount)
    ) {
      if (foreignExchangeSupportedAccount && rate) {
        return (
          <p className="mt-2 text-sm ">
            {rate?.prettyBaseAmount} {currency}
          </p>
        );
      }
      return <p className="mt-2 text-sm">Variable</p>;
    }
    return (
      <p className="mt-2 text-sm">
        {getAmountString()} {currency}
      </p>
    );
  }

  function renderReceivingSummary() {
    if (
      foreignExchangePaymentEnabled &&
      amountType === ForeignExchangeAmountEnum.BaseAmount
    ) {
      if (foreignExchangeSupportedAccount && rate) {
        return (
          <p className="mt-2 text-sm">
            {rate?.prettyTargetAmount} {targetCurrency}
          </p>
        );
      }
      return (
        <div className="flex items-center">
          <p className="mt-2 text-sm">Variable</p>
        </div>
      );
    }
    return (
      <p className="mt-2 text-sm">
        {getAmountString(targetCurrency)} {targetCurrency || currency}
      </p>
    );
  }

  return (
    <>
      <Card>
        <div className="flex h-full w-full text-xs">
          <div className="flex w-full flex-col items-start text-left">
            <span className="h-full">
              <span className="text-nowrap text-text-muted">
                {direction === "credit" ? "Pay from " : "Charge from "}
              </span>
              <span className="flex-wrap text-black">{summaryTextLeft}</span>
            </span>
            {renderOriginatingSummary()}
          </div>

          <div className="mx-4 flex w-fit flex-col items-center justify-center">
            <Icon
              iconName="arrow_forward"
              color="currentColor"
              size="s"
              className="mr-1 text-gray-700"
            />
            {rate && foreignExchangePaymentEnabled && rateRefreshButton}
          </div>

          <div className="flex w-full flex-col items-end text-right">
            <span className="h-full">
              <span className="text-black">{summaryTextRight} </span>
              <span className="text-nowrap text-text-muted">
                {` via ${paymentType?.toUpperCase() || "Select Payment Type"}`}
              </span>
            </span>
            {renderReceivingSummary()}
          </div>
        </div>

        {invoice && (
          <div className="mx-6 mb-4">
            <Alert alertType="info">
              This payment is associated with the invoice{" "}
              <a href={`/invoicing/invoices/${invoice.id}`}>{invoice.number}</a>
            </Alert>
          </div>
        )}
        <MatchingPaymentOrderAlert
          sourcePaymentOrderId={sourcePaymentOrderId}
          isEditForm={isEditForm}
        />
      </Card>
      <PendingApprovalsContainer />
    </>
  );
}

export default PaymentOrderSummary;
