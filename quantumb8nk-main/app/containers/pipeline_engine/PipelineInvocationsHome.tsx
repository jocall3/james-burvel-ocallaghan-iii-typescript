// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { startCase } from "lodash";
import ListView from "~/app/components/ListView";
import { DateRangeFormValues, PageHeader } from "~/common/ui-components";
import {
  PipelineInvocationsHomeDocument,
  PipelineEngine__PipelineInvocationStatusEnumType,
} from "~/generated/dashboard/graphqlSchema";
import { PIPELINE_INVOCATION } from "~/generated/dashboard/types/resources";
import DateSearch, {
  DATE_SEARCH_FILTER_OPTIONS,
  dateSearchMapper,
} from "~/app/components/search/DateSearch";
import { CellEnum } from "~/app/constants";
import ChoiceSearch from "../../components/search/ChoiceSearch";
import TextSearch from "../../components/search/TextSearch";
import { DEFAULT_PIPELINE_ENGINE_RESOURCE_SEARCH_COMPONENTS } from "./util";

type QueryFilter = {
  id?: string;
  status?: PipelineEngine__PipelineInvocationStatusEnumType;
  live_mode?: string;
  name?: string;
  pipeline_name?: string;
  organization_id?: string;
  parent_pipeline_id?: string;
  sidekiq_batch_id?: string;
  created_at?: DateRangeFormValues;
  cell: string;
};

const ADDITIONAL_SEARCH_COMPONENTS = [
  {
    field: "id",
    component: TextSearch,
    label: "ID",
    placeholder: "Pipeline Invocation ID",
  },
  {
    field: "status",
    label: "Status",
    component: ChoiceSearch,
    options: Object.entries(
      PipelineEngine__PipelineInvocationStatusEnumType,
    ).map(([, value]) => ({
      label: startCase(value),
      value,
    })),
  },
  {
    field: "name",
    component: TextSearch,
    label: "Pipeline Invocation Name",
    placeholder: "Pipeline Invocation Name",
  },
  {
    field: "pipeline_name",
    component: TextSearch,
    label: "Pipeline Name",
    placeholder: "Pipeline Name",
  },
  {
    field: "organization_id",
    component: TextSearch,
    label: "Organization ID",
    placeholder: "Organization ID",
  },
  {
    field: "parent_pipeline_id",
    component: TextSearch,
    label: "Parent Pipeline ID",
    placeholder: "Parent Pipeline ID",
  },
  {
    field: "sidekiq_batch_id",
    component: TextSearch,
    label: "Sidekiq Batch ID",
    placeholder: "Sidekiq Batch ID",
  },
  {
    field: "created_at",
    label: "Created At",
    options: DATE_SEARCH_FILTER_OPTIONS,
    component: DateSearch,
  },
];

export default function PipelineInvocationsHome() {
  return (
    <PageHeader title="Pipeline Invocations" hideBreadCrumbs>
      <ListView
        graphqlDocument={PipelineInvocationsHomeDocument}
        resource={PIPELINE_INVOCATION}
        mapQueryToVariables={(query: QueryFilter) => ({
          id: query.id,
          status: query.status,
          name: query.name,
          pipelineName: query.pipeline_name,
          organizationId: query.organization_id,
          parentPipelineId: query.parent_pipeline_id,
          sidekiqBatchId: query.sidekiq_batch_id,
          liveMode:
            typeof query.live_mode === "string"
              ? query.live_mode === "true"
              : true,
          createdAt: dateSearchMapper(query.created_at),
          cell: query.cell || CellEnum.US000,
        })}
        defaultSearchComponents={
          DEFAULT_PIPELINE_ENGINE_RESOURCE_SEARCH_COMPONENTS
        }
        additionalSearchComponents={ADDITIONAL_SEARCH_COMPONENTS}
        customizableColumns={false}
        scrollX
      />
    </PageHeader>
  );
}
