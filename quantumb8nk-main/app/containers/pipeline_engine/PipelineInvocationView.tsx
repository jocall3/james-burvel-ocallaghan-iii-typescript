// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Layout, SectionNavigator, Tag } from "~/common/ui-components";

import "reactflow/dist/style.css";
import DetailsTable from "~/app/components/DetailsTable";
import {
  PIPELINE_INVOCATION,
  STEP_INVOCATION,
} from "~/generated/dashboard/types/resources";

import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import {
  PipelineEngine__PipelineInvocationType,
  PipelineInvocationsHomeDocument,
  StepInvocationsHomeDocument,
  usePipelineInvocationDetailsTableQuery,
  usePipelineInvocationQuery,
} from "~/generated/dashboard/graphqlSchema";
import ListView from "~/app/components/ListView";
import NotFound from "~/errors/components/NotFound";
import PipelineInvocationFlowChart from "./PipelineInvocationFlowChart";

function LinkedNodesView({
  cell,
  pipelineInvocation,
}: {
  cell: string;
  pipelineInvocation: PipelineEngine__PipelineInvocationType | undefined | null;
}) {
  enum SectionKeys {
    STEP_INVOCATIONS = "stepInvocations",
    CHILD_PIPELINE_INVOCATIONS = "childPipelineInvocations",
  }
  const SECTIONS = {
    [SectionKeys.STEP_INVOCATIONS]: "Step Invocations",
    [SectionKeys.CHILD_PIPELINE_INVOCATIONS]: "Child Pipelines",
  };

  const [currentSection, setCurrentSection] = useState(
    SectionKeys.STEP_INVOCATIONS,
  );

  const showStepInvocations = () =>
    currentSection === SectionKeys.STEP_INVOCATIONS;

  if (!pipelineInvocation) {
    return null;
  }

  const childPipelineIds =
    pipelineInvocation?.childPipelines?.map((pi) => pi.id) &&
    pipelineInvocation?.childPipelines?.map((pi) => pi.id).length > 0
      ? pipelineInvocation?.childPipelines?.map((pi) => pi.id)
      : ["NONE"];

  const stepInvocationIds =
    pipelineInvocation?.stepInvocations?.map((pi) => pi.id) &&
    pipelineInvocation?.stepInvocations?.map((si) => si.id).length > 0
      ? pipelineInvocation?.stepInvocations?.map((si) => si.id)
      : ["NONE"];

  return (
    <>
      <SectionNavigator
        sections={SECTIONS}
        currentSection={currentSection}
        onClick={(section: string) => setCurrentSection(section as SectionKeys)}
      />
      <ListView
        resource={showStepInvocations() ? STEP_INVOCATION : PIPELINE_INVOCATION}
        graphqlDocument={
          showStepInvocations()
            ? StepInvocationsHomeDocument
            : PipelineInvocationsHomeDocument
        }
        constantQueryVariables={{
          id: showStepInvocations() ? stepInvocationIds : childPipelineIds,
          cell,
        }}
        customizableColumns={false}
        disableQueryURLParams
        scrollX
      />
    </>
  );
}

interface PipelineInvocationViewProps {
  match: { params: { id: string; cell: string } };
}

export default function PipelineInvocationView({
  match: {
    params: { id, cell },
  },
}: PipelineInvocationViewProps) {
  const { data, loading } = usePipelineInvocationQuery({
    variables: {
      id,
      cell,
    },
  });

  if (!data?.pipelineInvocation && !loading) {
    return (
      <NotFound
        message="Cannot to find Pipeline Invocation"
        subtext={`Id: ${id}, Cell: ${cell}`}
        hideCta
      />
    );
  }

  return (
    <PageHeader
      title={
        data?.pipelineInvocation ? `${data?.pipelineInvocation?.name}` : id
      }
      left={
        <div className="flex flex-row gap-2">
          <Tag>{data?.pipelineInvocation?.pipelineName}</Tag>
          <Tag color={data?.pipelineInvocation?.statusTagColor}>
            {data?.pipelineInvocation?.prettyStatus}
          </Tag>
        </div>
      }
      loading={loading}
      crumbs={[
        {
          name: `All Pipeline Invocations`,
          path: `/admin/pipeline_engine/pipeline_invocations`,
        },
      ]}
    >
      <Layout
        primaryContent={<PipelineInvocationFlowChart id={id} cell={cell} />}
        secondaryContent={
          <div className="flex flex-col gap-4">
            <DetailsTable
              graphqlQuery={usePipelineInvocationDetailsTableQuery}
              id={id}
              constantQueryVariables={{ cell }}
              resource={PIPELINE_INVOCATION}
            />
            <LinkedNodesView
              pipelineInvocation={
                data?.pipelineInvocation as PipelineEngine__PipelineInvocationType
              }
              cell={cell}
            />
          </div>
        }
      />
    </PageHeader>
  );
}
