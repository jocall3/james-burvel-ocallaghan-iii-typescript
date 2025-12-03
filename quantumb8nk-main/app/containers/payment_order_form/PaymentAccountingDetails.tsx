// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { connect, FormikErrors, FormikTouched } from "formik";
import { useAccountingLedgerViewQuery } from "../../../generated/dashboard/graphqlSchema";
import AccountingCategorySelect from "./AccountingCategorySelect";
import AccountingClassSelect from "./AccountingClassSelect";
import colors from "../../../common/styles/colors";
import { FieldGroup, FormSurface, Label } from "../../../common/ui-components";
import { FormValues } from "../../constants/payment_order_form";

interface PaymentAccountingDetailsProps {
  errors: FormikErrors<FormValues>;
  touched: FormikTouched<FormValues>;
  fieldInvalid: (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => boolean;
  accountingCategoryId?: string;
  accountingLedgerClassId?: string;
  accountingFieldsClearable?: boolean;
}

function PaymentAccountingDetails({
  errors,
  touched,
  fieldInvalid,
  accountingCategoryId,
  accountingLedgerClassId,
  accountingFieldsClearable,
}: PaymentAccountingDetailsProps) {
  const { data: ledgerData } = useAccountingLedgerViewQuery();

  if (ledgerData?.accountingLedger?.id) {
    return (
      <FormSurface
        id="accountingDetails"
        heading="Accounting Details"
        optional
        addButtonProps={{}}
      >
        <div className="flex flex-row gap-4 pt-4">
          <FieldGroup containerClassName="w-full">
            <Label
              id="accountingCategory"
              className="whitespace-nowrap text-sm"
            >
              General Ledger Account
            </Label>
            <AccountingCategorySelect
              id="accountingCategory"
              name="accountingCategory"
              placeholder="Select"
              classNamePrefix="react-select"
              className="react-select-container flex-1"
              iconColor={colors.gray["600"]}
              iconName="chevron_down"
              iconSize="m"
              invalid={fieldInvalid(errors, touched, "accountingCategory")}
              accountingCategoryId={accountingCategoryId}
              key={accountingCategoryId || "accountingCategoryField"} // force remount to trigger loadOptions
              isClearable={accountingFieldsClearable}
            />
          </FieldGroup>
          <FieldGroup containerClassName="w-full">
            <Label
              id="accountingLedgerClass"
              className="whitespace-nowrap text-sm"
            >
              Accounting Class
            </Label>
            <AccountingClassSelect
              id="accountingLedgerClass"
              name="accountingLedgerClass"
              placeholder="Select"
              classNamePrefix="react-select"
              className="react-select-container flex-1"
              iconColor={colors.gray["600"]}
              iconName="chevron_down"
              iconSize="m"
              invalid={fieldInvalid(errors, touched, "accountingLedgerClass")}
              accountingLedgerClassId={accountingLedgerClassId}
              key={accountingLedgerClassId || "accountingLedgerClassField"} // force remount to trigger loadOptions
              isClearable={accountingFieldsClearable}
            />
          </FieldGroup>
        </div>
      </FormSurface>
    );
  }
  return null;
}

export default connect(PaymentAccountingDetails);
