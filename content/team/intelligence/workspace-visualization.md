# AI Workspace Visualization

## Overview

A comprehensive React Flow visualization showing the entire AI workspace:

- All standalone chat threads (main conversations)
- Branch relationships (parent-child)
- Parallel threads (shown as grouped or connected)
- Thread status (active, merged, archived)
- Interactive actions (select, merge, create branch)

## Design Goals

1. **Beautiful & Modern**: Clean, professional design with smooth animations
2. **Informative**: Show thread metadata, message counts, status, timestamps
3. **Interactive**: Click to select, hover for details, drag to reorganize
4. **Scalable**: Handle workspaces with many threads efficiently
5. **Responsive**: Works on different screen sizes

## Visual Design

### Node Types

1. **Main Thread Node**:
   - Larger, prominent
   - Shows title, message count, last activity
   - Status indicator (active/archived)
   - Special styling for root threads

2. **Branch Node**:
   - Connected to parent with branch edge
   - Shows branch purpose, agent type
   - Merge button for active branches
   - Status badge (active/merged)

3. **Parallel Thread Group**:
   - Visual grouping of parallel threads
   - Optional: Show as connected nodes or grouped container

### Layout Algorithm

- **Hierarchical Layout**: Main threads at top, branches below
- **Horizontal Spacing**: 400px between levels
- **Vertical Spacing**: 200px between siblings
- **Auto-layout**: Use dagre or custom algorithm for optimal positioning

### Edge Types

1. **Branch Edge**:
   - Solid line from parent to branch
   - Animated for active branches
   - Dashed for merged branches
   - Color-coded by status

2. **Parallel Edge** (optional):
   - Dotted line connecting parallel threads
   - Lighter color to distinguish from branches

## Component Structure

```
WorkspaceVisualization
├── WorkspaceFlowNode (custom ReactFlow node)
│   ├── MainThreadNode
│   ├── BranchNode
│   └── ParallelGroupNode
├── utils/
│   ├── buildWorkspaceGraph.ts (transform threads to nodes/edges)
│   ├── layoutAlgorithm.ts (calculate positions)
│   └── threadRelationships.ts (identify branches, parallels)
└── hooks/
    └── useWorkspaceThreads.ts (fetch all threads for workspace)
```

## Data Flow

1. **Fetch all threads** for workspace from store
2. **Identify relationships**:
   - Main threads (no parentThreadId)
   - Branches (has parentThreadId)
   - Parallel threads (from chatUIStore.parallelThreads)
3. **Build graph structure**:
   - Create nodes for each thread
   - Create edges for branch relationships
   - Group parallel threads
4. **Calculate layout**:
   - Position main threads at top
   - Position branches below parents
   - Optimize spacing
5. **Render with ReactFlow**:
   - Custom nodes with beautiful styling
   - Animated edges
   - Interactive controls

## Interactions

- **Click node**: Select thread, open in chat view
- **Hover node**: Show tooltip with details
- **Drag node**: Reposition (optional, with auto-layout)
- **Click merge button**: Merge branch into parent
- **Right-click node**: Context menu (archive, delete, etc.)
- **Zoom/Pan**: Navigate large workspaces

## Future Enhancements

- Timeline view mode
- Filter by status (active/merged/archived)
- Search threads
- Collapse/expand branch groups
- Mini-map for navigation
- Export as image
