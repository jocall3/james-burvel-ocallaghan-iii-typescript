// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field, Form, Formik, FormikErrors, FormikHelpers } from "formik";
import {
  SANDBOX_SETTING_ACTIONS,
  CTA_TYPE,
} from "~/common/constants/analytics";
import {
  Button,
  Label,
  ConfirmModal,
  Alert,
  SelectField,
} from "~/common/ui-components";
import { useResetSandboxDataMutation } from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";
import {
  FormikCheckboxField,
  FormikErrorMessage,
} from "../../../common/formik";
import { trackActionClicked } from "../../../common/utilities/trackEvent";
import { isChecked } from "../../utilities/CheckboxUtils";

interface Props {
  isOpen: boolean;
  toggleOpen: () => void;
}

interface Values {
  [field: string]: boolean[];
}

const OBJECTS = {
  internalAccounts: "All Accounts Data",
  transactions: "Transactions",
  balances: "Balances",
  sweepRules: "Sweep Rules",
  paymentOrders: "Payment Orders",
  expectedPayments: "Expected Payments",
  counterparties: "Counterparties",
  virtualAccounts: "Virtual Accounts",
  incomingPaymentDetails: "Incoming Payment Details",
  returns: "Returns",
  accountGroups: "Account Groups",
  invoices: "Invoices",
  connections: "Connections",
  ledgers: "Ledgers",
};

const DEFAULTS: Values = {
  transactions: [true],
  sweepRules: [true],
  paymentOrders: [true],
  expectedPayments: [true],
  counterparties: [true],
  incomingPaymentDetails: [true],
  balances: [true],
  returns: [true],
  ledgers: [true],
  accountGroups: [true],
  virtualAccounts: [true],
  internalAccounts: [true],
  invoices: [true],
  connections: [true],
};

function joinWithAnd(arr: string[]): string {
  if (arr.length <= 2) return arr.join(" and ");
  if (arr.length === 3) return `${arr[0]}, ${arr[1]}, and ${arr[2]}`;

  return `${arr[0]}, ${arr[1]}, and ${arr.length - 2} others`;
}

export default function ResetSandboxModal({ isOpen, toggleOpen }: Props) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [toggleAll, setToggleAll] = useState<boolean>(false);

  const validateForm = (formValues: Values) => {
    const errors: Record<string, string> = {};

    const selectedCount = Object.values(formValues).filter(
      (value) => value.length !== 0,
    ).length;

    if (selectedCount === 0) {
      errors.lengthError = "Please select at least one object to reset.";
    }

    return errors;
  };

  const [resetSandboxData, { loading: isResetting }] =
    useResetSandboxDataMutation();

  const handleFormSubmit = (
    formValues: Values,
    { setSubmitting }: FormikHelpers<Values>,
  ) => {
    const formPayload = {};

    Object.keys(formValues).forEach((objectName) => {
      formPayload[objectName] = isChecked(formValues[objectName]);
    });

    if (
      // eslint-disable-next-line no-alert
      window.confirm("Are you sure you want to reset these objects in Sandbox?")
    ) {
      trackActionClicked(null, SANDBOX_SETTING_ACTIONS.RESET_SANDBOX_CLICKED, {
        cta_type: CTA_TYPE.BUTTON,
        text: "Reset Sandbox Data",
      });

      resetSandboxData({
        variables: {
          input: {
            ...formPayload,
          },
        },
      })
        .then((response) => {
          if (response.errors) {
            dispatchError(response.errors.toString());
          } else if (response.data) {
            const selected: string[] = Object.entries(formPayload)
              .filter(([, value]) => value === true)
              .map(([key]) => OBJECTS[key] as string);

            dispatchSuccess(
              `The following objects will be reset in sandbox: ${joinWithAnd(
                selected,
              )}. You will receive an email on completion.`,
            );
            toggleOpen();
            setSubmitting(false);
          }
        })
        .catch(() => {
          toggleOpen();
          setSubmitting(false);
        });
    } else {
      toggleOpen();
      setSubmitting(false);
    }
  };

  const selectOptions = [
    {
      label: "All Sandbox Data",
      value: "ALL",
    },
    {
      label: "Transactional Data",
      value: "TRANSACTIONAL_DATA",
    },
    {
      label: "Advanced",
      value: "ADVANCED",
    },
  ];
  const [selectedOption, setSelectedOption] = useState("ALL");

  const selectOptionOnChange = (
    value: string,
    setValues: (values: Values) => Promise<void | FormikErrors<Values>>,
  ) => {
    setSelectedOption(value);
    const newValues: Values = {};
    switch (value) {
      case "ALL":
        Object.entries(DEFAULTS).forEach(([key]) => {
          newValues[key] = [true];
        });
        void setValues(newValues);
        break;
      case "TRANSACTIONAL_DATA":
        Object.entries(DEFAULTS).forEach(([key]) => {
          newValues[key] = [true];
        });
        newValues.sweepRules = [false];
        newValues.accountGroups = [false];
        newValues.internalAccounts = [false];
        newValues.connections = [false];
        void setValues(newValues);
        break;
      case "ADVANCED":
        Object.entries(DEFAULTS).forEach(([key]) => {
          newValues[key] = [true];
        });
        void setValues(newValues);
        break;
      default:
        break;
    }
  };

  return (
    <Formik
      initialValues={DEFAULTS}
      onSubmit={handleFormSubmit}
      validate={validateForm}
    >
      {({ isSubmitting, handleSubmit, errors, values, setValues }) => {
        const selectedObjectNames = Object.entries(values)
          .filter(([, val]) => val.length === 1 && val[0] === true)
          .map(([key]) => OBJECTS[key] as string);

        // "Delete Transactions, Payment Orders, and 11 others"
        const selectedObjectsString = `Delete ${joinWithAnd(
          selectedObjectNames,
        )}`;

        return (
          <ConfirmModal
            title="Delete Sandbox Data"
            isOpen={isOpen}
            confirmText={isSubmitting ? "Deleting..." : selectedObjectsString}
            confirmDisabled={isSubmitting || isResetting}
            confirmType="delete"
            onConfirm={() => {
              handleSubmit();
            }}
            setIsOpen={toggleOpen}
            enableCloseIcon
            onRequestClose={() => toggleOpen()}
          >
            <Form>
              <div className="mb-4">
                <Alert alertType="info">
                  Resetting your sandbox will be done asynchronously and may
                  take up to a few minutes. You will receive an email when it
                  completes.
                </Alert>
                <br />
                <p className="mb-2">
                  Please select the Sandbox objects you would like to delete.
                </p>
                <p>
                  <span>
                    <b>Warning</b>: These objects will be fully deleted and are
                    not recoverable. Any associated objects, events, or audit
                    records will still be present. Ledgerable associations will
                    be cleared if Ledgers objects are not deleted.
                  </span>
                </p>
              </div>
              <SelectField
                placeholder="Sandbox objects you would like to delete"
                selectValue={selectedOption}
                options={selectOptions}
                handleChange={(value: string) =>
                  selectOptionOnChange(value, setValues)
                }
                required
              />
              <p className="mt-4">
                {(selectedOption === "ALL" ||
                  selectedOption === "TRANSACTIONAL_DATA") && (
                  <span>
                    <b>Recommended sandbox reset approach.</b>
                  </span>
                )}
                {selectedOption !== "ADVANCED" && (
                  <div>
                    This will delete:
                    <ul className="ml-4 flex list-disc flex-row flex-wrap px-4">
                      {selectedObjectNames.map((name: string) => (
                        <li className="w-1/2" key={name}>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedOption === "ADVANCED" && (
                  <span>
                    <b>Recommended only for advanced users.</b> Deleting data
                    objects without deleting dependent data objects can result
                    in a broken sandbox data model.
                  </span>
                )}
              </p>
              <div className={selectedOption !== "ADVANCED" ? "hidden" : ""}>
                <Button
                  className="mb-4"
                  onClick={() => {
                    setToggleAll((before) => !before);

                    const newValues = {};

                    Object.entries(values).forEach(([key]) => {
                      newValues[key] = toggleAll ? [true] : [];
                    });

                    void setValues(newValues);
                  }}
                >
                  Toggle All
                </Button>
                <div className="flex flex-row flex-wrap">
                  {Object.keys(OBJECTS).map((name) => (
                    <div key={name} className="flex w-1/2 items-center gap-x-2">
                      <Field
                        id={name}
                        type="checkbox"
                        name={name}
                        value
                        component={FormikCheckboxField}
                      />
                      <Label id={name}>{OBJECTS[name]}</Label>
                      <FormikErrorMessage name={name} />
                    </div>
                  ))}
                </div>
              </div>
              {errors.lengthError && (
                <p className="mt-2 text-red-500">{errors.lengthError}</p>
              )}
            </Form>
          </ConfirmModal>
        );
      }}
    </Formik>
  );
}
