// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { ReactNode, useState } from "react";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
  FormikProps,
  FormikTouched,
  getIn,
} from "formik";
import * as Yup from "yup";
import NumberFormat from "react-number-format";
import trackEvent from "../../../common/utilities/trackEvent";
import { ISO_CODES } from "../../constants";
import {
  FormValues,
  CUSTOM_CURRENCY_OPTION,
} from "../../constants/ledger_account_form";
import {
  useUpsertLedgerAccountCategoryMutation,
  useLedgerAccountCategoriesCountLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import MetadataInput from "../../components/MetadataInput";
import { validation as metadataValidation } from "../../components/KeyValueInput";
import ReduxSelectBar from "../../../common/deprecated_redux/ReduxSelectBar";
import {
  Button,
  Icon,
  Label,
  Input,
  SelectField,
} from "../../../common/ui-components";
import LedgerAccountCategoryTreeSelect from "../ledger_account_form/LedgerAccountCategoryTreeSelect";
import LedgerAccountCategoryAsyncSelect from "../ledger_account_form/LedgerAccountCategoryAsyncSelect";
import { LEDGER } from "../../../generated/dashboard/types/resources";
import { useDispatchContext } from "../../MessageProvider";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { LEDGERS_EVENTS } from "../../../common/constants/analytics";

interface LedgerAccountCategoryFormProps {
  initialValues: FormValues;
}

export const CURRENCY_OPTIONS = [CUSTOM_CURRENCY_OPTION].concat(ISO_CODES);

function FormElement({ children }: { children: ReactNode }) {
  return (
    <div className="pb-4">
      <div className="form-group">{children}</div>
    </div>
  );
}

const currencyValue = (values: FormValues) =>
  values.currency === CUSTOM_CURRENCY_OPTION
    ? values.customCurrency
    : values.currency;

const currencyExponentValue = (values: FormValues) =>
  values.currency === CUSTOM_CURRENCY_OPTION ? values.currencyExponent : null;

const createCategoryButtonDisabled = (values: FormValues) =>
  currencyValue(values) === "" ||
  (values.currency === CUSTOM_CURRENCY_OPTION &&
    (currencyExponentValue(values) === null ||
      currencyValue(values).length < 3 ||
      currencyValue(values).length > 6));

const NORMAL_BALANCE_OPTIONS = [
  { value: "debit", text: "Debit" },
  { value: "credit", text: "Credit" },
];

const LARGE_CATEGORY_AMOUNT_THRESHOLD = 100;
enum CategorySelectState {
  Hidden = "hidden",
  TreeSelect = "treeSelect",
  AsyncSelect = "asyncSelect",
}

function LedgerAccountCategoryForm({
  initialValues,
}: LedgerAccountCategoryFormProps) {
  const { dispatchError } = useDispatchContext();

  const [hideMetadata, setHideMetadata] = useState(true);
  const [categorySelectState, setCategorySelectState] =
    useState<CategorySelectState>(CategorySelectState.Hidden);
  const [upsertLedgerAccountCategory] =
    useUpsertLedgerAccountCategoryMutation();
  const [getLedgerAccountCategoriesCount] =
    useLedgerAccountCategoriesCountLazyQuery();

  const resetCategorySelect = (
    setFieldValue: (
      field: string,
      value: Array<{ label: string; value: string }> | string | null,
      shouldValidate?: boolean,
    ) => Promise<void | FormikErrors<FormValues>>,
  ) => {
    setCategorySelectState(CategorySelectState.Hidden);
    void setFieldValue("category", []);
    void setFieldValue("categoryError", null);
  };

  const cancelLedgerAccountCategoryEdit = () => {
    window.location.href = `/ledgers/${initialValues.ledgerId}?tab=categories`;
  };

  const createLedgerAccountCategory = (values: FormValues) => {
    trackEvent(null, LEDGERS_EVENTS.CREATE_LEDGER_ACCOUNT_CATEGORY_CLICKED);

    const ledgerAccountCategory = {
      name: values.name,
      description: values.description,
      currency: currencyValue(values),
      currencyExponent: currencyExponentValue(values),
      normalBalance: values.normalBalance,
      ledgerId: values.ledgerId,
      metadata: JSON.stringify(values.metadata),
      parentCategories: values.category.map((node) => node.value),
    };
    upsertLedgerAccountCategory({
      variables: {
        input: ledgerAccountCategory,
      },
    })
      .then(({ data }): void => {
        if (data?.upsertLedgerAccountCategory?.errors.length) {
          dispatchError(data.upsertLedgerAccountCategory.errors.toString());
        } else {
          window.location.href = `/ledgers/${initialValues.ledgerId}?tab=categories`;
        }
      })
      .catch(() => {
        dispatchError("An error occurred");
      });
  };

  const validate = (initialFormValues: FormValues) =>
    Yup.object({
      name: Yup.string().required("Required"),
      normalBalance: Yup.string()
        .matches(/credit|debit/)
        .required("Required"),
      currency: Yup.string().required("Required"),
      customCurrency: Yup.string()
        .nullable()
        .when("currency", {
          is: "Custom Currency",
          then: Yup.string()
            .min(3, "Currency must be at least 3 characters")
            .max(50, "Currency must be at most 50 characters")
            .matches(
              /^[A-Z0-9.-]+$/,
              "Allowed characters are uppercase letters, numbers, . and -",
            )
            .notOneOf(ISO_CODES, "Custom Currency can't equal a default symbol")
            .required("Required"),
        }),
      currencyExponent: Yup.number()
        .nullable()
        .when("currency", {
          is: "Custom Currency",
          then: Yup.number()
            .typeError("Currency Exponent must be a number between 0 and 30")
            .min(0, "Currency Exponent must be greater than or equal to 0")
            .max(30, "Currency Exponent must be at most 30")
            .required("Required"),
        }),
      description: Yup.string(),
      metadata: metadataValidation(initialFormValues.metadata),
      categoryError: Yup.string()
        .nullable()
        .test("show_category_error", "", (d, { createError }) => {
          if (d) {
            return createError({
              message: d,
            });
          }
          return true;
        }),
    });

  const handleCreateCategoryClick = (values: FormValues) => {
    getLedgerAccountCategoriesCount({
      variables: {
        ledgerId: initialValues.ledgerId,
        currency: currencyValue(values),
        currencyExponent: currencyExponentValue(values),
      },
    }).then(
      ({ data }) => {
        if (
          data?.ledgerAccountCategories.totalCount &&
          data.ledgerAccountCategories.totalCount >
            LARGE_CATEGORY_AMOUNT_THRESHOLD
        ) {
          setCategorySelectState(CategorySelectState.AsyncSelect);
        } else {
          setCategorySelectState(CategorySelectState.TreeSelect);
        }
      },
      () => {},
    );
  };

  const fieldInvalid = (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;
  return (
    <PageHeader hideBreadCrumbs title="Create New Ledger Account Category">
      <div className="form-create form-create-wide">
        <Formik
          initialValues={initialValues}
          initialTouched={{
            categoryError: true,
          }}
          onSubmit={(values) => createLedgerAccountCategory(values)}
          validationSchema={validate(initialValues)}
        >
          {({
            errors,
            touched,
            values,
            handleSubmit,
            isValid,
          }: FormikProps<FormValues>) => (
            <Form>
              <div className="form-row flex">
                <Field>
                  {({
                    field,
                    form,
                  }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                    <FormElement>
                      <Input
                        name="name"
                        label="Name"
                        required
                        value={field.value.name}
                        invalid={fieldInvalid(errors, touched, "name")}
                        onChange={field.onChange}
                        onBlur={() => {
                          void form.setFieldTouched("name", true);
                        }}
                      />
                      <ErrorMessage
                        name="name"
                        component="span"
                        className="error-message"
                      />
                    </FormElement>
                  )}
                </Field>
                <Field>
                  {({
                    field,
                    form,
                  }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                    <FormElement>
                      <Label id="currency">Currency</Label>
                      <SelectField
                        label="Currency"
                        name="currency"
                        selectValue={field.value.currency}
                        invalid={fieldInvalid(errors, touched, "currency")}
                        options={CURRENCY_OPTIONS.map((c) => ({
                          value: c,
                          label: c,
                        }))}
                        handleChange={(e) => {
                          void form.setFieldValue("currency", e);
                          resetCategorySelect(form.setFieldValue);
                        }}
                      />
                      <ErrorMessage
                        name="currency"
                        component="span"
                        className="error-message"
                      />
                    </FormElement>
                  )}
                </Field>
              </div>
              {values.currency === CUSTOM_CURRENCY_OPTION && (
                <div className="form-row flex">
                  <Field>
                    {({
                      field,
                      form,
                    }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                      <FormElement>
                        <Input
                          label={CUSTOM_CURRENCY_OPTION}
                          name="customCurrency"
                          helpText="The currency in which all associated ledger entries are denominated (3 to 6 capitalized letters)"
                          required
                          value={field.value.customCurrency}
                          invalid={fieldInvalid(
                            errors,
                            touched,
                            "customCurrency",
                          )}
                          onChange={(e) => {
                            field.onChange(e);
                            resetCategorySelect(form.setFieldValue);
                          }}
                          onBlur={() => {
                            void form.setFieldTouched("customCurrency", true);
                          }}
                        />
                        <ErrorMessage
                          name="customCurrency"
                          component="span"
                          className="error-message"
                        />
                      </FormElement>
                    )}
                  </Field>

                  <Field>
                    {({
                      field,
                      form,
                    }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                      <FormElement>
                        <NumberFormat
                          onValueChange={(currencyExponent) => {
                            void form.setFieldValue(
                              "currencyExponent",
                              currencyExponent.value === ""
                                ? null
                                : Number(currencyExponent.value),
                            );
                            resetCategorySelect(form.setFieldValue);
                          }}
                          value={field.value.currencyExponent}
                          name="currencyExponent"
                          label="Currency Exponent"
                          customInput={Input}
                          helpText="Denotes how many decimal places should be displayed for this currency (max 30)"
                          invalid={fieldInvalid(
                            errors,
                            touched,
                            "currencyExponent",
                          )}
                          onBlur={() => {
                            void form.setFieldTouched("currencyExponent", true);
                          }}
                        />
                        <ErrorMessage
                          name="currencyExponent"
                          component="span"
                          className="error-message"
                        />
                      </FormElement>
                    )}
                  </Field>
                </div>
              )}
              <div className="form-row flex">
                <Field name="normalBalance">
                  {({
                    field,
                    form,
                  }: FieldProps<string> & FormikProps<FormValues>) => (
                    <FormElement>
                      <ReduxSelectBar
                        selectOptions={NORMAL_BALANCE_OPTIONS}
                        label="Normal Balance"
                        input={{
                          value: field.value,
                          onChange: (val) => {
                            void form.setFieldValue("normalBalance", val);
                          },
                          name: "normalBalance",
                        }}
                        invalid={fieldInvalid(errors, touched, "normalBalance")}
                      />
                      <ErrorMessage
                        name="normalBalance"
                        component="span"
                        className="error-message -mt-3 flex"
                      />
                    </FormElement>
                  )}
                </Field>
              </div>

              <div className="form-section additional-information-form-section pt-5">
                <h3>
                  <div className="flex">
                    <div className="flex flex-grow">
                      <span>Additional Information</span>
                    </div>
                    <div className="flex self-center">
                      <div className="text-sans text-xs text-gray-500">
                        Optional
                      </div>
                    </div>
                  </div>
                </h3>
                <Field>
                  {({
                    field,
                    form,
                  }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                    <FormElement>
                      <Input
                        label="Description"
                        name="description"
                        required
                        value={field.value.description}
                        invalid={fieldInvalid(errors, touched, "description")}
                        onChange={field.onChange}
                        onBlur={() => {
                          void form.setFieldTouched("description", true);
                        }}
                      />
                      <ErrorMessage
                        name="description"
                        component="span"
                        className="error-message"
                      />
                    </FormElement>
                  )}
                </Field>
              </div>

              <div className="pb-10">
                <div className="form-section additional-information-form-section pt-5">
                  <h3>
                    <div className="flex">
                      <div className="flex flex-grow">
                        <span>Parent Category</span>
                      </div>
                      {categorySelectState === CategorySelectState.Hidden && (
                        <div className="flex self-center">
                          <Button
                            id="add-category-btn"
                            buttonType="text"
                            disabled={createCategoryButtonDisabled(values)}
                            onClick={() => handleCreateCategoryClick(values)}
                          >
                            <Icon iconName="add" />
                            <span>Add Parent Category</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </h3>
                </div>
                {categorySelectState === CategorySelectState.Hidden && (
                  <div className="text-sans text-xs text-gray-500">
                    No category added
                  </div>
                )}
                <Field>
                  {({
                    form,
                  }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                    <FormElement>
                      {categorySelectState ===
                        CategorySelectState.TreeSelect && (
                        <LedgerAccountCategoryTreeSelect
                          ledgerId={initialValues.ledgerId}
                          currency={currencyValue(values)}
                          currencyExponent={currencyExponentValue(values)}
                          form={form}
                        />
                      )}
                      {categorySelectState ===
                        CategorySelectState.AsyncSelect && (
                        <>
                          <LedgerAccountCategoryAsyncSelect
                            ledgerId={initialValues.ledgerId}
                            currency={currencyValue(values)}
                            currencyExponent={currencyExponentValue(values)}
                          />
                          <ErrorMessage
                            name="categoryError"
                            component="span"
                            className="error-message"
                          />
                        </>
                      )}
                    </FormElement>
                  )}
                </Field>
              </div>

              <div className="form-section additional-information-form-section pt-5">
                <h3>
                  <div className="flex">
                    <div className="flex flex-grow">
                      <span>Metadata</span>
                    </div>
                    {hideMetadata && (
                      <div className="flex self-center">
                        <Button
                          id="add-metadata-btn"
                          buttonType="text"
                          onClick={() => setHideMetadata(false)}
                        >
                          <Icon iconName="add" />
                          <span>Add Metadata</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </h3>
              </div>
              {!hideMetadata ? (
                <FormElement>
                  <Field name="metadata">
                    {({
                      form,
                    }: FieldProps<FormValues> & FormikProps<FormValues>) => (
                      <MetadataInput
                        onChange={(value) => {
                          void form.setFieldValue("metadata", value);
                        }}
                        resource={LEDGER}
                        hideLabel
                        completedValuesAndKeys={false}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="metadata"
                    component="span"
                    className="error-message"
                  />
                </FormElement>
              ) : (
                <div className="text-sans text-xs text-gray-500">
                  No metadata added
                </div>
              )}
              <div className="flex flex-row space-x-4 pt-5">
                <Button
                  fullWidth
                  onClick={() => cancelLedgerAccountCategoryEdit()}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleSubmit()}
                  buttonType="primary"
                  disabled={!isValid}
                >
                  Create
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageHeader>
  );
}

export default LedgerAccountCategoryForm;
