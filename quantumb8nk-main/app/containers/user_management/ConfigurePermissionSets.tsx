// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import { PermissionSetsHomeDocument } from "../../../generated/dashboard/graphqlSchema";
import { PERMISSION_SET } from "../../../generated/dashboard/types/resources";
import { Button, Drawer, PageHeader } from "../../../common/ui-components";
import { useHandleLinkClick } from "../../../common/utilities/handleLinkClick";
import { UserManagementStepsEnum } from "./utilities";
import PermissionSetFormContainer from "./forms/PermissionSetFormContainer";

function ConfigurePermissionSets({
  setStep,
}: {
  setStep: (step: UserManagementStepsEnum) => void;
}) {
  const handleLinkClick = useHandleLinkClick();
  const handleSubmit = () => {
    setStep(UserManagementStepsEnum.ConfigureRoles);
  };

  return (
    <PageHeader
      title="Configure Permission Sets"
      subtitle="Permission Sets are collections of permissions with access control."
      hideBreadCrumbs
      action={
        <div className="grid grid-flow-col gap-6">
          <Button
            buttonType="link"
            onClick={(e) =>
              handleLinkClick("/settings/user_management/groups", e)
            }
          >
            Cancel
          </Button>
          <Drawer trigger={<Button>Create Permission Set</Button>}>
            {({ toggleIsOpen }: { toggleIsOpen: () => void }) => {
              const handleSuccess = () => {
                toggleIsOpen(); // Close the Drawer
              };
              const formProps = {
                onSuccess: handleSuccess,
                match: { params: {} },
              };

              return <PermissionSetFormContainer {...formProps} />;
            }}
          </Drawer>
          <Button
            buttonType="primary"
            onClick={() => {
              handleSubmit();
            }}
            isSubmit
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
                    match: { params: { permission_set_id: id } },
                    isClone: true,
                  };

                  return <PermissionSetFormContainer {...formProps} />;
                }}
              </Drawer>
            )
          );
        }}
        actions={{
          Clone: () => {},
        }}
        hideAllCheckboxes
        graphqlDocument={PermissionSetsHomeDocument}
        resource={PERMISSION_SET}
      />
    </PageHeader>
  );
}

export default ConfigurePermissionSets;
