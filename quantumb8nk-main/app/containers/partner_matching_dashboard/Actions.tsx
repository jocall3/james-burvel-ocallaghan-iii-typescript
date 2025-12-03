// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  Formik,
  Form,
  Field,
  FieldProps,
  FormikProps,
  FormikErrors,
} from "formik";
import { ClipLoader } from "react-spinners";
import Button from "../../../common/ui-components/Button/Button";
import {
  useAdminUpsertPartnerMatchMutation,
  OnboardingPartnerMatch__StatusEnum,
  useOnboardingPartnerViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import BankPartnerIcon from "./BankPartnerIcon";
import { FieldGroup, Label, SelectField } from "../../../common/ui-components";
import AddPartnerContactModal from "../../components/AddPartnerContactModal";

type SelectFieldActionNameType =
  | "select-option"
  | "remove-value"
  | "pop-value"
  | "clear";

interface FormValues {
  noteToPartner: string;
  bankPartnerContacts: string[];
}

interface ActionsProps {
  partnerSearchId: string;
  partnerMatchId: string;
  partnerName: string;
  partnerId: string;
  partnerKey: string;
  customerName: string;
  existingNoteToPartner: string;
}

export default function Actions({
  partnerSearchId,
  partnerMatchId,
  partnerName,
  partnerId,
  partnerKey,
  customerName,
  existingNoteToPartner,
}: ActionsProps) {
  const [adminUpsertPartnerMatch] = useAdminUpsertPartnerMatchMutation();
  const [isAddPartnerContactOpen, setIsAddPartnerContactOpen] = useState(false);
  const { data, loading, refetch } = useOnboardingPartnerViewQuery({
    variables: {
      partnerId: partnerId ?? "",
    },
  });

  if (loading || !data) return <ClipLoader />;

  const { partnerContacts } = data?.onboardingPartner || {};
  const options = partnerContacts?.map(({ email, id }) => ({
    label: email,
    value: id,
  }));
  const validateForm = (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    if (values.bankPartnerContacts.length === 0) {
      errors.bankPartnerContacts = "Required";
    }

    return errors;
  };
  const getInitialFormValues = () => {
    const initialArr: string[] = [];
    return {
      noteToPartner: existingNoteToPartner,
      bankPartnerContacts: initialArr,
    };
  };

  function handleFieldChange(
    value: string,
    field: { label: string; value: string },
    actionName: SelectFieldActionNameType,
    formik: FormikProps<FormValues>,
  ) {
    switch (actionName) {
      case "select-option":
        void formik.setFieldValue("bankPartnerContacts", [
          ...formik.values.bankPartnerContacts,
          value,
        ]);
        break;
      case "clear":
        void formik.setFieldValue("bankPartnerContacts", []);
        break;
      case "pop-value":
      case "remove-value":
        void formik.setFieldValue(
          "bankPartnerContacts",
          formik.values.bankPartnerContacts.filter((id) => id !== field.value),
        );
        break;
      default:
    }
  }

  return (
    <div className="mb-8 basis-1/3 border">
      <div className="m-5">
        <BankPartnerIcon
          bankPartner={partnerKey}
          logoCssClass="rounded flex-none grow-0 w-80 h-80"
          containerCssClass="w-328 h-80 justify-center items-center flex flex-col"
        />
        <p className="mb-6 text-xs font-medium">Actions</p>
        <p className="mb-4 text-xs font-normal text-gray-500">
          {`If you decide to send this match to ${partnerName}, you may send them
                a note to help them understand why you think ${customerName} is a good fit for them.`}
        </p>
        <AddPartnerContactModal
          isOpen={isAddPartnerContactOpen}
          partnerId={partnerId}
          existingId=""
          partnerContactFormValues={{}}
          handleModalClose={() => {
            setIsAddPartnerContactOpen(false);
            refetch().catch(() => {});
          }}
        />
        <Formik
          initialValues={getInitialFormValues()}
          validate={validateForm}
          onSubmit={async (formValues) => {
            await adminUpsertPartnerMatch({
              variables: {
                input: {
                  input: {
                    partnerSearchId,
                    partnerMatchId,
                    status:
                      OnboardingPartnerMatch__StatusEnum.AwaitingPartnerResponse,
                    noteToPartner: formValues.noteToPartner,
                    partnerContactIds: formValues.bankPartnerContacts,
                  },
                },
              },
            });
          }}
        >
          {(formik) => (
            <Form>
              <Field id="bankPartnerContacts">
                {({ field: { name } }: FieldProps) => (
                  <>
                    <div className="float relative flex flex-col justify-center pb-1">
                      <FieldGroup direction="top-to-bottom">
                        <Label
                          id={name}
                          className="flex h-20 flex-row align-baseline text-xs font-normal text-gray-800"
                        >
                          Send to contacts
                        </Label>
                        <SelectField
                          selectValue={formik.values.bankPartnerContacts}
                          isMulti
                          isClearable
                          options={options}
                          handleChange={(
                            value: string,
                            field: { label: string; value: string },
                            actionName: SelectFieldActionNameType,
                          ) =>
                            handleFieldChange(value, field, actionName, formik)
                          }
                          name={name}
                          clearable
                        />
                      </FieldGroup>
                    </div>
                    <Button
                      className="float-right pb-2 text-xs font-normal text-blue-500"
                      buttonType="link"
                      onClick={() => {
                        setIsAddPartnerContactOpen(true);
                      }}
                    >
                      Add Contact
                    </Button>
                  </>
                )}
              </Field>
              <Field name="noteToPartner">
                {({
                  field,
                  form,
                }: FieldProps<string> & FormikProps<FormValues>) => (
                  <div>
                    <textarea
                      onChange={(e) => {
                        void form.setFieldValue(field.name, e.target.value);
                      }}
                      id="noteToPartner"
                      value={formik.values.noteToPartner}
                      rows={5}
                      placeholder="Note (Optional)"
                      className="w-full border px-2 py-1 text-xs placeholder-gray-600"
                    />
                  </div>
                )}
              </Field>
              <Button
                className="mt-4"
                buttonType="primary"
                fullWidth
                buttonHeight="medium"
                onClick={() => formik.handleSubmit()}
                disabled={!formik.isValid}
              >
                Send Match to Bank
              </Button>
              <Button
                className="mt-4"
                buttonType="secondary"
                fullWidth
                buttonHeight="medium"
                onClick={() => {
                  adminUpsertPartnerMatch({
                    variables: {
                      input: {
                        input: {
                          partnerSearchId,
                          partnerMatchId,
                          noteToPartner: formik.values.noteToPartner,
                        },
                      },
                    },
                  })
                    .then(() => {
                      const { location } = window;
                      window.open(
                        `${location.origin}/public/partner_matches/${partnerMatchId}`,
                      );
                    })
                    .catch(() => {});
                }}
              >
                Save & Preview Match
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
