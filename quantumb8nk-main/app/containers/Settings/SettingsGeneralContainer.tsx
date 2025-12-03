// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ReactTooltip from "react-tooltip";
import {
  Button,
  ConfirmModal,
  CopyableText,
  Label,
  Link,
} from "../../../common/ui-components";
import requestApi from "../../../common/utilities/requestApi";
import {
  CurrentOrganizationQuery,
  Organization,
  useCurrentOrganizationQuery,
} from "../../../generated/dashboard/graphqlSchema";
import SomethingWentWrong from "../../../errors/components/SomethingWentWrong";
import {
  FormikCheckboxField,
  FormikErrorMessage,
  FormikInputField,
} from "../../../common/formik";
import { containsDownstreamCRMUnacceptableCharacters } from "../../constants";
import { useDispatchContext } from "../../MessageProvider";
import SCIMSettings from "./SCIMSettings";
import Stack from "../../../common/ui-components/Stack/Stack";

type InputValue<T> = {
  value: T;
  error?: null | string;
};

type EditableOrgFields = keyof Pick<
  Organization,
  "id" | "name" | "ticker" | "showPii" | "prebuiltUisWhitelabelingEnabled"
>;
type GeneralSettingState = {
  [key in EditableOrgFields]: InputValue<Organization[key]>;
};
interface SettingsContainerProps {
  organizationData: CurrentOrganizationQuery;
}

interface FormValues {
  organizationName: string;
  dataPrivacyControls: boolean[];
  prebuiltUisWhitelabelingEnabled: boolean[];
}

function SettingsGeneralContainer({
  organizationData,
}: SettingsContainerProps) {
  const organization = organizationData.currentOrganization;
  const canEditOrganization = organization.canEdit;
  const canEnableWhitelabelingPrebuiltUis =
    organization.authorizePrebuiltUisWhitelabeling;
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [state, setState] = useState<GeneralSettingState>(() => ({
    name: { value: organization.name },
    ticker: { value: organization.ticker },
    showPii: { value: organization.showPii },
    id: { value: organization.id },
    prebuiltUisWhitelabelingEnabled: {
      value: organization.prebuiltUisWhitelabelingEnabled,
    },
  }));

  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    organizationName: state.name.value,
    dataPrivacyControls: [!state.showPii.value],
    prebuiltUisWhitelabelingEnabled: [
      state.prebuiltUisWhitelabelingEnabled.value,
    ],
  });
  const [
    isConfirmDataPrivacyControlsChangeOpen,
    setIsConfirmDataPrivacyControlsChangeOpen,
  ] = useState(false);

  function parseOrganizationNameIntoTicker(name: string): string | null {
    return name.length !== 0
      ? name.split(" ").reduce((previous, current, index) => {
          if (index < 2) {
            return previous + current.charAt(0).toUpperCase();
          }
          return previous;
        }, "")
      : null;
  }
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      ticker: { value: parseOrganizationNameIntoTicker(prevState.name.value) },
    }));
  }, [state.name.value]);

  const submitOrganizationSettings = ({
    organizationName,
    dataPrivacyControls,
    prebuiltUisWhitelabelingEnabled,
  }: FormValues) => {
    const dataPrivacyControlsLength = dataPrivacyControls.length;
    const prebuiltUisWhitelabelingEnabledLength =
      prebuiltUisWhitelabelingEnabled.length;

    const data = {
      name: organizationName,
      ticker: state.ticker.value,
      show_pii: !(dataPrivacyControlsLength > 0
        ? dataPrivacyControls[dataPrivacyControlsLength - 1]
        : false),
      prebuilt_uis_whitelabeling_enabled:
        prebuiltUisWhitelabelingEnabledLength > 0 &&
        organization.authorizePrebuiltUisWhitelabeling
          ? prebuiltUisWhitelabelingEnabled[
              prebuiltUisWhitelabelingEnabledLength - 1
            ]
          : null,
    };

    const method = "PATCH";
    const action = `/organizations/${state.id.value}`;

    requestApi(action, null, method, data)
      .json(() => {
        dispatchSuccess("Saved organization settings successfully.");
      })
      .catch((error: Error) => {
        try {
          dispatchError(error.message);
        } catch {
          dispatchError(
            "Sorry but we couldn't save this organization data. Please check for anything that is invalid",
          );
        }
      });
  };

  const openDataPrivacyControlsModal = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (organization) {
      // Pop up modal when switching to data privacy controls: true
      if (event.target.checked) {
        const newFormValues = {
          ...initialFormValues,
          dataPrivacyControls: [true],
        };
        setInitialFormValues(newFormValues);
        setIsConfirmDataPrivacyControlsChangeOpen(true);
      }
    }
  };

  const handlePrebuiltUisWhitelabelingEnabled = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFormValues = {
      ...initialFormValues,
      prebuiltUisWhitelabelingEnabled: [event.target.checked],
    };
    setInitialFormValues(newFormValues);
  };

  const validate = Yup.object().shape({
    organizationName: Yup.string()
      .required("Organization name cannot be empty.")
      .test(
        "Special characters are not allowed.",
        "Special characters are not allowed.",
        (organizationNameValue = "") =>
          !containsDownstreamCRMUnacceptableCharacters(organizationNameValue),
      ),
  });

  return (
    <div className="form-create text-gray-700">
      <Formik
        initialValues={initialFormValues}
        onSubmit={submitOrganizationSettings}
        validationSchema={validate}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <Stack className="justify-items-start gap-8">
              <Stack className="gap-2">
                <div key="generalTitle" className="text-sm font-medium">
                  Organization ID
                </div>
                <CopyableText text={organization.id}>
                  {organization.id}
                </CopyableText>
              </Stack>

              <Stack className="gap-2">
                <div key="generalTitle" className="font-medium">
                  Organization Name
                </div>
                <Field
                  id="organizationName"
                  name="organizationName"
                  component={FormikInputField}
                  disabled={!canEditOrganization}
                />
                <FormikErrorMessage name="organizationName" />
              </Stack>

              <Stack className="gap-2">
                <div key="generalTitle" className="font-medium">
                  Cell
                </div>
                <CopyableText text={organization.cell}>
                  {organization.cell}
                </CopyableText>
              </Stack>

              <Stack className="gap-4">
                <Stack className="gap-2">
                  <div key="piiTitle" className="font-medium">
                    Data privacy controls
                  </div>
                  <div className="text-sm">
                    Please be careful when changing{" "}
                    <Link
                      to="https://docs.moderntreasury.com/reference/data-privacy-controls"
                      isExternal
                    >
                      Data Privacy Controls
                    </Link>
                    , as it can affect your integration or security posture. By
                    default, Modern Treasury will not return bank account
                    numbers and select fields from banking partners that contain
                    sensitive data.
                  </div>
                </Stack>
                <div className="flex flex-1 items-center gap-2">
                  <div>
                    <Field
                      id="dataPrivacyControls"
                      type="checkbox"
                      name="dataPrivacyControls"
                      value
                      component={FormikCheckboxField}
                      onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
                        openDataPrivacyControlsModal(e)
                      }
                    />
                  </div>
                  <Label id="dataPrivacyControls">
                    <span
                      data-tip="Checking this setting redacts sensitive information (e.g. account numbers and tax ids) from API responses and the web application UI"
                      data-for="data-privacy-controls"
                    >
                      Data privacy controls
                    </span>
                    <ReactTooltip
                      className="w-1/3"
                      id="data-privacy-controls"
                    />
                  </Label>
                  <FormikErrorMessage name="dataPrivacyControls" />
                </div>
              </Stack>
              <Stack className="gap-4">
                <Stack className="gap-2">
                  <div
                    key="prebuiltUisWhitelabelingEnabledTitle"
                    className="text-sm font-medium"
                  >
                    Pre-built UIs Branding
                  </div>
                  <div className="text-sm">
                    When this setting is enabled, the Modern Treasury logo will
                    not appear within pre-built UIs, including the Account
                    Collection Flow, Payment Flow, and more.
                  </div>
                </Stack>
                <div className="flex items-center gap-2">
                  <div>
                    <Field
                      id="prebuiltUisWhitelabelingEnabled"
                      type="checkbox"
                      name="prebuiltUisWhitelabelingEnabled"
                      value
                      onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePrebuiltUisWhitelabelingEnabled(e)
                      }
                      component={FormikCheckboxField}
                      disabled={!canEnableWhitelabelingPrebuiltUis}
                    />
                  </div>
                  <Label id="prebuiltUisWhitelabelingEnabled" className="">
                    <span
                      data-tip="Your current contract does not support this feature. Please contact Support for more information"
                      data-for="prebuilt-uis-whitelabeling-enabled"
                    >
                      Remove MT branding from Pre-built UIs
                    </span>
                    {!canEnableWhitelabelingPrebuiltUis && (
                      <ReactTooltip id="prebuilt-uis-whitelabeling-enabled" />
                    )}
                  </Label>
                  <FormikErrorMessage name="prebuiltUisWhitelabelingEnabled" />
                </div>
              </Stack>
              {/* TODO chen-annie: remove conditional once SCIM is GA */}
              {organization.scimEnabled && (
                <div>
                  <SCIMSettings
                    organizationName={organization.name}
                    scimEnabled={organization.scimEnabled}
                  />
                </div>
              )}
              <Button
                buttonType="primary"
                disabled={!canEditOrganization || !isValid}
                isSubmit
              >
                Save Changes
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
      <ConfirmModal
        isOpen={isConfirmDataPrivacyControlsChangeOpen}
        title="Are you sure you want to toggle this setting on?"
        onConfirm={() => {
          setIsConfirmDataPrivacyControlsChangeOpen(false);
        }}
        setIsOpen={(value) => {
          // When user wants to cancel - dataPrivacyControls: false
          if (!value) {
            const newFormValues = {
              ...initialFormValues,
              dataPrivacyControls: [false],
            };
            setInitialFormValues(newFormValues);
            setIsConfirmDataPrivacyControlsChangeOpen(false);
          }
        }}
        confirmType="delete"
        confirmText="Turn On"
      >
        Please check that your integration does not expect
        <a
          href="https://docs.moderntreasury.com/reference/data-privacy-controls"
          target="_blank"
          rel="noreferrer"
        >
          &nbsp;these fields&nbsp;
        </a>
        in API responses and webhook event bodies. If you change this setting,
        Modern Treasury will no longer return bank account numbers and select
        fields from banking partners that contain sensitive information.
        <br />
        <br />
        Note: You must also click on {`"Save Changes"`} to update the setting.
      </ConfirmModal>
    </div>
  );
}

function FetchSettingsGeneralContainer() {
  const {
    data: fetchData,
    loading,
    error: fetchError,
  } = useCurrentOrganizationQuery();

  if (loading || !fetchData) {
    return <ClipLoader />;
  }

  if (fetchError) {
    return <SomethingWentWrong />;
  }
  return <SettingsGeneralContainer organizationData={fetchData} />;
}

export default FetchSettingsGeneralContainer;
