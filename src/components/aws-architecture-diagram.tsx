import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'utility-field',
    type: 'group',
    position: { x: 50, y: 50 },
    style: { width: 300, height: 150, backgroundColor: 'rgba(185, 243, 255, 0.3)' },
    data: { label: 'Utility Field Operations' },
  },
  {
    id: 'smart-meters',
    position: { x: 70, y: 90 },
    data: { label: 'Smart Meters' },
    parentId: 'utility-field',
    extent: 'parent',
    style: { backgroundColor: '#e0f7ff' },
  },
  {
    id: 'scada',
    position: { x: 200, y: 90 },
    data: { label: 'SCADA Systems' },
    parentId: 'utility-field',
    extent: 'parent',
    style: { backgroundColor: '#e0f7ff' },
  },
  {
    id: 'iot-core',
    position: { x: 450, y: 100 },
    data: { label: 'AWS IoT Core' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 'kinesis',
    position: { x: 650, y: 100 },
    data: { label: 'Amazon Kinesis\nData Streams' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 'ec2-gis',
    position: { x: 450, y: 250 },
    data: { label: 'Amazon EC2\nGIS Applications' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 'rds',
    position: { x: 650, y: 250 },
    data: { label: 'Amazon RDS\nPostgreSQL/PostGIS' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 'sagemaker',
    position: { x: 850, y: 100 },
    data: { label: 'Amazon SageMaker\nML Analytics' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 's3',
    position: { x: 850, y: 250 },
    data: { label: 'Amazon S3\nBackup & Archive' },
    style: { backgroundColor: '#ff9900', color: 'white' },
  },
  {
    id: 'security-hub',
    position: { x: 450, y: 400 },
    data: { label: 'AWS Security Hub\nCompliance' },
    style: { backgroundColor: '#232f3e', color: 'white' },
  },
  {
    id: 'shield',
    position: { x: 650, y: 400 },
    data: { label: 'AWS Shield\nDDoS Protection' },
    style: { backgroundColor: '#232f3e', color: 'white' },
  },
  {
    id: 'iam',
    position: { x: 850, y: 400 },
    data: { label: 'AWS IAM\nAccess Control' },
    style: { backgroundColor: '#232f3e', color: 'white' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'smart-meters',
    target: 'iot-core',
    animated: true,
    style: { stroke: '#0066cc' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2',
    source: 'scada',
    target: 'iot-core',
    animated: true,
    style: { stroke: '#0066cc' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3',
    source: 'iot-core',
    target: 'kinesis',
    animated: true,
    style: { stroke: '#ff9900' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e4',
    source: 'kinesis',
    target: 'sagemaker',
    animated: true,
    style: { stroke: '#ff9900' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e5',
    source: 'ec2-gis',
    target: 'rds',
    style: { stroke: '#ff9900' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e6',
    source: 'rds',
    target: 's3',
    style: { stroke: '#ff9900' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e7',
    source: 'iot-core',
    target: 'security-hub',
    style: { stroke: '#232f3e' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e8',
    source: 'security-hub',
    target: 'shield',
    style: { stroke: '#232f3e' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e9',
    source: 'shield',
    target: 'iam',
    style: { stroke: '#232f3e' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export function AwsArchitectureDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-[600px] border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="top-right"
        className="bg-gradient-to-br from-slate-50 to-blue-50"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}