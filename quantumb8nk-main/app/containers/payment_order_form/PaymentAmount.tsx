// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  Field,
  connect,
  FormikProps,
  FieldArray,
  ErrorMessage,
  FormikErrors,
  FormikTouched,
} from "formik";
import { cn } from "~/common/utilities/cn";
import { ForeignExchangeAmountEnum } from "~/app/constants";
import PaymentCurrencySelect from "./PaymentCurrencySelect";
import { ISO_CODES } from "../../../common/constants";
import { FormValues } from "../../constants/payment_order_form";
import {
  useAccountingLedgerViewQuery,
  AccountCapabilityFragment,
  PaymentTypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import AccountingCategorySelect from "./AccountingCategorySelect";
import AccountingClassSelect from "./AccountingClassSelect";
import { required } from "../../../common/ui-components/validations";
import FormikCurrencyInput from "../../../common/formik/FormikCurrencyInput";
import colors from "../../../common/styles/colors";
import {
  ActionItem,
  Button,
  FieldGroup,
  FieldsRow,
  FormSurface,
  Icon,
  Label,
  Popover,
  PopoverPanel,
  PopoverTrigger,
  SelectGroup,
} from "../../../common/ui-components";

interface PaymentAmountProps {
  fieldInvalid: (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => boolean;
  accountCapabilities?: Array<AccountCapabilityFragment> | null;
  isEditForm: boolean;
}

interface PopoverRenderProps {
  // eslint-disable-next-line react/no-unused-prop-types
  open: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  close: () => void;
}

function PaymentAmount({
  formik: { values, setFieldValue, errors, touched },
  fieldInvalid,
  accountCapabilities,
  isEditForm,
}: PaymentAmountProps & { formik: FormikProps<FormValues> }) {
  const { data: ledgerData } = useAccountingLedgerViewQuery();
  const [amountFocused, setAmountFocused] = useState<boolean>(false);

  const validateCurrency = (value: string): string | undefined => {
    if (values.invoice && values.invoice.currency !== value) {
      return "Currency does not match invoice currency";
    }
    return undefined;
  };

  const validateAmount = (value: string): string | undefined => {
    const requiredAmount = required(value);
    if (requiredAmount) return requiredAmount;
    // Check for scientific notation.
    const upcased = value.toString().toUpperCase();
    if (upcased.includes("E") && upcased.includes("+"))
      return "Amount is too large";
    if (values.invoice && values.invoice.decimalizedAmount !== Number(value)) {
      return "Amount does not match invoice amount";
    }

    return undefined;
  };

  return (
    <div className="flex w-full flex-col gap-y-2">
      <FieldsRow columns={2}>
        <FieldGroup>
          <ErrorMessage
            name="currency"
            component="span"
            className="mt-1 pb-2 pl-2 text-xs text-text-critical"
          />
          <Label>
            {values.foreignExchangePaymentEnabled
              ? "Base Currency"
              : "Currency"}
          </Label>
          <Field
            id="currency"
            name="currency"
            component={PaymentCurrencySelect}
            validate={validateCurrency}
            options={ISO_CODES.map((code) => ({ value: code, label: code }))}
            classNamePrefix="react-select"
            className="currency-select"
            accountCapabilities={accountCapabilities}
            controlClassNames={amountFocused ? "border-r-0" : ""}
            disabled={
              values.foreignExchangePaymentEnabled ||
              (values.paymentType === PaymentTypeEnum.CrossBorder &&
                values.paymentSubtype)
            }
          />
        </FieldGroup>
        {values.foreignExchangePaymentEnabled && (
          <FieldGroup>
            <ErrorMessage
              name="targetCurrency"
              component="span"
              className="mt-1 pb-2 pl-2 text-xs text-text-critical"
            />
            <Label>Target Currency</Label>
            <Field
              id="targetCurrency"
              name="targetCurrency"
              component={PaymentCurrencySelect}
              validate={validateCurrency}
              options={ISO_CODES.map((code) => ({ value: code, label: code }))}
              classNamePrefix="react-select"
              className="currency-select"
              controlClassNames={amountFocused ? "border-r-0" : ""}
              disabled={
                values.paymentType === PaymentTypeEnum.CrossBorder &&
                values.paymentSubtype
              }
            />
          </FieldGroup>
        )}
      </FieldsRow>
      <FieldsRow columns={2} className="items-center">
        <FieldGroup className="w-1/2">
          <ErrorMessage
            name="amount"
            component="span"
            className="mt-1 text-xs text-text-critical"
          />
          <Label>Amount</Label>
          <Field
            id="amount"
            name="amount"
            component={FormikCurrencyInput}
            validate={validateAmount}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            className="h-8 flex-grow rounded-sm border border-border-default px-2 py-1 text-sm placeholder-gray-600 outline-none hover:border-gray-300 focus:border-l focus:border-blue-500 disabled:bg-gray-100"
          />
        </FieldGroup>
        {values.foreignExchangePaymentEnabled && (
          <FieldGroup>
            <Label className="mt-5" />
            <SelectGroup
              labelClasses="font-normal text-sm"
              selectOptions={[
                {
                  text: "Base Amount",
                  value: ForeignExchangeAmountEnum.BaseAmount,
                  id: ForeignExchangeAmountEnum.BaseAmount,
                },
                {
                  text: "Target Amount",
                  value: ForeignExchangeAmountEnum.TargetAmount,
                  id: ForeignExchangeAmountEnum.TargetAmount,
                },
              ]}
              onChange={(value) => {
                void setFieldValue("amountType", value);
              }}
              value={
                values.amountType || ForeignExchangeAmountEnum.TargetAmount
              }
            />
          </FieldGroup>
        )}
      </FieldsRow>

      <div className="flex flex-col pt-8">
        <FieldArray
          name="lineItems"
          render={(arrayHelpers) => (
            <FormSurface
              heading="Line Items"
              optional
              initialShowFormFields
              customButton={
                <div className="flex gap-2">
                  {values?.lineItems && values.lineItems.length > 0 && (
                    <Button
                      buttonHeight="extra-small"
                      onClick={() => {
                        void setFieldValue("lineItems", []);
                      }}
                    >
                      <Icon iconName="add_to_trash" size="s" />
                      Delete All
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      arrayHelpers.push({
                        description: "",
                        amount: "",
                        metadata: [],
                        accountingDetails: [],
                      });
                    }}
                    buttonHeight="extra-small"
                  >
                    <Icon iconName="add" />
                    Add
                    <span className="sr-only"> Line Item</span>
                  </Button>
                </div>
              }
            >
              {values?.lineItems && values.lineItems.length > 0 && (
                <div className="pt-4">
                  <div className="flex w-full flex-col gap-y-4">
                    {!errors.amount &&
                      !errors.currency &&
                      (values.lineItems?.length ?? 0) > 0 && (
                        <span className="text-xs">
                          Line Items will sum to the total amount
                        </span>
                      )}
                    {(values?.lineItems || []).map((lineItem, index) => {
                      const key = `lineItems.${index}`;
                      const { metadata } = lineItem;

                      return (
                        <div key={key} className="flex w-full flex-col gap-y-4">
                          {/* Line Item Fields */}
                          <div className="flex w-full flex-row gap-4">
                            <div className="flex-1 flex-col">
                              <Field
                                id={`lineItems[${index}].description`}
                                name={`lineItems[${index}].description`}
                                placeholder="Item Name"
                                className={cn(
                                  "h-8 w-full rounded-sm px-2 py-1 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                                  fieldInvalid(
                                    errors,
                                    touched,
                                    `lineItems[${index}].description`,
                                  )
                                    ? "border border-red-500"
                                    : " border border-border-default",
                                )}
                                value={lineItem.description}
                                validate={required}
                              />
                              <ErrorMessage
                                name={`lineItems[${index}].description`}
                                component="span"
                                className="text-xs text-text-critical"
                              />
                            </div>
                            <div className="flex-1 flex-col">
                              <Field
                                id={`lineItems[${index}].amount`}
                                name={`lineItems[${index}].amount`}
                                component={FormikCurrencyInput}
                                className={cn(
                                  "h-8 w-full rounded-sm px-2 py-1 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                                  fieldInvalid(
                                    errors,
                                    touched,
                                    `lineItems[${index}].amount`,
                                  )
                                    ? "border border-red-500"
                                    : "border border-border-default",
                                )}
                                validate={required}
                              />
                              <ErrorMessage
                                name={`lineItems[${index}].amount`}
                                component="span"
                                className="text-xs text-text-critical"
                              />
                            </div>

                            {/* Option menu */}
                            <Popover>
                              <div className="flex h-full flex-none items-start justify-center">
                                <PopoverTrigger
                                  as="button"
                                  className="mt-1 flex h-6 w-6 items-center justify-center hover:rounded hover:bg-gray-100"
                                >
                                  <div
                                    id={`lineItems[${index}].menu`}
                                    className="flex h-full items-center justify-center py-2"
                                  >
                                    <Icon iconName="more_horizontal" />
                                  </div>
                                </PopoverTrigger>
                              </div>
                              <PopoverPanel
                                anchorOrigin={{
                                  horizontal: "right",
                                }}
                              >
                                {({ close }: PopoverRenderProps) => (
                                  <div id={`lineItems[${index}].actions`}>
                                    {/* Add Metadata */}
                                    <ActionItem
                                      type="default"
                                      onClick={() => {
                                        arrayHelpers.replace(index, {
                                          ...lineItem,
                                          metadata: [
                                            ...(lineItem.metadata as []),
                                            { key: "", value: "" },
                                          ],
                                        });
                                      }}
                                    >
                                      Add Metadata
                                    </ActionItem>

                                    {/* Add Accounting Details */}
                                    {ledgerData?.accountingLedger?.id && (
                                      <ActionItem
                                        type="default"
                                        onClick={() => {
                                          // One accounting detail per line item
                                          if (
                                            lineItem?.accountingDetails?.length
                                          )
                                            return;

                                          arrayHelpers.replace(index, {
                                            ...lineItem,
                                            accountingDetails: [
                                              ...(lineItem?.accountingDetails ||
                                                []),
                                              { class: "", category: "" },
                                            ],
                                          });
                                        }}
                                      >
                                        Add Accounting Details
                                      </ActionItem>
                                    )}

                                    {/* Remove Line Item */}
                                    <ActionItem
                                      type="default"
                                      onClick={() => {
                                        arrayHelpers.remove(index);
                                        close();
                                      }}
                                    >
                                      <span className="text-red-500">
                                        Delete Line Item
                                      </span>
                                    </ActionItem>
                                  </div>
                                )}
                              </PopoverPanel>
                            </Popover>
                          </div>
                          {metadata && metadata.length > 0 && (
                            <div className="w-full">
                              <FieldArray
                                name={`lineItems[${index}].metadata`}
                                render={({ remove }) => (
                                  <div className="flex w-full flex-col gap-4">
                                    <div className="-mb-2 w-full">
                                      <span className="text-xs">Metadata</span>
                                    </div>

                                    {/* Metadata items */}
                                    {metadata.map(
                                      (data: unknown, dataIndex: number) => {
                                        const metadataKey = `metadata${dataIndex}`;

                                        if (metadata[dataIndex].deleted) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            key={metadataKey}
                                            className="group flex items-center"
                                          >
                                            <div className="flex w-full flex-row gap-4">
                                              <div className="flex-1 flex-col">
                                                <Field
                                                  id={`lineItems[${index}].metadata[${dataIndex}].key`}
                                                  name={`lineItems[${index}].metadata[${dataIndex}].key`}
                                                  placeholder="Key"
                                                  className={cn(
                                                    "h-8 w-full rounded-sm px-2 py-1 text-sm placeholder-gray-500  outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                                                    fieldInvalid(
                                                      errors,
                                                      touched,
                                                      `lineItems[${index}].metadata[${dataIndex}].key`,
                                                    )
                                                      ? "border border-red-500"
                                                      : " border border-border-default",
                                                  )}
                                                  validate={(value: string) =>
                                                    required(value?.trim())
                                                  }
                                                />
                                                <ErrorMessage
                                                  name={`lineItems[${index}].metadata[${dataIndex}].key`}
                                                  component="span"
                                                  className="text-xs text-text-critical"
                                                />
                                              </div>
                                              <div className="flex-1 flex-col">
                                                <Field
                                                  id={`lineItems[${index}].metadata[${dataIndex}].value`}
                                                  name={`lineItems[${index}].metadata[${dataIndex}].value`}
                                                  placeholder="Value"
                                                  className={cn(
                                                    "h-8 w-full rounded-sm px-2 py-1 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                                                    fieldInvalid(
                                                      errors,
                                                      touched,
                                                      `lineItems[${index}].metadata[${dataIndex}].value`,
                                                    )
                                                      ? "border border-red-500"
                                                      : " border border-border-default",
                                                  )}
                                                  validate={required}
                                                />
                                                <ErrorMessage
                                                  name={`lineItems[${index}].metadata[${dataIndex}].value`}
                                                  component="span"
                                                  className="text-xs text-text-critical"
                                                />
                                              </div>
                                              {/* Remove Metadata */}

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (isEditForm) {
                                                    const md =
                                                      metadata[dataIndex];
                                                    remove(dataIndex);
                                                    if (md.key !== undefined) {
                                                      const updatedMetadata =
                                                        metadata.filter(
                                                          (metaD) =>
                                                            metaD !== md,
                                                        );
                                                      // MetadataService expects {key: "key", "value": ""}
                                                      // to delete metadata on a line item. so key is present
                                                      // but value is empty
                                                      updatedMetadata.push({
                                                        key: md.key,
                                                        value: "",
                                                        deleted: true,
                                                      });
                                                      void setFieldValue(
                                                        `lineItems[${index}].metadata`,
                                                        updatedMetadata,
                                                      );
                                                    }
                                                  } else {
                                                    remove(dataIndex);
                                                  }
                                                }}
                                                className="mt-1 flex h-6 w-6 flex-none items-center justify-center hover:rounded hover:bg-gray-100"
                                              >
                                                <div
                                                  id={`lineItems[${index}].metadata[${dataIndex}].remove`}
                                                  className="hidden group-hover:flex"
                                                >
                                                  <Icon iconName="clear" />
                                                </div>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          )}
                          {/* End Metadata */}
                          {/* Accounting Details */}
                          {lineItem.accountingDetails &&
                            lineItem.accountingDetails.length > 0 && (
                              <div className="w-full">
                                <FieldArray
                                  name={`lineItems[${index}].accountingDetails`}
                                  render={({ remove }) => (
                                    <div className="flex w-full flex-col gap-2">
                                      <div className="w-full">
                                        <span className="text-xs">
                                          General Ledger Accounting Details
                                        </span>
                                      </div>
                                      {(lineItem.accountingDetails || []).map(
                                        (details, detailsIndex) => {
                                          const detailsKey = `accountingDetails${detailsIndex}`;

                                          let accountingDetailsCategoryError =
                                            "";
                                          let accountingDetailsClassError = "";
                                          let accountingDetailsError = false;
                                          if (
                                            errors.lineItems &&
                                            errors.lineItems[index]
                                          ) {
                                            const lineItemErrs = errors
                                              .lineItems[index] || {
                                              accountingDetails: [],
                                            };
                                            if (
                                              typeof lineItemErrs !==
                                                "string" &&
                                              lineItemErrs?.accountingDetails
                                                ?.length &&
                                              lineItemErrs?.accountingDetails[
                                                detailsIndex
                                              ]
                                            ) {
                                              accountingDetailsError = true;
                                              const detailsError = lineItemErrs
                                                .accountingDetails[detailsIndex]
                                                ? lineItemErrs
                                                    .accountingDetails[
                                                    detailsIndex
                                                  ]
                                                : {
                                                    category: "",
                                                    class: "",
                                                  };
                                              if (
                                                typeof detailsError !== "string"
                                              ) {
                                                accountingDetailsCategoryError =
                                                  detailsError.category;
                                                accountingDetailsClassError =
                                                  detailsError.class;
                                              }
                                            }
                                          }
                                          return (
                                            <div
                                              key={detailsKey}
                                              className="group flex w-full items-center gap-4"
                                            >
                                              <div className="flex-1 flex-col">
                                                <AccountingCategorySelect
                                                  id={`lineItems[${index}].accountingDetails[${detailsIndex}].category`}
                                                  name={`lineItems[${index}].accountingDetails[${detailsIndex}].category`}
                                                  placeholder="Category"
                                                  classNamePrefix="react-select"
                                                  className={cn(
                                                    "react-select-container w-full min-w-[96px]",
                                                    accountingDetailsError &&
                                                      accountingDetailsCategoryError
                                                      ? "border border-red-500"
                                                      : "",
                                                  )}
                                                  iconColor={colors.gray["600"]}
                                                  iconName="chevron_down"
                                                  iconSize="m"
                                                />
                                                <ErrorMessage
                                                  name={`lineItems[${index}].accountingDetails[${detailsIndex}].category`}
                                                  component="span"
                                                  className="text-xs text-text-critical"
                                                />
                                              </div>
                                              <div className="flex-1 flex-col">
                                                <AccountingClassSelect
                                                  id={`lineItems[${index}].accountingDetails[${detailsIndex}].class`}
                                                  name={`lineItems[${index}].accountingDetails[${detailsIndex}].class`}
                                                  placeholder="Class"
                                                  classNamePrefix="react-select"
                                                  className={cn(
                                                    "react-select-container w-full min-w-[96px]",
                                                    accountingDetailsError &&
                                                      accountingDetailsClassError
                                                      ? "border border-red-500"
                                                      : "",
                                                  )}
                                                  iconColor={colors.gray["600"]}
                                                  iconName="chevron_down"
                                                  iconSize="m"
                                                />
                                                <ErrorMessage
                                                  name={`lineItems[${index}].accountingDetails[${detailsIndex}].class`}
                                                  component="span"
                                                  className="text-xs text-text-critical"
                                                />
                                              </div>

                                              {/* Remove Accounting Details */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  remove(detailsIndex);
                                                }}
                                                className={cn(
                                                  "flex h-6 w-6 items-center justify-center hover:rounded hover:bg-gray-100",
                                                  isEditForm
                                                    ? "hidden group-hover:flex"
                                                    : "",
                                                )}
                                              >
                                                <div
                                                  id={`lineItems[${index}].accountingDetails[${detailsIndex}].remove`}
                                                  className="hidden group-hover:flex"
                                                >
                                                  <Icon iconName="clear" />
                                                </div>
                                              </button>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                                />
                              </div>
                            )}
                          {/* End Accounting Details */}
                          {values?.lineItems &&
                            values?.lineItems.length > 1 &&
                            index + 1 < values.lineItems.length &&
                            ((lineItem.metadata &&
                              !!lineItem.metadata.length) ||
                              (lineItem.accountingDetails &&
                                !!lineItem.accountingDetails.length)) && (
                              <div className="flex w-full gap-4">
                                <hr className="mt-3 flex-1 border-border-default" />
                                <div className="h-6 w-6 flex-none" />
                              </div>
                            )}
                          {/* End Line Item */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </FormSurface>
          )}
        />
      </div>
    </div>
  );
}

export default connect<PaymentAmountProps, FormValues>(PaymentAmount);
