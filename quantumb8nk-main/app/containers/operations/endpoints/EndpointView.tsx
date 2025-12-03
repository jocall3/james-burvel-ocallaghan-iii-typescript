// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader, Layout, SectionNavigator } from "~/common/ui-components";
import {
  useEndpointDetailsTableQuery,
  useOperationsEndpointViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import DetailsTable from "~/app/components/DetailsTable";
import { ENDPOINT } from "~/generated/dashboard/types/resources";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import sectionWithNavigator from "../../sectionWithNavigator";

const SECTIONS = {
  credentials: "Credentials",
  fileTransfers: "File Transfers",
  search: "Search",
  auditTrail: "Audit Trail",
};

interface EndpointViewProps {
  match: {
    params: {
      id: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function EndpointView({
  match: {
    params: { id },
  },
  setCurrentSection,
  currentSection,
}: EndpointViewProps) {
  const { data, loading } = useOperationsEndpointViewQuery({
    variables: {
      id,
    },
  });

  const endpoint = data?.operationsEndpoint;

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "View Endpoint",
    loading,
  };

  if (!loading && endpoint) {
    pageHeaderProps = {
      title: endpoint.id,
      crumbs: [
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Endpoints",
          path: "/operations/endpoints",
        },
      ],
    };
  }

  switch (currentSection) {
    case "auditTrail": {
      content = <div>Audit Trail Here</div>;
      break;
    }
    case "fileTransfers": {
      content = <div className="flex flex-col gap-y-4">File Transfers</div>;
      break;
    }
    case "search": {
      content = <div className="flex flex-col gap-y-4">Search / Tree</div>;
      break;
    }
    case "credentials": {
      content = <div className="flex flex-col gap-y-4">Credentials Here</div>;
      break;
    }
    default:
      break;
  }

  return (
    <PageHeader {...pageHeaderProps}>
      <Layout
        ratio="1/3"
        primaryContent={
          <div>
            <DetailsTable
              graphqlQuery={useEndpointDetailsTableQuery}
              id={id}
              resource={ENDPOINT}
            />
          </div>
        }
        secondaryContent={
          <div>
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={setCurrentSection}
            />
            {content}
          </div>
        }
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(EndpointView, "credentials");
