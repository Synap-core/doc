import type { Edge, Node } from '@xyflow/react';

/** Public docs: high-level pairing and event path (readable labels). */
export const podReplicationPublicNodes: Node[] = [
  {
    id: 'cp',
    type: 'default',
    position: { x: 180, y: 0 },
    data: { label: 'Synap Cloud (Control Plane)' },
  },
  {
    id: 'primary',
    type: 'default',
    position: { x: 0, y: 140 },
    data: { label: 'Primary Data Pod' },
  },
  {
    id: 'replica',
    type: 'default',
    position: { x: 360, y: 140 },
    data: { label: 'Replica Data Pod' },
  },
];

export const podReplicationPublicEdges: Edge[] = [
  {
    id: 'cp-primary',
    source: 'cp',
    target: 'primary',
    label: 'link & credentials',
    animated: true,
  },
  {
    id: 'cp-replica',
    source: 'cp',
    target: 'replica',
    label: 'link & credentials',
    animated: true,
  },
  {
    id: 'sync',
    source: 'primary',
    target: 'replica',
    label: 'event log replication (HTTPS)',
    animated: true,
  },
];

/** Team docs: runtime layers (workers + hook). */
export const podReplicationTeamNodes: Node[] = [
  {
    id: 'writer',
    type: 'default',
    position: { x: 0, y: 80 },
    data: { label: 'Local writes → *.completed events' },
  },
  {
    id: 'rt',
    type: 'default',
    position: { x: 0, y: 220 },
    data: { label: 'Realtime hook (batched POST)' },
  },
  {
    id: 'boss',
    type: 'default',
    position: { x: 280, y: 80 },
    data: { label: 'pg-boss: sync-push / pull (1 min)' },
  },
  {
    id: 'sup',
    type: 'default',
    position: { x: 280, y: 220 },
    data: { label: 'Files + supplementary (5–10 min)' },
  },
  {
    id: 'peer',
    type: 'default',
    position: { x: 560, y: 120 },
    data: { label: 'Peer pod /api/sync/receive' },
  },
];

export const podReplicationTeamEdges: Edge[] = [
  { id: 'w-rt', source: 'writer', target: 'rt', animated: true },
  { id: 'w-b', source: 'writer', target: 'boss', animated: false },
  { id: 'rt-p', source: 'rt', target: 'peer', animated: true },
  { id: 'b-p', source: 'boss', target: 'peer', animated: true },
  { id: 'sup-p', source: 'sup', target: 'peer', animated: false },
  { id: 'w-s', source: 'writer', target: 'sup', animated: false },
];
