// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Layout,
  SectionNavigator,
  Button,
} from "../../../common/ui-components";
import DetailsTable from "../../components/DetailsTable";
import {
  usePermissionSetDetailsTableQuery,
  usePermissionSetViewQuery,
  RolesHomeDocument,
  useDeletePermissionSetMutation,
} from "../../../generated/dashboard/graphqlSchema";
import {
  PERMISSION_SET,
  ROLE,
} from "../../../generated/dashboard/types/resources";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import sectionWithNavigator from "../sectionWithNavigator";
import AuditRecordsHome from "../../components/AuditRecordsHome";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";
import ListView from "../../components/ListView";
import { useDispatchContext } from "~/app/MessageProvider";
import PermissionsTable from "./PermissionsTable";
import { AuthorizationDrawerButton } from "./drawerUtils";

function PermissionSetView({
  match: {
    params: { permission_set_id: permissionSetId },
  },
  isDrawerContent,
  currentSection,
  setCurrentSection,
}: {
  match: { params: { permission_set_id: string } };
  isDrawerContent?: boolean;
  setCurrentSection: (section: string) => void;
  currentSection: string;
}) {
  const AUDIT_TRAIL = "auditTrail";

  const SECTIONS = {
    permissions: "Permissions",
    roles: "Roles",
  };

  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const { data } = usePermissionSetViewQuery({
    variables: { id: permissionSetId },
    notifyOnNetworkStatusChange: true,
  });

  const [deletePermissionSetMutation, { loading: isDeleting }] =
    useDeletePermissionSetMutation();
  const handleDeletePermissionSet = () => {
    deletePermissionSetMutation({
      variables: { input: { id: permissionSetId } },
      refetchQueries: ["PermissionSetsHome"],
    })
      .then(({ data: res }) => {
        if (res?.deletePermissionSet?.errors.length) {
          dispatchError(res?.deletePermissionSet?.errors.length.toString());
        } else {
          dispatchSuccess("Permission Set successfully deleted.");
          if (!isDrawerContent) {
            handleLinkClick(
              "/settings/user_management/permission_sets",
              undefined,
            );
          }
        }
      })
      .catch((e: Error) => dispatchError(e.message));
  };

  const canEditDelete = !isDeleting && data?.permissionSet?.updateable;

  if (!data?.permissionSet?.mtManaged) {
    SECTIONS[AUDIT_TRAIL] = "Audit Trail";
  }

  let content;
  switch (currentSection) {
    case "permissions":
      content = (
        <div id="permissions">
          {data && (
            <PermissionsTable
              permissions={data.permissionSet?.permissions || []}
            />
          )}
        </div>
      );
      break;

    case "roles":
      content = (
        <div id="roles">
          <ListView
            customizableColumns={false}
            displayColumnIdsToFilter={["mtManaged", "updatedAt"]}
            disableMetadata
            graphqlDocument={RolesHomeDocument}
            resource={ROLE}
            constantQueryVariables={{
              permissionSetId,
              actorSource: "Group",
            }}
          />
        </div>
      );
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: permissionSetId,
            entityType: "Authorization::PermissionSet",
          }}
          hideHeadline
        />
      );
      break;
    default:
      break;
  }

  return (
    <PageHeader
      hideBreadCrumbs={isDrawerContent}
      crumbs={[
        { name: "User Management", path: "/settings/user_management/groups" },
        {
          name: "Permission Sets",
          path: "/settings/user_management/permission_sets",
        },
      ]}
      title={`${data?.permissionSet?.name || ""}`}
      right={
        <>
          {data?.permissionSet?.cloneable && (
            <AuthorizationDrawerButton
              isDrawerContent={isDrawerContent}
              resourceId={permissionSetId}
              path={`/settings/user_management/permission_sets/new?permission_set_id=${permissionSetId}`}
              isClone
              resource="permission_set"
            />
          )}
          {canEditDelete && (
            <>
              <AuthorizationDrawerButton
                isDrawerContent={isDrawerContent}
                resourceId={permissionSetId}
                path={`/settings/user_management/permission_sets/${permissionSetId}/edit`}
                isClone={false}
                resource="permission_set"
              />
              <Button
                buttonType="destructive"
                onClick={handleDeletePermissionSet}
              >
                Delete
              </Button>
            </>
          )}
        </>
      }
    >
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={usePermissionSetDetailsTableQuery}
            id={permissionSetId}
            resource={PERMISSION_SET}
          />
        }
        secondaryContent={
          <div>
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={(section: string) => setCurrentSection(section)}
            />
            {content}
          </div>
        }
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(PermissionSetView, "permissions");
