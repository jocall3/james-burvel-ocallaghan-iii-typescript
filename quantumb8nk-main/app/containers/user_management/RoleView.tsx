// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import {
  Button,
  Layout,
  SectionNavigator,
} from "../../../common/ui-components";
import DetailsTable from "../../components/DetailsTable";
import {
  useRoleDetailsTableQuery,
  useRoleViewQuery,
  GroupsHomeDocument,
  PermissionSetsHomeDocument,
  useDeleteRoleMutation,
} from "../../../generated/dashboard/graphqlSchema";
import {
  ROLE,
  GROUP,
  PERMISSION_SET,
} from "../../../generated/dashboard/types/resources";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import sectionWithNavigator from "../sectionWithNavigator";
import AuditRecordsHome from "../../components/AuditRecordsHome";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";
import { useDispatchContext } from "~/app/MessageProvider";
import { AuthorizationDrawerButton } from "./drawerUtils";
import GroupSimplePermissionsView from "../groups/GroupSimplePermissionsView";
import GroupAccountPermissionsView from "../groups/GroupAccountPermissionsView";
import { INITIAL_PAGINATION } from "~/app/components/EntityTableView";

function RoleView({
  match: {
    params: { role_id: roleId },
  },
  isDrawerContent,
  currentSection,
  setCurrentSection,
}: {
  match: { params: { role_id: string } };
  isDrawerContent: boolean;
  setCurrentSection: (section: string) => void;
  currentSection: string;
}) {
  const AUDIT_TRAIL = "auditTrail";

  const SECTIONS = {
    groups: "Groups",
    permissionSets: "Permission Sets",
  };

  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const { data, loading, refetch } = useRoleViewQuery({
    variables: { id: roleId, first: INITIAL_PAGINATION.perPage },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteRoleMutation, { loading: isDeleting }] = useDeleteRoleMutation();
  const handleDeleteRole = () => {
    deleteRoleMutation({
      variables: { input: { id: roleId } },
      refetchQueries: ["RolesHome"],
    })
      .then(({ data: res }) => {
        if (res?.deleteRole?.errors.length) {
          dispatchError(res?.deleteRole?.errors.length.toString());
        } else {
          dispatchSuccess("Role successfully deleted.");
          if (!isDrawerContent) {
            handleLinkClick("/settings/user_management/roles", undefined);
          }
        }
      })
      .catch((e: Error) => dispatchError(e.message));
  };
  const canEditDelete = !isDeleting && data?.role?.updateable;

  if (!data?.role?.mtManaged) {
    SECTIONS[AUDIT_TRAIL] = "Audit Trail";
  }

  let content;
  switch (currentSection) {
    case "groups":
      content = (
        <div id="groups">
          <ListView
            customizableColumns={false}
            displayColumnIdsToFilter={["permissionsStatus", "updatedAt"]}
            disableMetadata
            graphqlDocument={GroupsHomeDocument}
            resource={GROUP}
            constantQueryVariables={{
              roleId,
            }}
          />
        </div>
      );
      break;
    case "permissionSets":
      content = (
        <div id="groups">
          {data?.role?.legacy ? (
            <>
              <GroupSimplePermissionsView
                roles={data?.role?.deprecatedRoles}
                loading={loading}
              />
              <GroupAccountPermissionsView
                internalAccounts={data?.internalAccounts}
                refetch={refetch}
                deprecatedRoles={data?.role?.deprecatedRoles}
                loading={loading}
              />
            </>
          ) : (
            <ListView
              customizableColumns={false}
              displayColumnIdsToFilter={["mtManaged", "updatedAt"]}
              disableMetadata
              graphqlDocument={PermissionSetsHomeDocument}
              resource={PERMISSION_SET}
              constantQueryVariables={{
                roleId,
              }}
            />
          )}
        </div>
      );
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{ entityId: roleId, entityType: "Authorization::Role" }}
          hideHeadline
        />
      );
      break;
    default:
      break;
  }

  return (
    <PageHeader
      title={`${data?.role?.name || ""}`}
      hideBreadCrumbs={isDrawerContent}
      crumbs={[
        { name: "User Management", path: "/settings/user_management/groups" },
        {
          name: "Roles",
          path: "/settings/user_management/roles",
        },
      ]}
      right={
        <>
          {data?.role?.updateable && (
            <AuthorizationDrawerButton
              isDrawerContent={isDrawerContent}
              resourceId={roleId}
              path={`/settings/user_management/roles/new?role_id=${roleId}`}
              isClone
              resource="role"
            />
          )}
          {canEditDelete && (
            <>
              <AuthorizationDrawerButton
                isDrawerContent={isDrawerContent}
                resourceId={roleId}
                path={`/settings/user_management/roles/${roleId}/edit`}
                isClone={false}
                resource="role"
              />
              <Button buttonType="destructive" onClick={handleDeleteRole}>
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
            graphqlQuery={useRoleDetailsTableQuery}
            id={roleId}
            resource={ROLE}
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

export default sectionWithNavigator(RoleView, "groups");
