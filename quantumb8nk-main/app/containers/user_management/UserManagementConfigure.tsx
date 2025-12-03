// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { UserManagementStepsEnum } from "./utilities";
import ConfigureRoles from "./ConfigureRoles";
import ConfigurePermissionSets from "./ConfigurePermissionSets";
import ConfigureGroups from "./ConfigureGroups";
import ConfigureGroupsNonScim from "./ConfigureGroupsNonScim";
import { useCurrentOrganizationQuery } from "../../../generated/dashboard/graphqlSchema";
import { SequenceHeader } from "~/common/ui-components/SequenceHeader/SequenceHeader";

function UserManagementConfigure() {
  const [step, setStep] = useState<UserManagementStepsEnum>(
    UserManagementStepsEnum.ConfigurePermissionSets,
  );

  const { data, loading } = useCurrentOrganizationQuery();

  const scimEnabled = data?.currentOrganization.scimEnabled;
  if (loading || !data) {
    return null;
  }

  const renderStep = () => {
    if (step === UserManagementStepsEnum.ConfigurePermissionSets) {
      return <ConfigurePermissionSets setStep={setStep} />;
    }
    if (step === UserManagementStepsEnum.ConfigureRoles) {
      return <ConfigureRoles setStep={setStep} />;
    }
    return scimEnabled ? (
      <ConfigureGroups setStep={setStep} />
    ) : (
      <ConfigureGroupsNonScim setStep={setStep} />
    );
  };
  return (
    <>
      <SequenceHeader>
        <SequenceHeader.Item
          isActive={step === UserManagementStepsEnum.ConfigurePermissionSets}
        >
          Configure Permission Sets
        </SequenceHeader.Item>
        <SequenceHeader.Item
          isActive={step === UserManagementStepsEnum.ConfigureRoles}
        >
          Configure Roles
        </SequenceHeader.Item>
        <SequenceHeader.Item
          isActive={step === UserManagementStepsEnum.ConfigureGroups}
        >
          {scimEnabled ? "Add Roles to Groups" : "Configure Groups"}
        </SequenceHeader.Item>
      </SequenceHeader>

      {renderStep()}
    </>
  );
}

export default UserManagementConfigure;
