// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "../../components/ListView";
import AuditRecordsHome from "../../components/AuditRecordsHome";
import {
  Button,
  ButtonClickEventTypes,
  Layout,
  SectionNavigator,
} from "../../../common/ui-components";
import DetailsTable from "../../components/DetailsTable";
import sectionWithNavigator from "../sectionWithNavigator";
import {
  GroupsHomeDocument,
  useUserDetailsTableQuery,
  useUserViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { GROUP, USER } from "../../../generated/dashboard/types/resources";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

const SECTIONS = {
  groups: "Groups",
  auditTrail: "Audit Trail",
};

function UserView({
  match: {
    params: { user_id: userId },
  },
  currentSection,
  setCurrentSection,
  isDrawerContent,
}: {
  match: { params: { user_id: string } };
  setCurrentSection: (section: string) => void;
  currentSection: string;
  isDrawerContent: boolean;
}) {
  let content;
  const { data } = useUserViewQuery({
    variables: { id: userId },
    notifyOnNetworkStatusChange: true,
  });
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
              userId,
            }}
          />
        </div>
      );
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{ entityId: userId, entityType: "User" }}
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
          name: "Users",
          path: "/settings/user_management/users",
        },
      ]}
      title={`${data?.user?.name || ""}`}
      right={
        <Button
          buttonType="primary"
          onClick={(e: ButtonClickEventTypes) => {
            handleLinkClick(
              `/settings/user_management/users/${userId}/edit`,
              e,
            );
          }}
        >
          Edit
        </Button>
      }
    >
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={useUserDetailsTableQuery}
            id={userId}
            resource={USER}
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

export default sectionWithNavigator(UserView, "groups");
