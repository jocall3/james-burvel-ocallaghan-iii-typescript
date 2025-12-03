// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import DetailsTable from "~/app/components/DetailsTable";
import { ButtonClickEventTypes, PageHeader } from "~/common/ui-components";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import NotFound from "~/errors/components/NotFound";
import {
  useTransferDetailsTableQuery,
  useTransferViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import { TRANSFER } from "~/generated/dashboard/types/resources";

type RouterProps = {
  match: {
    params: {
      transfer_id: string;
    };
  };
};

export default function TransferView({
  match: {
    params: { transfer_id: transferId },
  },
}: RouterProps) {
  const { loading, data, error } = useTransferViewQuery({
    variables: { id: transferId },
  });

  if ((!loading && (!data || !data?.transfer)) || error) {
    return (
      <NotFound
        message="Unable to find the Push to Warehouse transfer."
        ctaText="Push to Warehouse Home"
        onCtaClick={(event: ButtonClickEventTypes) =>
          handleLinkClick("/settings/push_to_warehouse", event)
        }
      />
    );
  }

  return (
    <PageHeader
      title="Transfer"
      crumbs={[
        { name: "Push to Warehouse" },
        {
          name: "Destinations",
          path: "/settings/push_to_warehouse/destinations",
        },
        {
          name: data?.transfer?.destination.name || "",
          path: `/settings/push_to_warehouse/destinations/${
            data?.transfer?.destination.id || ""
          }`,
        },
      ]}
    >
      <DetailsTable
        graphqlQuery={useTransferDetailsTableQuery}
        id={transferId}
        resource={TRANSFER}
      />
    </PageHeader>
  );
}
