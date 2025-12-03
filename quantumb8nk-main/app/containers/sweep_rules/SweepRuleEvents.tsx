// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { DateTime } from "../../../common/ui-components";
import { useEventsHomeQuery } from "../../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../../types/CursorPaginationInput";
import { dateSearchMapper } from "../../components/search/DateSearch";
import { EventQueryFilter } from "../../../common/search_components/eventSearchComponents";
import { EVENT } from "../../../generated/dashboard/types/resources";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../components/EntityTableView";

const EVENTS_MAPPING = {
  eventName: "Event",
  createdAt: "Timestamp",
  entityId: "Entity ID",
};

const STYLE_MAPPING = {
  entityId: "table-entry-wide table-entry-hide-small",
};

export default function SweepRuleEvents({
  sweepRuleId,
}: {
  sweepRuleId: string;
}) {
  const { loading, data, error, refetch } = useEventsHomeQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: INITIAL_PAGINATION.perPage,
      entityId: sweepRuleId,
    },
  });

  const events =
    loading || !data || error
      ? []
      : data.events.edges.map(({ node }) => ({
          ...node,
          eventName: `${node.resource}.${node.name}`,
          createdAt: <DateTime timestamp={node.createdAt} />,
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
    query: EventQueryFilter;
  }) => {
    const { cursorPaginationParams, query } = options;

    await refetch({
      name: query.name,
      eventTime: dateSearchMapper(query.event_time),
      entityId: sweepRuleId,
      resource: query.resource,
      ...cursorPaginationParams,
    });
  };
  return (
    <EntityTableView
      data={events}
      loading={loading}
      dataMapping={EVENTS_MAPPING}
      styleMapping={STYLE_MAPPING}
      onQueryArgChange={handleRefetch}
      cursorPagination={
        data?.events?.pageInfo
          ? data?.events?.pageInfo
          : { hasNextPage: false, hasPreviousPage: false }
      }
      resource={EVENT}
    />
  );
}
