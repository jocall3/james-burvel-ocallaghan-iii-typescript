// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ReactJson from "react-json-view";
import { KeyValueTable } from "../../../../common/ui-components";
import { AdminGoLiveConnectionShowQuery } from "../../../../generated/dashboard/graphqlSchema";

interface ConnectionInfoSectionProps {
  connection: AdminGoLiveConnectionShowQuery["goLiveConnection"];
}

const DATA_MAPPING = {
  id: "Id",
  entity: "Entity",
  vendorCustomerId: "Vendor Customer Id",
  extra: "Extra",
  createdAt: "Created At",
  updatedAt: "Updated At",
  discardedAt: "Discarded At",
  liveMode: "Live Mode",
  operationalStatus: "Operational Status",
};

function ConnectionInfoSection({ connection }: ConnectionInfoSectionProps) {
  const kvData = {
    ...connection,
    liveMode: connection.liveMode ? "True" : "Fase",
    extra: (
      <ReactJson
        name={false}
        displayDataTypes={false}
        displayObjectSize={false}
        src={JSON.parse(connection.extra) as Record<string, unknown>}
      />
    ),
  };
  return <KeyValueTable dataMapping={DATA_MAPPING} data={kvData} />;
}

export default ConnectionInfoSection;
