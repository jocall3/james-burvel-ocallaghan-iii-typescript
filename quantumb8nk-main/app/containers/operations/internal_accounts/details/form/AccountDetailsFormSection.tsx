// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { FieldArray } from "formik";
import { HorizontalRule } from "~/common/ui-components";
import { AccountDetailFormValues } from "./FormValues";
import AddAccountDetailModal from "./AddAccountDetailModal";
import DetailsFormSectionHeader, {
  DetailType,
} from "./DetailsFormSectionHeader";
import AccountDetailFieldGroup from "./AccountDetailFieldGroup";

interface AccountDetailsFormSectionProps {
  fieldName?: string;
  accountDetails: AccountDetailFormValues[];
}

function AccountDetailsFormSection({
  fieldName = "accountDetails",
  accountDetails,
}: AccountDetailsFormSectionProps) {
  const [showAccountDetailModal, setShowAccountDetailModal] = useState(false);

  return (
    <FieldArray name={fieldName}>
      {({ push, remove }) => (
        <>
          <div>
            <DetailsFormSectionHeader
              detailType={DetailType.Account}
              onAddClick={() => setShowAccountDetailModal(true)}
            />

            <HorizontalRule className="my-2" />

            <div className="grid grid-cols-2 gap-6">
              {accountDetails.map((accountDetail, index) => {
                const indexedFieldName = `${fieldName}.[${index}].accountNumber`;
                const onDelete = () => {
                  remove(index);
                };

                return (
                  <AccountDetailFieldGroup
                    key={indexedFieldName}
                    fieldName={indexedFieldName}
                    accountDetail={accountDetail}
                    onDelete={onDelete}
                  />
                );
              })}
            </div>
          </div>

          {showAccountDetailModal && (
            <AddAccountDetailModal
              closeModal={() => setShowAccountDetailModal(false)}
              onSubmit={(data: AccountDetailFormValues) => push(data)}
            />
          )}
        </>
      )}
    </FieldArray>
  );
}

export default AccountDetailsFormSection;
