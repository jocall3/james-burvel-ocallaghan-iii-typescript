// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useParams } from "react-router";
import { ClipLoader } from "react-spinners";
import sectionWithNavigator from "../../sectionWithNavigator";
import { useUserViewDeprecatedQuery } from "../../../../generated/dashboard/graphqlSchema";
import {
  IndexTable,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "../../../../common/ui-components";
import AuditRecordsHome from "../../../components/AuditRecordsHome";
import ActionBadge from "./ActionBadge";
import NotFound from "../../../../errors/components/NotFound";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";

const USER_DATA_MAPPING = {
  details: {
    userName: "Name",
    userEmail: "Email",
    lastLoggedInAt: "Last Logged In At",
  },
  authentication: {
    required: "Multifactor Authentication",
  },
  liveRoles: {
    name: "Name",
    description: "Description",
  },
  testRoles: {
    name: "Name",
    description: "Description",
  },
};
const SECTIONS = {
  details: "Details",
  authentication: "Multi-factor authentication",
  liveRoles: "Roles (Live Mode)",
  testRoles: "Roles (Test Mode)",
  auditTrail: "Audit Trail",
};

interface UserViewProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

function UserView({ currentSection, setCurrentSection }: UserViewProps) {
  const { user_id: userId } = useParams<{ user_id: string }>();
  const { loading, data, error } = useUserViewDeprecatedQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      id: userId,
    },
  });

  if (loading || error || !data) {
    return <ClipLoader />;
  }

  if (!loading && data?.users.nodes.length === 0) {
    return (
      <NotFound
        message="Unable to find User."
        subtext="We can’t find the page you’re looking for."
      />
    );
  }

  const {
    abilities: {
      User: { canUpdate: canEditUsers },
    },
    users: {
      nodes: [
        {
          name: userName,
          email: userEmail,
          lastLoggedInAt,
          discardedAt,
          additionalSecurity,
          groupMemberships,
        },
      ],
    },
  } = data;

  let content;
  const liveRoles = groupMemberships.filter((gu) => gu.liveMode);
  const testRoles = groupMemberships.filter((gu) => !gu.liveMode);
  switch (SECTIONS[currentSection]) {
    case SECTIONS.details:
      content = loading ? (
        <KeyValueTableSkeletonLoader dataMapping={USER_DATA_MAPPING.details} />
      ) : (
        <KeyValueTable
          data={{ userName, userEmail, lastLoggedInAt }}
          dataMapping={USER_DATA_MAPPING.details}
        />
      );
      break;
    case SECTIONS.authentication:
      content = loading ? (
        <KeyValueTableSkeletonLoader
          dataMapping={USER_DATA_MAPPING.authentication}
        />
      ) : (
        <KeyValueTable
          data={{
            required: additionalSecurity.auth0Mfa == null ? "false" : "true",
          }}
          dataMapping={USER_DATA_MAPPING.authentication}
        />
      );
      break;
    case SECTIONS.liveRoles:
      content = (
        <IndexTable
          data={liveRoles}
          dataMapping={USER_DATA_MAPPING.liveRoles}
        />
      );
      break;
    case SECTIONS.testRoles:
      content = (
        <IndexTable
          data={testRoles}
          dataMapping={USER_DATA_MAPPING.testRoles}
        />
      );
      break;
    case SECTIONS.auditTrail:
      content = (
        <AuditRecordsHome
          queryArgs={{ entityId: userId, entityType: "User" }}
          hideHeadline
        />
      );
      break;
    default:
      content = null;
      break;
  }
  return (
    <PageHeader
      action={
        <ActionBadge
          discardedAt={discardedAt}
          canEditUsers={canEditUsers}
          userId={userId}
        />
      }
      crumbs={[
        {
          name: "Users",
          path: "/settings/users",
        },
      ]}
      currentSection={currentSection}
      title={userName as string}
      sections={SECTIONS}
      setCurrentSection={(section: string) => setCurrentSection(section)}
    >
      {content}
    </PageHeader>
  );
}

export default sectionWithNavigator(UserView, "details");
