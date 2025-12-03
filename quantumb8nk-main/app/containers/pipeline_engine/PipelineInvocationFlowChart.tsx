// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from "react";
import dagre from "@dagrejs/dagre";
import ReactFlow, {
  ConnectionLineType,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";
import {
  PipelineEngineFlowChart__EdgeType,
  PipelineEngineFlowChart__NodeType,
  usePipelineInvocationFlowChartQuery,
} from "~/generated/dashboard/graphqlSchema";
import StepInvocationNode from "./StepInvocationNode";
import ChildPipelineInvocationsNode from "./ChildPipelineInvocationsNode";

const nodeTypes = {
  ChildPipelineInvocationsNode,
  StepInvocationNode,
};

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 250;
const NODE_HEIGHT = 75;

const getLayoutedElements = (
  nodes: PipelineEngineFlowChart__NodeType[],
  edges: PipelineEngineFlowChart__EdgeType[],
) => {
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const nodesWithPositions = nodes.map((node) => {
    // Create a shallow copy of the node
    const newNode = { ...node };
    const nodeWithPosition = dagreGraph.node(node.id);

    newNode.position = {
      x: nodeWithPosition.x,
      y: nodeWithPosition.y,
    };

    return newNode;
  });

  return { nodes: nodesWithPositions, edges };
};

interface PipelineInvocationFlowChartProps {
  id: string;
  cell: string;
}

export default function PipelineInvocationFlowChart({
  id,
  cell,
}: PipelineInvocationFlowChartProps) {
  const { loading, data, error } = usePipelineInvocationFlowChartQuery({
    variables: {
      id,
      cell,
    },
  });

  const [nodes, setNodes, onNodesChange] =
    useNodesState<PipelineEngineFlowChart__NodeType>([]);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<PipelineEngineFlowChart__EdgeType>([]);

  useEffect(() => {
    if (data) {
      const edgesWithoutLayout = data?.pipelineInvocationFlowChart
        ?.edges as PipelineEngineFlowChart__EdgeType[];
      const nodesWithoutLayout = (data?.pipelineInvocationFlowChart?.nodes ||
        []) as PipelineEngineFlowChart__NodeType[];

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodesWithoutLayout, edgesWithoutLayout);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    }
  }, [data, loading, error, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
