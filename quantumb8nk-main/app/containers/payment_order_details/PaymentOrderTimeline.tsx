// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from "react";
import { cn } from "~/common/utilities/cn";
import { Badge, Button, DateTime, Icon } from "../../../common/ui-components";
import {
  ExportObjectEnum,
  PaymentOrder__StatusEnum,
  TimelineEnum,
  usePaymentOrderTimelinesQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../../types/CursorPaginationInput";
import { PAYMENT_ORDER_STATUS_TO_BADGE } from "../../constants";
import { useURLState } from "../../../common/utilities/useURLState";
import EntityTableView from "../../components/EntityTableView";
import { getDrawerContent } from "../../../common/utilities/getDrawerContent";
import ExportDataButton, {
  ExportDataParams,
} from "../../components/ExportDataButton";
import ArchivedRecordsBanner from "../../components/exporting/ArchivedRecordsBanner";

interface PaymentOrderTimelineProps {
  paymentOrderId: string;
}

type QueryFilter = {
  timelineType?: TimelineEnum;
};

const TYPE_TO_ICON: Record<TimelineEnum, React.ReactNode> = {
  [TimelineEnum.StatusChange]: (
    <Icon
      iconName="checkmark_circle"
      size="s"
      color="currentColor"
      className="text-gray-600"
    />
  ),
  [TimelineEnum.AuditRecord]: (
    <Icon
      iconName="flag"
      size="s"
      color="currentColor"
      className="text-gray-600"
    />
  ),
  [TimelineEnum.Event]: (
    <Icon
      iconName="calendar_month"
      size="s"
      color="currentColor"
      className="text-gray-600"
    />
  ),
  [TimelineEnum.BulkRequest]: (
    <Icon
      iconName="mt_developers"
      size="s"
      color="currentColor"
      className="text-gray-600"
    />
  ),
};

const TYPE_TO_DRAWER_TYPE: Record<TimelineEnum, string | null> = {
  [TimelineEnum.Event]: "Event",
  [TimelineEnum.AuditRecord]: "AuditRecord",
  [TimelineEnum.StatusChange]: null,
  [TimelineEnum.BulkRequest]: null,
};

const TIMELINE_FILTERS: Record<string, string> = {
  all: "All",
  audit_record: "Audits",
  event: "Events",
  status_change: "Status",
  bulk_request: "Bulk Requests",
};

const PER_PAGE = 15;

interface TimelineFilterProps {
  setSelected: (state: string) => void;
  selected: string;
}

function TimelineFilter({ setSelected, selected }: TimelineFilterProps) {
  return (
    <>
      {Object.entries(TIMELINE_FILTERS).map(([type, prettyType]) => (
        <Button
          key={type}
          className={cn(
            "flex items-center rounded-sm border text-xs font-normal text-gray-700 hover:!bg-transparent",
            type === selected
              ? "border-alpha-black-100 bg-white hover:!bg-white"
              : "border-transparent",
          )}
          onClick={() => setSelected(type)}
          buttonType="text"
          buttonHeight="small"
          hideFocusOutline
        >
          {prettyType}
        </Button>
      ))}
    </>
  );
}

function PaymentOrderTimeline({ paymentOrderId }: PaymentOrderTimelineProps) {
  const DEFAULT_TIMELINE_FILTER = { timelineType: "all" };
  const [filter, setFilter] = useURLState({
    initialState: DEFAULT_TIMELINE_FILTER,
  });

  const { loading, data, error, refetch } = usePaymentOrderTimelinesQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: PER_PAGE,
      paymentOrderId,
    },
  });

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
    query: QueryFilter;
  }) => {
    const { cursorPaginationParams, query } = options;
    await refetch({
      paymentOrderId,
      timelineType: query.timelineType,
      ...cursorPaginationParams,
    });
  };

  useEffect(() => {
    const query = {
      ...(filter.timelineType !== "all" && {
        timelineType: filter.timelineType as TimelineEnum,
      }),
    };

    void handleRefetch({
      cursorPaginationParams: {
        first: PER_PAGE,
      },
      query,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const paymentOrderTimeline =
    loading || !data || error
      ? []
      : data.paymentOrderTimelines.edges.map(({ node }) => ({
          ...node,
          typeIcon: (
            <div className="flex h-6 items-center">
              {TYPE_TO_ICON[node.timelineType]}
            </div>
          ),
          detail:
            node.timelineType === TimelineEnum.StatusChange ? (
              <div className="flex">
                <Badge
                  keepCaseFormat
                  text={node.prettyDetail || ""}
                  type={
                    PAYMENT_ORDER_STATUS_TO_BADGE[
                      node.name.toLowerCase() as PaymentOrder__StatusEnum
                    ]
                  }
                />
              </div>
            ) : (
              node.prettyDetail
            ),
          eventTime: <DateTime timestamp={node.eventTime} />,
          drawerEntityType: TYPE_TO_DRAWER_TYPE[node.timelineType],
        }));

  const cursorPagination = data?.paymentOrderTimelines?.pageInfo ?? {
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const exportDataParams: ExportDataParams = [
    {
      dropdownLabel: "Audit Records",
      overrideExportableType: ExportObjectEnum.AuditRecord,
      params: {
        entity_id: paymentOrderId,
        entity_type: "PaymentOrder",
      },
    },
    {
      dropdownLabel: "Events",
      overrideExportableType: ExportObjectEnum.Event,
      params: {
        entity_id: paymentOrderId,
        entity_type: "PaymentOrder",
      },
    },
  ];

  const showHistoricalExportNotification: boolean =
    !loading &&
    !!data?.relatedRecordsAreArchived &&
    (filter.timelineType === "all" || filter.timelineType === "audit_record");

  return (
    <div id="payment-order-timeline">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-1 border-b border-gray-50 pb-2">
        <p className="text-base font-medium">Timeline</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-row items-center rounded-md bg-alpha-black-50">
            <TimelineFilter
              setSelected={(type) => setFilter({ timelineType: type })}
              selected={filter.timelineType}
            />
          </div>
          <ExportDataButton
            buttonHeight="small"
            exportDataParams={exportDataParams}
            buttonType="subtle"
            // This value is required but is overridden by both of the export options so it's ignored.
            exportableType={ExportObjectEnum.AuditRecord}
            iconOnly
          />
        </div>
      </div>
      {showHistoricalExportNotification && (
        <ArchivedRecordsBanner
          className="mb-2"
          liveMode={!!data?.currentOrganization.currentLiveMode}
          resourceType="AuditRecord"
        />
      )}
      <EntityTableView
        renderDrawerContent={getDrawerContent}
        data={paymentOrderTimeline}
        loading={loading}
        dataMapping={{
          typeIcon: "",
          prettyType: "Type",
          detail: "Detail",
          eventTime: "Time",
        }}
        styleMapping={{
          typeIcon: "!pt-2 !pb-1 grow-0 basis-4",
          detail: "!py-1 items-center",
        }}
        onQueryArgChange={handleRefetch}
        cursorPagination={cursorPagination}
        defaultPerPage={PER_PAGE}
      />
    </div>
  );
}

export default PaymentOrderTimeline;
