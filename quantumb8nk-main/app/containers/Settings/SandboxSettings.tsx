// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import ReactTooltip from "react-tooltip";
import { Field, Form, Formik } from "formik";
import { Button, Label, SandboxGate } from "../../../common/ui-components";
import {
  CurrentOrganizationQuery,
  Organization,
  useCurrentOrganizationQuery,
} from "../../../generated/dashboard/graphqlSchema";
import SomethingWentWrong from "../../../errors/components/SomethingWentWrong";
import WithBackgroundJobStatus from "../../components/WithAsyncJob";
import requestApi from "../../../common/utilities/requestApi";
import { useDispatchContext } from "../../MessageProvider";
import ResetSandboxModal from "./ResetSandboxModal";
import {
  FormikCheckboxField,
  FormikErrorMessage,
} from "../../../common/formik";

interface SettingsContainerProps {
  organizationData: CurrentOrganizationQuery;
}
type InputValue<T> = {
  value: T;
  error?: null | string;
};
type EditableOrgFields = keyof Pick<Organization, "simulateLiveSandboxData">;

type GeneralSettingState = {
  [key in EditableOrgFields]: InputValue<Organization[key]>;
};

interface FormValues {
  simulateLiveSandboxData: boolean[];
}

const DEMO_ORGANIZATION = "efbf7b0d-6bb3-4258-9f20-3cadfe98df91";

function SandboxSettings({ organizationData }: SettingsContainerProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [isResetSandboxModalOpen, setIsResetSandboxModalOpen] =
    useState<boolean>(false);
  const [seedSandboxJobKey, setSeedSandboxJobKey] = useState<string>("");

  const organization = organizationData.currentOrganization;
  const canEditOrganization = organization.canEdit;
  const [state] = useState<GeneralSettingState>(() => ({
    simulateLiveSandboxData: { value: organization.simulateLiveSandboxData },
  }));
  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    simulateLiveSandboxData: [state.simulateLiveSandboxData.value],
  });

  useEffect(() => {
    if (!window?.gon?.organization?.id) return;
    setSeedSandboxJobKey(`${window.gon.organization.id}:seeding_sandbox_data`);
  }, []);

  const handlesimulateLiveSandboxDataChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFormValues = {
      ...initialFormValues,
      simulateLiveSandboxData: [event.target.checked],
    };
    setInitialFormValues(newFormValues);
  };

  const submitOrganizationSettings = ({
    simulateLiveSandboxData,
  }: FormValues) => {
    const sandboxSimLength = simulateLiveSandboxData.length;

    const data = {
      simulate_live_sandbox_data:
        sandboxSimLength > 0
          ? simulateLiveSandboxData[sandboxSimLength - 1]
          : false,
    };

    const method = "PATCH";
    const action = `/organizations/${organization.id}`;

    requestApi(action, null, method, data)
      .json(() => {
        dispatchSuccess("Saved simulate sandbox setting successfully.");
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

  const handleSeedSandboxData = (callback: () => void) => {
    // eslint-disable-next-line no-alert
    const response = window.confirm(
      "Are you sure you want to seed the sandbox environment?",
    );

    if (response) {
      requestApi("/settings/organization/seed_sandbox_data", null, "POST")
        .res(() => {
          dispatchSuccess("Seeding Factory Sandbox Data In Progress");
          callback();
        })
        .catch((error: Error) => {
          try {
            dispatchError(error.message);
          } catch {
            dispatchError(
              "Sorry but we couldn't reset this organization's sandbox data. Please contact support",
            );
          }
        });
    }
  };

  return (
    <div className="w-2/3">
      <SandboxGate>
        <div className="pb-6">
          {seedSandboxJobKey && (
            <WithBackgroundJobStatus jobKey={seedSandboxJobKey}>
              {({ loading, progress, message, onStartJob }) => (
                <div>
                  <div key="resetSandboxData" className="flex flex-col">
                    <span className="outer-container-headline font-medium">
                      Reset Sandbox Data
                    </span>
                  </div>
                  <div className="pb-6 text-sm">
                    This will allow you to select any sandbox data that you’d
                    like to clear, including but not limited to internal
                    accounts, counterparties, payment orders, and more.
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <div>
                      <Button
                        onClick={() => {
                          // This is the Vandelay organization, which should not be reset.
                          if (
                            organizationData.currentOrganization.id ===
                            DEMO_ORGANIZATION
                          ) {
                            // eslint-disable-next-line no-alert
                            alert(
                              "Sorry! This organization is used for sales demos and cannot be reset.",
                            );

                            return;
                          }
                          setIsResetSandboxModalOpen((before) => !before);
                        }}
                        disabled={loading}
                      >
                        Reset Sandbox Data
                      </Button>
                    </div>
                    <ResetSandboxModal
                      isOpen={isResetSandboxModalOpen}
                      toggleOpen={() => {
                        setIsResetSandboxModalOpen((before) => !before);
                      }}
                    />
                  </div>
                  <div key="seedSandboxData" className="flex flex-col pt-6">
                    <span className="outer-container-headline font-medium">
                      Seed Sandbox with Factory default data
                    </span>
                  </div>
                  <div className="text-sm">
                    This will seed your sandbox data with the default data.
                  </div>
                  <span className="-mt-1 text-xs text-text-muted">
                    {loading && message
                      ? message
                      : `Note: this can take a few minutes, and you will not be able to reset Sandbox data while this is running.`}
                  </span>
                  <div className="flex flex-1 items-center gap-2 pt-6">
                    <Button
                      onClick={() => {
                        handleSeedSandboxData(onStartJob);
                      }}
                      disabled={loading}
                    >
                      {loading
                        ? `${"Seeding data"}... (${progress || 0}%)`
                        : "Seed Data"}
                    </Button>
                  </div>
                </div>
              )}
            </WithBackgroundJobStatus>
          )}
        </div>
      </SandboxGate>
      <Formik
        initialValues={initialFormValues}
        onSubmit={submitOrganizationSettings}
        enableReinitialize
      >
        {({ isValid }) => (
          <Form>
            <div className="">
              <div key="simulateLiveSandboxDataTitle" className="flex flex-col">
                <span className="outer-container-headline font-medium">
                  Simulate Live Data in Sandbox
                </span>
              </div>
              <div className="pb-6 text-sm">
                When this setting is enabled, we will create daily balance
                reports, transactions, payment orders, and other activities that
                simulate real usage in your sandbox account. This is can be
                helpful for testing your integration with Modern Treasury. No
                actual money will be moved, and no real bank accounts will be
                created.
              </div>
              <div className="flex flex-1 items-center gap-2 pb-6">
                <div>
                  <Field
                    id="simulateLiveSandboxData"
                    type="checkbox"
                    name="simulateLiveSandboxData"
                    value
                    onClick={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlesimulateLiveSandboxDataChange(e)
                    }
                    component={FormikCheckboxField}
                  />
                </div>
                <Label id="simulateLiveSandboxData" className="">
                  <span
                    data-tip="Unchecking this setting will stop generating live Sandbox data for this account"
                    data-for="generate-live-sandbox-data"
                  >
                    Generate live Sandbox data for this account
                  </span>
                  <ReactTooltip id="generate-live-sandbox-data" />
                </Label>
                <FormikErrorMessage name="simulateLiveSandboxData" />
              </div>
              <div className="pb-6">
                <Button
                  buttonType="primary"
                  disabled={!canEditOrganization || !isValid}
                  isSubmit
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default function SandboxSettingsHome() {
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
  return <SandboxSettings organizationData={fetchData} />;
}
