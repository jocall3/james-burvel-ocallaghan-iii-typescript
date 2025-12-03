// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Handle, NodeToolbar, Position } from "reactflow";
import { Clickable, Drawer, Tag } from "~/common/ui-components";
import {
  PipelineEngineFlowChart__StepInvocationNodeDataType,
  PipelineEngine__StepInvocationStatusEnumType,
} from "~/generated/dashboard/graphqlSchema";
import StepInvocationView from "./StepInvocationView";

interface StepInvocationNodeProps {
  data: PipelineEngineFlowChart__StepInvocationNodeDataType;
}

export default function StepInvocationNode({ data }: StepInvocationNodeProps) {
  const isProcessing = [
    PipelineEngine__StepInvocationStatusEnumType.Processing,
    PipelineEngine__StepInvocationStatusEnumType.Waiting,
  ].includes(
    data.stepInvocation.status as PipelineEngine__StepInvocationStatusEnumType,
  );

  return (
    <div
      className={`border-stone-400 rounded-md border bg-white px-2 py-2 shadow-md ${
        isProcessing ? "animate-pulse" : ""
      }`}
    >
      {data?.stepInvocation?.prettyDuration && (
        <NodeToolbar>
          <span className="rounded-sm bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700">
            {data?.stepInvocation?.prettyDuration}
          </span>
        </NodeToolbar>
      )}
      <div className="border-stone-400 gap-6 border-b pb-2 text-xs">
        <div className="flex flex-row items-end justify-between">
          <div>{data.label}</div>
          <Tag color={data?.stepInvocation.statusTagColor}>
            {data?.stepInvocation.prettyStatus}
          </Tag>
        </div>
      </div>
      <div className="pt-2">
        <Drawer
          trigger={
            <Clickable onClick={() => {}}>
              <div className="font-mono text-xs text-blue-500 hover:text-blue-600">
                {data.stepInvocation.id}
              </div>
            </Clickable>
          }
          path={`/admin/pipeline_engine/step_invocations/${data.stepInvocation.id}/${data.cell}`}
        >
          <StepInvocationView
            match={{
              params: {
                id: data.stepInvocation.id,
                cell: data.cell,
              },
            }}
          />
        </Drawer>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="h-px w-8 rounded-none border-none !bg-gray-300"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-px w-8 rounded-none border-none !bg-gray-300"
      />
    </div>
  );
}
