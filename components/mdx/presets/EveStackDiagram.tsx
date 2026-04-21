import { SynapFlowDiagram } from '@/components/mdx/SynapFlowDiagram';
import { eveStackEdges, eveStackNodes } from '@/components/mdx/presets/eve-stack-flow';

/** Eve + Synap topology for team docs — zoom/pan, read-only. */
export function EveStackDiagram() {
  return (
    <SynapFlowDiagram
      nodes={eveStackNodes}
      edges={eveStackEdges}
      height={520}
      minimap
      controls
      fitViewPadding={0.15}
    />
  );
}
