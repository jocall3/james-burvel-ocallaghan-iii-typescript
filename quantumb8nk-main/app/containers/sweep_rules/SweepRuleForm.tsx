// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useRef, useEffect } from "react";
import {
  Field,
  Formik,
  ErrorMessage,
  Form,
  FormikErrors,
  FormikProps,
  FormikTouched,
  getIn,
} from "formik";
import { useHistory } from "react-router";
import { isNull } from "lodash";
import { FormikNumberFormatField } from "../../../common/formik";
import FrequencySelector from "./FrequencySelector";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  CurrencyInput,
  FieldGroup,
  Label,
  Button,
  SelectField,
  Toggle,
} from "../../../common/ui-components";
import { required } from "../../../common/ui-components/validations";
import CreateCounterpartyModal from "../payment_order_form/create_counterparty/CreateCounterpartyModal";
import {
  AdditionalInformationInput,
  maxStatementDescriptorLength,
} from "../payment_order_form/PaymentAdditionalInformation";
import MissingAccountRequirementsModalContainer from "../payment_order_form/missing_account_requirements/MissingAccountRequirementsModalContainer";
import PaymentToFrom from "../payment_order_form/PaymentToFrom";
import {
  AccountCapabilityFragment,
  PaymentTypeEnum,
  SweepRule,
  UpsertSweepRuleInput,
  useUpsertSweepRuleMutation,
  VendorIdEnum,
} from "../../../generated/dashboard/graphqlSchema";
import SweepRuleDirectionSelector from "./SweepRuleDirectionSelector";
import AccountBalanceChart from "./AccountBalanceChart";
import {
  FormValues,
  SweepRuleDirection,
} from "../../constants/sweep_rule_form";
import SweepRuleCutoff from "./SweepRuleCutoff";
import PaymentMethod, {
  PaymentMethodOption,
} from "../payment_order_form/PaymentMethod";

type SelectFieldActionNameType =
  | "select-option"
  | "remove-value"
  | "pop-value"
  | "clear";

interface SweepRuleFormProps {
  isEditForm: boolean;
  id?: string;
  sweepRuleData?: SweepRule;
}

function SweepRuleForm({
  isEditForm = false,
  id: sweepRuleId,
  sweepRuleData,
}: SweepRuleFormProps) {
  const history = useHistory();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [formErrorMessages, setFormErrorMessages] = useState<string[]>([]);

  const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false);
  // const [externalAccount, setExternalAccount] = useState<ExternalAccount>();
  const [inlineCreatedAccount, setInlineCreatedAccount] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const [upsertSweepRule] = useUpsertSweepRuleMutation();

  const [managedAccountLabel, setManagedAccountLabel] = useState("");
  const [managedAccountVendor, setManagedAccountVendor] = useState<
    VendorIdEnum | undefined
  >(undefined);
  const [supportingAccountLabel, setSupportingAccountLabel] = useState("");
  const [supportingAccountType, setSupportingAccountType] = useState<string>(
    sweepRuleData?.supportingAccountType || "InternalAccount",
  );
  const [managedAccountTimezone, setManagedAccountTimezone] = useState("");
  const [hasAdjustedTargetBalance, setHasAdjustedTargetBalance] =
    useState(false);

  const [accountCapabilities, setAccountCapabilities] = useState<
    Array<AccountCapabilityFragment> | undefined
  >(undefined);

  const paymentOptions: PaymentMethodOption[] = [
    {
      id: "book_normal",
      value: "book_normal",
      paymentType: PaymentTypeEnum.Book,
      priority: "normal",
      label: "Book Transfer",
    },
    {
      id: "ach_normal",
      value: "ach_normal",
      paymentType: PaymentTypeEnum.Ach,
      priority: "normal",
      label: "ACH",
    },
    {
      id: "ach_high",
      value: "ach_high",
      paymentType: PaymentTypeEnum.Ach,
      priority: "high",
      label: "Same-Day ACH",
    },
    {
      id: "wire_normal",
      value: "wire_normal",
      paymentType: PaymentTypeEnum.Wire,
      priority: "normal",
      label: "Wire Transfer",
    },
    {
      id: "eft_normal",
      value: "eft_normal",
      paymentType: PaymentTypeEnum.Eft,
      priority: "normal",
      label: "EFT",
    },
    {
      id: "eft_high",
      value: "eft_high",
      paymentType: PaymentTypeEnum.Eft,
      priority: "high",
      label: "High Priority EFT",
    },
  ];

  const currentHour = new Date().getHours();

  let initialValues: FormValues = {
    id: "",
    originatingAccount: "",
    originatingAccountType: "InternalAccount",
    receivingAccount: "",
    receivingAccountId: "",
    receivingAccountType: "InternalAccount",
    paymentType: undefined,
    priority: undefined,
    fundingDirection: [],
    targetBalance: 250 * 1000 * 100, // 250k
    minSweepAmount: undefined,
    maxSweepAmount: undefined,
    scheduledHour: currentHour,
    scheduledMinutes: 0,
    description: "",
    schedule: {
      every: "day",
      interval: 1,
      endType: "never",
      daysOfWeek: [],
      cutoff: "",
    },
  };

  if (isEditForm && sweepRuleData && sweepRuleId) {
    initialValues = {
      ...initialValues,
      id: sweepRuleData?.id,
      originatingAccount: sweepRuleData?.managedAccountId,
      originatingAccountType: sweepRuleData?.managedAccountType,
      receivingAccount: sweepRuleData?.supportingAccountId,
      receivingAccountId: sweepRuleData?.supportingAccountId,
      receivingAccountType: sweepRuleData?.supportingAccountType,
      enabled: isNull(sweepRuleData?.pausedAt),
      description: sweepRuleData?.description ?? "",
      fundingDirection: (sweepRuleData?.fundingDirection ===
      (SweepRuleDirection.BOTH as string)
        ? [SweepRuleDirection.DRAW_DOWN, SweepRuleDirection.TOP_UP]
        : [sweepRuleData?.fundingDirection as string]) as SweepRuleDirection[],
      paymentType: sweepRuleData.paymentType as PaymentTypeEnum,
      priority: sweepRuleData.priority,
      targetBalance: sweepRuleData?.targetBalance,
      minSweepAmount: sweepRuleData?.minSweepAmount,
      maxSweepAmount: sweepRuleData?.maxSweepAmount,
      ...(sweepRuleData.schedule && {
        ...initialValues.schedule,
        every: sweepRuleData.schedule.every,
        daysOfWeek: sweepRuleData.schedule.daysOfWeek,
        interval: sweepRuleData.schedule.interval,
      }),
    };
  }

  useEffect(() => {
    if (isEditForm && sweepRuleData && sweepRuleId) {
      if (sweepRuleData.managedAccount) {
        setManagedAccountLabel(sweepRuleData.managedAccount.longName);
        if (sweepRuleData.managedAccount.connection) {
          if (sweepRuleData.managedAccount.connection.vendor) {
            setManagedAccountVendor(
              sweepRuleData.managedAccount.connection.vendor.id,
            );
            setManagedAccountTimezone(
              sweepRuleData.managedAccount.connection.vendor.timeZone,
            );
          }
        }
      }

      if (sweepRuleData.supportingAccount) {
        setSupportingAccountLabel(sweepRuleData.supportingAccount.longName);
        setSupportingAccountType(sweepRuleData.supportingAccountType);
      }
    }
  }, [sweepRuleData, sweepRuleId, isEditForm, supportingAccountType]);

  function submitSweepRuleForm(values: FormValues) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const transformData = (values): UpsertSweepRuleInput => {
      let fundingDirection: string | undefined;
      if (
        values.fundingDirection.includes(SweepRuleDirection.DRAW_DOWN) &&
        values.fundingDirection.includes(SweepRuleDirection.TOP_UP)
      ) {
        fundingDirection = SweepRuleDirection.BOTH;
      } else if (
        values.fundingDirection.includes(SweepRuleDirection.DRAW_DOWN)
      ) {
        fundingDirection = SweepRuleDirection.DRAW_DOWN;
      } else {
        fundingDirection = SweepRuleDirection.TOP_UP;
      }

      return {
        input: {
          managedAccountId: values?.originatingAccount,
          managedAccountType: values?.originatingAccountType,
          supportingAccountId: values?.receivingAccountId,
          supportingAccountType: values?.supportingAccountType,
          paymentType: values.paymentType,
          priority: values.priority,
          fundingDirection,
          description: values.description,
          targetBalance: values.targetBalance,
          minSweepAmount: values.minSweepAmount,
          maxSweepAmount: values.maxSweepAmount,
          scheduledHour: values.scheduledHour,
          scheduledMinutes: values.scheduledMinutes,
          schedule: {
            endDate: values.schedule.endDate,
            interval: parseInt(values?.schedule?.interval, 10),
            every: values.schedule.every,
            daysOfWeek: values.schedule.daysOfWeek,
            timeZone: managedAccountTimezone,
          },
          ...(isEditForm && { id: values.id, enabled: values.enabled }),
        },
      };
    };

    upsertSweepRule({
      variables: { input: transformData(values) },
    })
      .then(({ data }): void => {
        // Feels like optional chaining should work, but yarn tsc-strict didnt like it?
        if (
          data &&
          data.upsertSweepRule &&
          data.upsertSweepRule.errors &&
          data.upsertSweepRule.errors.length > 0
        ) {
          const errorMessages = data.upsertSweepRule.errors;
          errorMessages.push("Please fix all errors before continuing.");
          setFormErrorMessages(errorMessages);
          return;
        }

        if (isEditForm) {
          window.location.href = `/sweeps/${
            data?.upsertSweepRule?.sweepRule?.id ?? ""
          }`;
        } else {
          history.push(
            `/sweeps/${data?.upsertSweepRule?.sweepRule?.id ?? ""}?success`,
          );
        }
      })
      .catch((error) => {
        const { graphQLErrors } = error;
        const errors = graphQLErrors.map((e) => e.message as string);
        setFormErrorMessages(errors);
      });
  }

  function handleMoneyInputChange(
    value: string,
    formKey: string,
    formik: FormikProps<FormValues>,
  ) {
    const decimalValue = parseFloat(value.replace(/,/g, "")) * 100;
    void formik.setFieldValue(formKey, decimalValue);
  }

  function handleMultiSelectChange(
    value: string,
    field: { label: string; value: string },
    actionName: SelectFieldActionNameType,
    formik: FormikProps<FormValues>,
  ) {
    const formKey = "schedule.daysOfWeek";
    const values = formik?.values?.schedule?.daysOfWeek ?? [];

    switch (actionName) {
      case "select-option":
        void formik.setFieldValue(formKey, [...values, value]);
        break;
      case "clear":
        void formik.setFieldValue(formKey, []);
        break;
      case "remove-value":
        void formik.setFieldValue(
          formKey,
          formik?.values?.schedule?.daysOfWeek?.filter(
            (day) => day !== field.value,
          ),
        );
        break;
      default:
    }
  }

  function formatTargetBalance(value: number): string | number {
    if (Number.isNaN(value)) return "";
    if (value === 0) return 0.0;
    return Number(value / 100).toString();
  }

  const fieldInvalid = (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;

  return (
    <div className="flex flex-col">
      {formErrorMessages.map((errorMessage) => (
        <div className="mt-2">
          <Alert alertType="danger">{errorMessage}</Alert>
        </div>
      ))}
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          innerRef={formikRef}
          onSubmit={submitSweepRuleForm}
        >
          {(formik) => {
            const { values, errors, touched, setFieldValue } = formik;
            return (
              <div>
                {isCounterpartyModalOpen && (
                  <CreateCounterpartyModal
                    isOpen={isCounterpartyModalOpen}
                    handleModalClose={(id, name) => {
                      if (id && name) {
                        void setFieldValue("receivingAccountId", id);
                        setInlineCreatedAccount({ value: id, label: name });
                      }

                      setIsCounterpartyModalOpen(false);
                    }}
                  />
                )}
                <MissingAccountRequirementsModalContainer />
                <Form>
                  <div className="grid max-w-[1176px] grid-cols-1 items-start gap-x-8 mint-lg:grid-cols-2">
                    {/* Start Form */}
                    <div className="flex flex-col gap-y-14">
                      <div className="flex flex-col gap-y-6">
                        <div className="flex flex-col gap-6">
                          {!isEditForm && (
                            <PaymentToFrom
                              setOriginatingAccountLabel={
                                setManagedAccountLabel
                              }
                              setReceivingAccountLabel={
                                setSupportingAccountLabel
                              }
                              setIsCounterpartyModalOpen={
                                setIsCounterpartyModalOpen
                              }
                              setAccountCapabilities={setAccountCapabilities}
                              inlineCreatedAccount={inlineCreatedAccount}
                              fieldInvalid={fieldInvalid}
                              sourcePaymentOrderId={null}
                              isEditForm={isEditForm}
                              setInternalAccount={() => {}}
                              setReceivingAccount={() => {}}
                              originatingLabel="Target Balance Account"
                              receivingLabel="Supporting Account"
                              onOriginatingAccountChange={({
                                vendor,
                                balanceReport,
                              }) => {
                                setManagedAccountVendor(vendor?.id);
                                void setFieldValue(
                                  "originatingAccount",
                                  balanceReport?.internalAccountId,
                                );

                                if (vendor?.timeZone)
                                  setManagedAccountTimezone(vendor?.timeZone);

                                // If the user has not adjusted the target balance,
                                // set it to the current available amount
                                // This is a convenience to make the chart look nicer
                                // when switching between two accounts with wildly different balances
                                if (
                                  !hasAdjustedTargetBalance &&
                                  balanceReport?.availableAmount
                                ) {
                                  void setFieldValue(
                                    "targetBalance",
                                    Number(balanceReport.availableAmount),
                                  );
                                }
                              }}
                              onReceivingAccountChange={({
                                value,
                                accountType,
                              }) => {
                                void setFieldValue(
                                  "supportingAccountType",
                                  accountType,
                                );
                                void setFieldValue(
                                  "receivingAccountType",
                                  accountType,
                                );
                                void setFieldValue("receivingAccount", value);
                                void setFieldValue("receivingAccountId", value);
                              }}
                            />
                          )}
                          <div className="flex w-full flex-col">
                            <div className="flex flex-row space-x-6">
                              <div className="flex w-full flex-col">
                                <CurrencyInput
                                  label={
                                    <Label className="mb-2 text-sm font-normal">
                                      Target Balance
                                    </Label>
                                  }
                                  required
                                  input={{
                                    value: formatTargetBalance(
                                      formik.values.targetBalance,
                                    ),
                                    onChange: (e) => {
                                      handleMoneyInputChange(
                                        e?.target?.value,
                                        "targetBalance",
                                        formik,
                                      );
                                      setHasAdjustedTargetBalance(true);
                                    },
                                  }}
                                  invalid={fieldInvalid(
                                    errors,
                                    touched,
                                    "targetBalance",
                                  )}
                                />
                              </div>
                              <Field
                                id="paymentType"
                                name="paymentType"
                                priorityName="priority"
                                component={PaymentMethod}
                                accountCapabilities={accountCapabilities}
                                customPaymentTypeOptions={paymentOptions}
                                validate={required}
                                invalid={fieldInvalid(
                                  errors,
                                  touched,
                                  "paymentType",
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-y-4">
                          <Field
                            id="fundingDirection"
                            name="fundingDirection"
                            component={SweepRuleDirectionSelector}
                            validate={(value) =>
                              value.length === 0
                                ? "Select a sweep type"
                                : undefined
                            }
                          />
                        </div>
                        {isEditForm && (
                          <div className="flex w-full flex-col gap-y-4">
                            <Toggle
                              checked={Boolean(values.enabled)}
                              id="enabled"
                              label="Enable Sweep"
                              handleChange={() => {
                                void formik.setFieldValue(
                                  "enabled",
                                  !values.enabled,
                                );
                              }}
                              disabled={false}
                              className="pl-0"
                              labelClassName="mr-6"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="mt-3 flex flex-row gap-x-6">
                            <div className="w-full">
                              <div className="mb-2">Schedule</div>
                              <div className="flex flex-row gap-x-6">
                                <div className="w-full">
                                  <Field
                                    id="schedule.interval"
                                    name="schedule.interval"
                                    placeholder="1"
                                    component={FormikNumberFormatField}
                                  />
                                </div>
                                <div className="w-full">
                                  <Field
                                    id="schedule.every"
                                    name="schedule.every"
                                    plural={values?.schedule?.interval > 1}
                                    component={FrequencySelector}
                                  />
                                </div>
                              </div>
                              {values?.schedule?.every === "week" && (
                                <div className="mt-2">
                                  <FieldGroup>
                                    <Label id="daysOfWeek">On Days</Label>
                                    <SelectField
                                      id="schedule.daysOfWeek"
                                      name="schedule.daysOfWeek"
                                      selectValue={values?.schedule?.daysOfWeek}
                                      isMulti
                                      handleChange={(
                                        value: string,
                                        field: { label: string; value: string },
                                        actionName: SelectFieldActionNameType,
                                      ) =>
                                        handleMultiSelectChange(
                                          value,
                                          field,
                                          actionName,
                                          formik,
                                        )
                                      }
                                      options={[
                                        { value: "monday", label: "Monday" },
                                        { value: "tuesday", label: "Tuesday" },
                                        {
                                          value: "wednesday",
                                          label: "Wednesday",
                                        },
                                        {
                                          value: "thursday",
                                          label: "Thursday",
                                        },
                                        { value: "friday", label: "Friday" },
                                      ]}
                                    />
                                  </FieldGroup>
                                </div>
                              )}
                            </div>
                          </div>
                          {managedAccountVendor && values.paymentType && (
                            <div className="mt-6 flex flex-row gap-x-6">
                              {managedAccountTimezone && (
                                <SweepRuleCutoff
                                  managedAccountVendor={managedAccountVendor}
                                  managedAccountTimezone={
                                    managedAccountTimezone
                                  }
                                />
                              )}
                            </div>
                          )}
                        </div>
                        <Accordion>
                          <AccordionItem>
                            {({ isExpanded }) => (
                              <>
                                <AccordionButton className="px-0">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-base font-medium text-gray-800">
                                      Additional rules
                                    </span>
                                    <span className="text-xs font-normal text-gray-500">
                                      Optional
                                    </span>
                                  </div>
                                  <AccordionIcon />
                                </AccordionButton>
                                {isExpanded && <hr />}
                                <AccordionPanel className="px-0">
                                  {/* Additional Options start */}
                                  <div className="space-y-4 pb-4">
                                    <div className="flex flex-row gap-x-6">
                                      <div className="w-full">
                                        <CurrencyInput
                                          label={
                                            <Label className="mb-2 text-sm font-normal text-gray-800">
                                              Maximum Amount
                                            </Label>
                                          }
                                          // subLabel={}
                                          input={{
                                            name: "maxSweepAmount",
                                            value: formik.values.maxSweepAmount
                                              ? formik.values.maxSweepAmount /
                                                100
                                              : "",
                                            onChange: (e) => {
                                              handleMoneyInputChange(
                                                e.target.value,
                                                "maxSweepAmount",
                                                formik,
                                              );
                                            },
                                          }}
                                        />
                                        <span className="-mt-1 text-xs text-text-muted">
                                          Set an upper limit for each sweep. If
                                          the sweep amount exceeds this limit,
                                          the sweep will be rounded down to
                                          match this number.
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-row gap-x-6">
                                      <div className="w-full">
                                        <CurrencyInput
                                          label={
                                            <Label className="mb-2 text-sm font-normal text-gray-800">
                                              Minimum Amount
                                            </Label>
                                          }
                                          input={{
                                            name: "minSweepAmount",
                                            value: formik.values.minSweepAmount
                                              ? formik.values.minSweepAmount /
                                                100
                                              : "",
                                            onChange: (e) => {
                                              handleMoneyInputChange(
                                                e.target.value,
                                                "minSweepAmount",
                                                formik,
                                              );
                                            },
                                          }}
                                        />
                                        <span className="-mt-1 text-xs text-text-muted">
                                          Set a lower limit for each sweep. If
                                          the sweep amount is less than this,
                                          the sweep will not happen.
                                        </span>
                                      </div>
                                    </div>
                                    <FieldGroup>
                                      <div className="flex flex-row justify-between">
                                        <Label
                                          id="descriptionLabel"
                                          className="text-sm font-normal"
                                        >
                                          Bank Statement Description
                                        </Label>
                                        <ErrorMessage
                                          name="description"
                                          component="span"
                                          className="mt-1 text-xs text-text-critical"
                                        />
                                      </div>
                                      <Field
                                        id="description"
                                        name="description"
                                        component={AdditionalInformationInput}
                                        validate={maxStatementDescriptorLength(
                                          values?.paymentType ?? "",
                                        )}
                                        invalid={fieldInvalid(
                                          errors,
                                          touched,
                                          "description",
                                        )}
                                        value={values.description}
                                      />
                                      <span className="-mt-1 text-xs text-text-muted">
                                        Appears in bank statements for both
                                        parties
                                      </span>
                                    </FieldGroup>
                                  </div>
                                  {/* Additional Options end */}
                                </AccordionPanel>
                              </>
                            )}
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                    {/* Balance Chart */}
                    <div className="sticky top-4 mt-4 border bg-background-default mint-lg:mt-0">
                      <AccountBalanceChart
                        managedAccountId={values?.originatingAccount}
                        managedAccountLabel={managedAccountLabel}
                        supportingAccountId={values?.receivingAccount}
                        supportingAccountLabel={supportingAccountLabel}
                        targetBalance={values?.targetBalance}
                        selectedDays={values?.schedule?.daysOfWeek}
                        every={values?.schedule?.every}
                        interval={values?.schedule?.interval}
                        endDate={values?.schedule?.endDate}
                        timeZone={managedAccountTimezone}
                      />
                      <hr />
                      <div className="flex flex-row-reverse py-4 pr-6">
                        {/* Button will be disabled until all fields are filled and no errors */}
                        <Button
                          isSubmit
                          buttonType="primary"
                          buttonHeight="medium"
                          disabled={Object.keys(errors).length > 0}
                        >
                          {isEditForm
                            ? "Update Sweep Rule"
                            : "Create Sweep Rule"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default SweepRuleForm;
