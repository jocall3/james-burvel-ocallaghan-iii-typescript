// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Formik, Form, getIn, FormikErrors, FormikTouched } from "formik";
import { ApolloQueryResult } from "@apollo/client";
import { ConfirmModal } from "../../../common/ui-components";
import {
  Exact,
  InternalAccount,
  InternalAccountViewQuery,
  useUpdateInternalAccountMutation,
} from "../../../generated/dashboard/graphqlSchema";
import { INTERNAL_ACCOUNT } from "../../../generated/dashboard/types/resources";
import { useDispatchContext } from "../../MessageProvider";
import FormikKeyValueInput, {
  FieldTypeEnum,
} from "../../../common/formik/FormikKeyValueInput";
import { MetadataValue } from "../../constants/virtual_account_form";

interface InternalAccountMetadataProps {
  internalAccount: InternalAccount | null | undefined;
  setIsOpen: (isOpen: boolean) => void;
  refetch: (
    variables?: Partial<Exact<{ internalAccountId: string }>> | undefined,
  ) => Promise<ApolloQueryResult<InternalAccountViewQuery>>;
}
interface FormValues {
  metadata?: Array<MetadataValue>;
}
const fieldInvalid = (
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>,
  fieldName: string,
) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;

function ProcessMetadata(
  oldMetadata: Record<string, string>,
  newMetadata: Record<string, string>,
) {
  // need to do this because if user deletes a key, need to add it back in and pass an empty value
  const formattedMetadata: Record<string, string> = newMetadata || {};
  Object.keys(oldMetadata).forEach((key) => {
    if (!formattedMetadata[key]) {
      formattedMetadata[key] = "";
    }
  });
  return formattedMetadata;
}

function MetadataForm() {
  return (
    <Form>
      <FormikKeyValueInput
        fieldType={FieldTypeEnum.Metadata}
        fieldInvalid={fieldInvalid}
        resource={INTERNAL_ACCOUNT}
      />
    </Form>
  );
}
function EditInternalAccountModal({
  internalAccount,
  setIsOpen,
  refetch,
}: InternalAccountMetadataProps) {
  const [updateInternalAccount] = useUpdateInternalAccountMutation();
  const { dispatchError } = useDispatchContext();

  if (internalAccount) {
    const initialMetaData = JSON.parse(internalAccount.metadata) as Array<{
      key: string;
      value: string;
    }>;

    const handleSubmit = ({ metadata }: { metadata: Array<MetadataValue> }) => {
      const oldMetadata = initialMetaData.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});
      const newMetadata = metadata.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});
      const formattedMetadata = ProcessMetadata(oldMetadata, newMetadata);
      updateInternalAccount({
        variables: {
          input: {
            id: internalAccount?.id,
            metadata: JSON.stringify(formattedMetadata),
          },
        },
      })
        .then(({ data: responseData }) => {
          if (responseData?.updateInternalAccount?.errors.length) {
            dispatchError(responseData.updateInternalAccount.errors.toString());
          } else {
            void refetch({
              internalAccountId: internalAccount.id,
            });
            setIsOpen(false);
          }
        })
        .catch(() =>
          dispatchError("Sorry, we could not update the internal account"),
        );
    };

    return (
      <Formik
        initialValues={{
          metadata: initialMetaData as Array<MetadataValue>,
        }}
        onSubmit={handleSubmit}
      >
        {(form) => (
          <ConfirmModal
            title="Edit Metadata"
            isOpen
            setIsOpen={() => setIsOpen(false)}
            confirmText={form.isSubmitting ? "Submitting..." : "Save"}
            confirmDisabled={form.isSubmitting}
            onConfirm={() => {
              form.handleSubmit();
            }}
          >
            <MetadataForm />
          </ConfirmModal>
        )}
      </Formik>
    );
  }

  return <div>Error</div>;
}

export default EditInternalAccountModal;
