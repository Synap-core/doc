import type { Edge, Node } from '@xyflow/react';

/** Read-only topology: Synap Data Pod + Eve sidecars + exposure (Legs). */
export const eveStackNodes: Node[] = [
  {
    id: 'internet',
    position: { x: 280, y: 0 },
    data: { label: 'Internet / users' },
    type: 'default',
  },
  {
    id: 'legs',
    position: { x: 260, y: 100 },
    data: { label: 'Legs — Traefik, tunnel (Pangolin / Cloudflare)' },
    type: 'default',
  },
  {
    id: 'synap',
    position: { x: 40, y: 260 },
    data: { label: 'Synap Data Pod — Caddy :80/443, API :4000, Hub' },
    type: 'default',
  },
  {
    id: 'eve-net',
    position: { x: 480, y: 260 },
    data: { label: 'Eve sidecars — Ollama, gateway :11435, eve-network' },
    type: 'default',
  },
  {
    id: 'organs',
    position: { x: 260, y: 400 },
    data: { label: 'Optional organs — Arms (OpenClaw), Eyes (RSSHub), Builder' },
    type: 'default',
  },
];

export const eveStackEdges: Edge[] = [
  { id: 'e1', source: 'internet', target: 'legs', animated: true },
  { id: 'e2', source: 'legs', target: 'synap' },
  { id: 'e3', source: 'legs', target: 'eve-net' },
  { id: 'e4', source: 'synap', target: 'organs' },
  { id: 'e5', source: 'eve-net', target: 'organs' },
];
