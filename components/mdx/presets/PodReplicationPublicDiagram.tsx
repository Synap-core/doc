import { SynapFlowDiagram } from '@/components/mdx/SynapFlowDiagram';
import {
  podReplicationPublicEdges,
  podReplicationPublicNodes,
} from '@/components/mdx/presets/pod-replication-flow';

/** Pre-wired diagram for public docs — pairing + replication path. */
export function PodReplicationPublicDiagram() {
  return (
    <SynapFlowDiagram
      nodes={podReplicationPublicNodes}
      edges={podReplicationPublicEdges}
      height={380}
      minimap={false}
      controls
      fitViewPadding={0.2}
    />
  );
}
