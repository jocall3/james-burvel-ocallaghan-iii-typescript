// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { startCase } from "lodash";
import ListView from "~/app/components/ListView";
import { DateRangeFormValues, PageHeader } from "~/common/ui-components";
import {
  StepInvocationsHomeDocument,
  PipelineEngine__StepInvocationStatusEnumType,
} from "~/generated/dashboard/graphqlSchema";
import { STEP_INVOCATION } from "~/generated/dashboard/types/resources";
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
  status?: PipelineEngine__StepInvocationStatusEnumType;
  live_mode?: string;
  step_name?: string;
  pipeline_invocation_id?: string;
  organization_id?: string;
  sidekiq_batch_id?: string;
  sidekiq_job_id?: string;
  created_at?: DateRangeFormValues;
  cell: string;
};

const ADDITIONAL_SEARCH_COMPONENTS = [
  {
    field: "id",
    component: TextSearch,
    label: "ID",
    placeholder: "Step Invocation ID",
  },
  {
    field: "status",
    label: "Status",
    component: ChoiceSearch,
    options: Object.entries(PipelineEngine__StepInvocationStatusEnumType).map(
      ([, value]) => ({
        label: startCase(value),
        value,
      }),
    ),
  },
  {
    field: "step_name",
    component: TextSearch,
    label: "Step Name",
    placeholder: "Step Name",
  },
  {
    field: "pipeline_invocation_id",
    component: TextSearch,
    label: "Pipeline Invocation ID",
    placeholder: "Pipeline Invocation ID",
  },
  {
    field: "organization_id",
    component: TextSearch,
    label: "Organization ID",
    placeholder: "Organization ID",
  },
  {
    field: "sidekiq_batch_id",
    component: TextSearch,
    label: "Sidekiq Batch ID",
    placeholder: "Sidekiq Batch ID",
  },
  {
    field: "sidekiq_job_id",
    component: TextSearch,
    label: "Sidekiq Job ID",
    placeholder: "Sidekiq Job ID",
  },
  {
    field: "created_at",
    label: "Created At",
    options: DATE_SEARCH_FILTER_OPTIONS,
    component: DateSearch,
  },
];

export default function StepInvocationsHome() {
  return (
    <PageHeader title="Step Invocations" hideBreadCrumbs>
      <ListView
        graphqlDocument={StepInvocationsHomeDocument}
        resource={STEP_INVOCATION}
        mapQueryToVariables={(query: QueryFilter) => ({
          id: query.id,
          status: query.status,
          stepName: query.step_name,
          pipelineInvocationId: query.pipeline_invocation_id,
          organizationId: query.organization_id,
          sidekiqJobId: query.sidekiq_job_id,
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
