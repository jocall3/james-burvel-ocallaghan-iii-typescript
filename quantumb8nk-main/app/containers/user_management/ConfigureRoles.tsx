// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import { RolesHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { ROLE } from "../../../generated/dashboard/types/resources";
import { Button, Drawer, PageHeader } from "../../../common/ui-components";
import { UserManagementStepsEnum } from "./utilities";
import { useHandleLinkClick } from "../../../common/utilities/handleLinkClick";
import RoleFormContainer from "./forms/RoleFormContainer";

function ConfigureRoles({
  setStep,
}: {
  setStep: (step: UserManagementStepsEnum) => void;
}) {
  const handleLinkClick = useHandleLinkClick();
  const handleSubmit = () => {
    setStep(UserManagementStepsEnum.ConfigureGroups);
  };

  return (
    <PageHeader
      title="Configure Roles"
      subtitle="Roles are collections of Permission Sets."
      hideBreadCrumbs
      action={
        <div className="grid grid-flow-col gap-4">
          <Button
            buttonType="link"
            onClick={(e) =>
              handleLinkClick("/settings/user_management/groups", e)
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setStep(UserManagementStepsEnum.ConfigurePermissionSets);
            }}
          >
            Back
          </Button>
          <Drawer trigger={<Button>Create Role</Button>}>
            {({ toggleIsOpen }: { toggleIsOpen: () => void }) => {
              const handleSuccess = () => {
                toggleIsOpen(); // Close the Drawer
              };
              const formProps = {
                onSuccess: handleSuccess,
                match: { params: {} },
              };
              return <RoleFormContainer {...formProps} />;
            }}
          </Drawer>
          <Button
            buttonType="primary"
            onClick={() => {
              handleSubmit();
            }}
          >
            Continue
          </Button>
        </div>
      }
    >
      <ListView
        disableMetadata
        renderCustomActions={(dataRow: { id?: string; type?: string }) => {
          const { id, type } = dataRow;

          return (
            type !== "admin" && (
              <Drawer
                trigger={<Button buttonHeight="extra-small">Clone</Button>}
              >
                {({ toggleIsOpen }: { toggleIsOpen: () => void }) => {
                  const handleSuccess = () => {
                    toggleIsOpen(); // Close the Drawer
                  };
                  const formProps = {
                    onSuccess: handleSuccess,
                    match: { params: { role_id: id } },
                    isClone: true,
                  };

                  return <RoleFormContainer {...formProps} />;
                }}
              </Drawer>
            )
          );
        }}
        actions={{
          Clone: () => {},
        }}
        hideAllCheckboxes
        graphqlDocument={RolesHomeDocument}
        resource={ROLE}
        constantQueryVariables={{
          actorSource: "Group",
        }}
      />
    </PageHeader>
  );
}

export default ConfigureRoles;
