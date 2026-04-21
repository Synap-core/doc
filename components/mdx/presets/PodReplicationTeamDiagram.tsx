import { SynapFlowDiagram } from '@/components/mdx/SynapFlowDiagram';
import {
  podReplicationTeamEdges,
  podReplicationTeamNodes,
} from '@/components/mdx/presets/pod-replication-flow';

/** Pre-wired diagram for team docs — workers + realtime + peer receive. */
export function PodReplicationTeamDiagram() {
  return (
    <SynapFlowDiagram
      nodes={podReplicationTeamNodes}
      edges={podReplicationTeamEdges}
      height={420}
      minimap
      controls
      fitViewPadding={0.12}
    />
  );
}
