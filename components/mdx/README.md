# MDX interactive blocks

## `SynapFlowDiagram`

Wrapper around **[@xyflow/react](https://reactflow.dev/)** for zoom/pan flow figures in docs.

- **Register** new presets in `lib/mdx-components.tsx` if they should be available as **short tags** in any `.mdx` file.
- **Props:** `nodes`, `edges` (React Flow types), optional `height`, `minimap`, `controls`, `background` (`dots` | `lines` | `none`).
- **Styling:** uses Fumadocs border/background tokens; diagram is **read-only** (no drag/connect).

## Presets

| Component | Use |
|-----------|-----|
| `PodReplicationPublicDiagram` | Public `/docs` — CP + primary + replica |
| `PodReplicationTeamDiagram` | Team `/team` — workers + realtime + receive |

Source data: `presets/pod-replication-flow.ts`.
