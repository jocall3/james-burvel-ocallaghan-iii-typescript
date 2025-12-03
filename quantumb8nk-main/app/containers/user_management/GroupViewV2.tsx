// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import AuditRecordsHome from "../../components/AuditRecordsHome";
import {
  Layout,
  SectionNavigator,
  Button,
  ButtonClickEventTypes,
} from "../../../common/ui-components";
import DetailsTable from "../../components/DetailsTable";
import sectionWithNavigator from "../sectionWithNavigator";
import {
  RolesHomeDocument,
  useGroupDetailsTableQuery,
  useGroupViewQuery,
  useDeleteGroupMutation,
} from "../../../generated/dashboard/graphqlSchema";
import { GROUP, ROLE } from "../../../generated/dashboard/types/resources";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import GroupUsersView from "~/app/containers/groups/GroupUsersView";
import { useDispatchContext } from "~/app/MessageProvider";

const SECTIONS = {
  roles: "Roles",
  members: "Members",
  auditTrail: "Audit Trail",
};

function GroupView({
  match: {
    params: { group_id: groupId },
  },
  isDrawerContent,
  currentSection,
  setCurrentSection,
}: {
  match: { params: { group_id: string } };
  isDrawerContent: boolean;
  setCurrentSection: (section: string) => void;
  currentSection: string;
}) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const { data, loading } = useGroupViewQuery({
    variables: { id: groupId },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteGroupMutation, { loading: isDeleting }] =
    useDeleteGroupMutation();
  const handleDeleteGroup = () => {
    deleteGroupMutation({
      variables: { input: { id: groupId } },
      refetchQueries: ["GroupsHome"],
    })
      .then(({ data: res }) => {
        if (res?.deleteGroup?.errors.length) {
          dispatchError(res?.deleteGroup?.errors.length.toString());
        } else {
          dispatchSuccess("Group successfully deleted.");
          if (!isDrawerContent) {
            handleLinkClick("/settings/user_management/groups", undefined);
          }
        }
      })
      .catch((e: Error) => dispatchError(e.message));
  };
  const canDeleteGroup = !loading && !isDeleting && data?.group?.deletable;

  let content;
  switch (currentSection) {
    case "roles":
      content = (
        <div id="roles">
          <ListView
            customizableColumns={false}
            disableMetadata
            graphqlDocument={RolesHomeDocument}
            resource={ROLE}
            constantQueryVariables={{
              actorId: groupId,
              actorSource: "Group",
            }}
          />
        </div>
      );
      break;
    case "members":
      content = <GroupUsersView groupId={groupId} />;
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{ entityId: groupId, entityType: "Group" }}
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
          name: "Groups",
          path: "/settings/user_management/groups",
        },
      ]}
      title={`${data?.group?.name || ""}`}
      right={
        <>
          <Button
            buttonType="primary"
            onClick={(e: ButtonClickEventTypes) => {
              handleLinkClick(
                `/settings/user_management/groups/${groupId}/edit`,
                e,
              );
            }}
          >
            Edit
          </Button>
          {canDeleteGroup && (
            <Button buttonType="destructive" onClick={handleDeleteGroup}>
              Delete
            </Button>
          )}
        </>
      }
    >
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={useGroupDetailsTableQuery}
            id={groupId}
            resource={GROUP}
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

export default sectionWithNavigator(GroupView, "roles");
