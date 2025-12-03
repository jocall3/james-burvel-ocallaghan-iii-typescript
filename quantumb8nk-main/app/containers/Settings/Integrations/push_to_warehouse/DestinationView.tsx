// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import DetailsTable from "~/app/components/DetailsTable";
import ListView from "~/app/components/ListView";
import {
  ButtonClickEventTypes,
  Layout,
  PageHeader,
} from "~/common/ui-components";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import NotFound from "~/errors/components/NotFound";
import {
  TransfersViewDocument,
  useDestinationDetailsTableQuery,
  useDestinationViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import { DESTINATION, TRANSFER } from "~/generated/dashboard/types/resources";

type RouterProps = {
  match: {
    params: {
      destination_id: string;
    };
  };
};

export default function DestinationView({
  match: {
    params: { destination_id: destinationId },
  },
}: RouterProps) {
  const { loading, data, error } = useDestinationViewQuery({
    variables: { id: destinationId },
  });

  if ((!loading && !data?.destination) || error) {
    return (
      <NotFound
        message="Unable to find the Push to Warehouse destination."
        ctaText="Push to Warehouse Home"
        onCtaClick={(event: ButtonClickEventTypes) =>
          handleLinkClick("/settings/push_to_warehouse", event)
        }
      />
    );
  }

  return (
    <PageHeader
      title={data?.destination?.name || ""}
      crumbs={[
        { name: "Push to Warehouse" },
        {
          name: "Destinations",
          path: "/settings/push_to_warehouse/destinations",
        },
      ]}
    >
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={useDestinationDetailsTableQuery}
            id={destinationId}
            resource={DESTINATION}
          />
        }
        secondaryContent={
          <ListView
            title="Recent Transfers"
            resource={TRANSFER}
            graphqlDocument={TransfersViewDocument}
            mapQueryToVariables={() => ({
              destinationId,
            })}
            disableMetadata
          />
        }
        ratio="1/3"
      />
    </PageHeader>
  );
}
