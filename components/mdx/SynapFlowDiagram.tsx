'use client';

import { useEffect, type CSSProperties } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type FitViewOptions,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';

export type SynapFlowDiagramProps = {
  /** Initial React Flow nodes (`type: 'default'` uses `data.label`) */
  nodes: Node[];
  edges: Edge[];
  /** Fixed viewport height (diagram is responsive in width) */
  height?: number;
  className?: string;
  /** Show zoom/pan controls */
  controls?: boolean;
  /** Show overview minimap */
  minimap?: boolean;
  /** Dot or lines background */
  background?: 'dots' | 'lines' | 'none';
  fitViewPadding?: FitViewOptions['padding'];
};

function FitViewOnMount({ padding }: { padding?: FitViewOptions['padding'] }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    fitView({ padding: padding ?? 0.15, duration: 200 });
  }, [fitView, padding]);
  return null;
}

function FlowInner({
  initialNodes,
  initialEdges,
  height,
  className,
  controls = true,
  minimap = true,
  background = 'dots',
  fitViewPadding,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  height: number;
  className?: string;
  controls: boolean;
  minimap: boolean;
  background: SynapFlowDiagramProps['background'];
  fitViewPadding?: FitViewOptions['padding'];
}) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div
      className={cn(
        'not-prose w-full overflow-hidden rounded-xl border border-fd-border bg-fd-background/80',
        className
      )}
      style={{ height } satisfies CSSProperties}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
      >
        <FitViewOnMount padding={fitViewPadding} />
        {background === 'dots' ? (
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="rgba(120, 120, 120, 0.35)"
          />
        ) : background === 'lines' ? (
          <Background
            variant={BackgroundVariant.Lines}
            gap={16}
            color="rgba(120, 120, 120, 0.25)"
          />
        ) : null}
        {controls ? <Controls showInteractive={false} /> : null}
        {minimap ? (
          <MiniMap
            pannable
            zoomable
            maskColor="var(--fd-background)"
            className="!bg-fd-card"
          />
        ) : null}
      </ReactFlow>
    </div>
  );
}

/**
 * Interactive read-only flow diagram for MDX (React Flow).
 * Use with {@link SynapFlowDiagramProvider} already satisfied — wraps an inner provider.
 */
export function SynapFlowDiagram({
  nodes,
  edges,
  height = 400,
  className,
  controls = true,
  minimap = false,
  background = 'dots',
  fitViewPadding,
}: SynapFlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowInner
        initialNodes={nodes}
        initialEdges={edges}
        height={height}
        className={className}
        controls={controls}
        minimap={minimap}
        background={background}
        fitViewPadding={fitViewPadding}
      />
    </ReactFlowProvider>
  );
}
