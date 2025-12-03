// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { lowerCase } from "lodash";
import React, { useState } from "react";
import DetailsTable from "~/app/components/DetailsTable";
import ListView from "~/app/components/ListView";
import {
  Layout,
  PageHeader,
  SectionNavigator,
  Tag,
} from "~/common/ui-components";
import NotFound from "~/errors/components/NotFound";
import {
  useStepInvocationDetailsTableQuery,
  StepInvocationsHomeDocument,
  useStepInvocationQuery,
  PipelineEngine__StepInvocationType,
} from "~/generated/dashboard/graphqlSchema";
import { STEP_INVOCATION } from "~/generated/dashboard/types/resources";

function LinkedStepInvocations({
  cell,
  stepInvocation,
}: {
  cell: string;
  stepInvocation: PipelineEngine__StepInvocationType | undefined | null;
}) {
  const SECTIONS = {
    children: "Children",
    parents: "Parents",
  };

  const [currentSection, setCurrentSection] = useState(
    lowerCase(SECTIONS.children),
  );

  if (!stepInvocation) {
    return null;
  }

  const childrenIds =
    stepInvocation?.children?.map((si) => si.id) &&
    stepInvocation?.children?.map((si) => si.id)?.length !== 0
      ? stepInvocation?.children?.map((si) => si.id)
      : ["NONE"];
  const parentIds =
    stepInvocation?.parents?.map((si) => si.id) &&
    stepInvocation?.parents?.map((si) => si.id)?.length !== 0
      ? stepInvocation?.parents?.map((si) => si.id)
      : ["NONE"];

  return (
    <>
      <SectionNavigator
        sections={SECTIONS}
        currentSection={currentSection}
        onClick={(section: string) => setCurrentSection(section)}
      />
      <ListView
        resource={STEP_INVOCATION}
        graphqlDocument={StepInvocationsHomeDocument}
        constantQueryVariables={{
          id:
            currentSection === lowerCase(SECTIONS.parents)
              ? parentIds
              : childrenIds,
          cell,
        }}
        customizableColumns={false}
        disableQueryURLParams
        scrollX
      />
    </>
  );
}

interface StepInvocationViewProps {
  match: { params: { id: string; cell: string } };
}

export default function StepInvocationView({
  match: {
    params: { id, cell },
  },
}: StepInvocationViewProps) {
  const { data, loading } = useStepInvocationQuery({
    variables: {
      id,
      cell,
    },
  });

  if (!data?.stepInvocation && !loading) {
    return (
      <NotFound
        message="Cannot to find Step Invocation"
        subtext={`Id: ${id}, Cell: ${cell}`}
        hideCta
      />
    );
  }

  return (
    <PageHeader
      title={data?.stepInvocation?.stepName || "Step"}
      left={
        <Tag color={data?.stepInvocation?.statusTagColor}>
          {data?.stepInvocation?.prettyStatus}
        </Tag>
      }
      loading={loading}
      crumbs={
        data?.stepInvocation?.pipelineInvocation && [
          {
            name: "All Step Invocations",
            path: `/admin/pipeline_engine/step_invocations`,
          },
          {
            name: `Pipeline Invocation: ${data?.stepInvocation?.pipelineInvocation.id}`,
            path: `/admin/pipeline_engine/pipeline_invocations/${data?.stepInvocation?.pipelineInvocation.id}/${cell}`,
          },
        ]
      }
    >
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={useStepInvocationDetailsTableQuery}
            id={id}
            constantQueryVariables={{ cell }}
            resource={STEP_INVOCATION}
          />
        }
        secondaryContent={
          <div className="flex flex-col gap-2">
            <LinkedStepInvocations
              cell={cell}
              stepInvocation={
                data?.stepInvocation as PipelineEngine__StepInvocationType
              }
            />
          </div>
        }
      />
    </PageHeader>
  );
}
