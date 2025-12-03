// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Button,
  ButtonClickEventTypes,
  Drawer,
} from "../../../common/ui-components";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";
import PermissionSetFormContainer from "./forms/PermissionSetFormContainer";
import RoleFormContainer from "./forms/RoleFormContainer";

export function DrawerButton({
  trigger,
  resourceId,
  isClone,
  resource,
}: {
  trigger: React.ReactNode;
  resourceId: string;
  isClone: boolean;
  resource: string;
}) {
  let ResourceForm:
    | typeof PermissionSetFormContainer
    | typeof RoleFormContainer;
  if (resource === "permission_set") {
    ResourceForm = PermissionSetFormContainer;
  } else if (resource === "role") {
    ResourceForm = RoleFormContainer;
  }
  return (
    <Drawer trigger={trigger} stackedDrawerEnabled>
      {({ toggleIsOpen }: { toggleIsOpen: () => void }) => {
        const handleSuccess = () => {
          toggleIsOpen(); // Close the Drawer
        };
        const formProps = {
          isClone,
          onSuccess: handleSuccess,
          match: { params: { [`${resource}_id`]: resourceId } },
        };
        return <ResourceForm {...formProps} />;
      }}
    </Drawer>
  );
}

/**
 * Button for either the Clone or Edit action in the Role or Permission Set drawer.
 * If the button is in a drawer, the form will show up in a stacked drawer when clicked.
 * If the button isn't, the button click will redirect to the full form page.
 */
export function AuthorizationDrawerButton({
  isDrawerContent,
  resourceId,
  path,
  isClone,
  resource,
}: {
  isDrawerContent: boolean | undefined;
  resourceId: string;
  path: string;
  isClone: boolean;
  resource: string;
}) {
  return isDrawerContent ? (
    <DrawerButton
      trigger={
        <Button buttonType={isClone ? "secondary" : "primary"}>
          {isClone ? "Clone" : "Edit"}
        </Button>
      }
      resourceId={resourceId}
      isClone={isClone}
      resource={resource}
    />
  ) : (
    <Button
      buttonType={isClone ? "secondary" : "primary"}
      onClick={(e: ButtonClickEventTypes) => {
        handleLinkClick(path, e);
      }}
    >
      {isClone ? "Clone" : "Edit"}
    </Button>
  );
}
