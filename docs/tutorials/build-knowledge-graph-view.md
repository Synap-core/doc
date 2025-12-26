---
sidebar_position: 2
---

# Build a Knowledge Graph View

**Create an Obsidian-style interactive graph visualization**

Visualize your knowledge as an interactive network where notes, people, projects, and concepts are nodes connected by relationships.

**Time**: 45 minutes  
**Result**: Interactive D3.js graph visualization  
**Stack**: React + D3.js + Synap SDK

---

## What You'll Build

```
Interactive Knowledge Graph:

    [Marie] ──assigned_to──> [Task: Design]
       │                          │
   mentions                   belongs_to
       │                          │
       v                          v
 [Note: Meeting] ────related────> [Project X]
       │                          │
   mentions                    has_task
       │                          │
       v                          v
 [Budget Q1] <───────related───── [Task: Review]
```

**Features**:
- 🎨 Interactive nodes (click to open)
- 🔍 Zoom and pan
- 🎯 Filter by type (notes, people, projects)
- 🌈 Color-coded by entity type
- 📊 Physics simulation (force-directed layout)
- 🔗 Hover to highlight connections

---

## Prerequisites

```bash
# Start Synap backend
cd synap-demo
docker compose up -d
pnpm dev

# Create React app
npx create-next-app@latest graph-view --typescript --tailwind
cd graph-view
pnpm add @synap/client d3 @types/d3
```

---

## Step 1: Fetch Graph Data (10 min)

### Create Graph Hook:

```typescript
// hooks/useKnowledgeGraph.ts
import { useEffect, useState } from 'react';
import { SynapClient } from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000'
});

export interface GraphNode {
  id: string;
  label: string;
  type: 'note' | 'person' | 'project' | 'task';
  size: number;  // Based on connections
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;  // mentions, assigned_to, etc.
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function useKnowledgeGraph(filters?: {
  types?: string[];
  projectId?: string;
  depth?: number;
}) {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchGraph() {
      try {
        // Get graph data from Synap
        const graphData = await synap.graph.getVisualization({
          filters: {
            types: filters?.types || ['note', 'person', 'project', 'task'],
            projectId: filters?.projectId,
            depth: filters?.depth || 2
          }
        });
        
        // Transform to D3 format
        const nodes: GraphNode[] = graphData.entities.map(entity => ({
          id: entity.id,
          label: entity.title || entity.name,
          type: entity.type as any,
          size: entity.connectionCount || 5,
          color: getColorForType(entity.type)
        }));
        
        const edges: GraphEdge[] = graphData.relations.map(relation => ({
          source: relation.sourceId,
          target: relation.targetId,
          type: relation.type,
          weight: relation.weight || 1
        }));
        
        setData({ nodes, edges });
      } catch (error) {
        console.error('Failed to fetch graph:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGraph();
  }, [filters?.types, filters?.projectId, filters?.depth]);
  
  return { data, loading };
}

function getColorForType(type: string): string {
  const colors: Record<string, string> = {
    note: '#3B82F6',      // Blue
    person: '#10B981',    // Green
    project: '#8B5CF6',   // Purple
    task: '#F59E0B',      // Orange
    meeting: '#EC4899',   // Pink
    document: '#6366F1'   // Indigo
  };
  return colors[type] || '#6B7280';  // Gray default
}
```

✅ **Checkpoint**: Hook fetches and transforms data

---

## Step 2: Create Graph Component (15 min)

### D3 Force Graph:

```typescript
// components/KnowledgeGraph.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphEdge } from '@/hooks/useKnowledgeGraph';

interface Props {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  width?: number;
  height?: number;
}

export function KnowledgeGraph({ 
  data, 
  onNodeClick,
  width = 1200,
  height = 800 
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add zoom behavior
    const g = svg.append('g');
    
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        }) as any
    );
    
    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.edges)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Draw edges
    const link = g.append('g')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.weight));
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', (d) => 5 + d.size)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d as GraphNode);
      })
      .call(drag(simulation) as any);
    
    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4)
      .style('pointer-events', 'none');
    
    // Hover effects
    node
      .on('mouseenter', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => 8 + d.size)
          .attr('stroke-width', 3);
        
        // Highlight connected nodes
        const connectedIds = new Set([
          ...data.edges.filter(e => e.source === d.id).map(e => e.target),
          ...data.edges.filter(e => e.target === d.id).map(e => e.source)
        ]);
        
        node.style('opacity', (n: any) => 
          n.id === d.id || connectedIds.has(n.id) ? 1 : 0.2
        );
        
        link.style('opacity', (l: any) =>
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => 5 + d.size)
          .attr('stroke-width', 2);
        
        node.style('opacity', 1);
        link.style('opacity', 0.6);
      });
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      
      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
    
    // Drag behavior
    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);
  
  return (
    <svg
      ref={svgRef}
      className="border border-gray-700 rounded-lg bg-gray-900"
    />
  );
}
```

✅ **Checkpoint**: Graph renders with physics simulation

---

## Step 3: Add Filters \u0026 Controls (10 min)

```typescript
// components/GraphControls.tsx
import { useState } from 'react';

interface Props {
  onFilterChange: (filters: {
    types: string[];
    projectId?: string;
  }) => void;
}

export function GraphControls({ onFilterChange }: Props) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'note', 'person', 'project', 'task'
  ]);
  
  const entityTypes = [
    { value: 'note', label: 'Notes', color: '#3B82F6' },
    { value: 'person', label: 'People', color: '#10B981' },
    { value: 'project', label: 'Projects', color: '#8B5CF6' },
    { value: 'task', label: 'Tasks', color: '#F59E0B' },
  ];
  
  function toggleType(type: string) {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newTypes);
    onFilterChange({ types: newTypes });
  }
  
  return (
    <div className="flex gap-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex gap-2">
        <span className="text-gray-300">Show:</span>
        {entityTypes.map(type => (
          <button
            key={type.value}
            onClick={() => toggleType(type.value)}
            className={`
              px-3 py-1 rounded-md flex items-center gap-2
              ${selectedTypes.includes(type.value)
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-500'
              }
            `}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: type.color }}
            />
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 4: Add Node Details Panel (10 min)

```typescript
// components/NodeDetails.tsx
import { GraphNode } from '@/hooks/useKnowledgeGraph';
import { useEffect, useState } from 'react';
import { SynapClient } from '@synap/client';

const synap = new SynapClient({ url: 'http://localhost:3000' });

interface Props {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetails({ node, onClose }: Props) {
  const [details, setDetails] = useState<any>(null);
  
  useEffect(() => {
    if (!node) return;
    
    async function fetchDetails() {
      // Fetch full entity details
      const entity = await synap.entities.get(node.id);
      
      // Get related entities
      const related = await synap.graph.findRelated({
        entityId: node.id,
        depth: 1
      });
      
      setDetails({ entity, related });
    }
    
    fetchDetails();
  }, [node?.id]);
  
  if (!node) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ✕
      </button>
      
      <div className="space-y-4">
        {/* Entity Type Badge */}
        <div
          className="inline-block px-3 py-1 rounded-full text-sm"
          style={{ backgroundColor: node.color + '20', color: node.color }}
        >
          {node.type}
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white">
          {node.label}
        </h2>
        
        {/* Content Preview */}
        {details?.entity?.content && (
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 line-clamp-5">
              {details.entity.content}
            </div>
          </div>
        )}
        
        {/* Connections */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Connections ({details?.related?.length || 0})
          </h3>
          <div className="space-y-2">
            {details?.related?.map((rel: any) => (
              <div
                key={rel.id}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                <div className="text-sm text-gray-400">{rel.relationType}</div>
                <div className="text-white">{rel.title}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Open Full View
          </button>
          <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            Add Connection
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Assemble the Page (5 min)

```typescript
// app/graph/page.tsx
'use client';

import { useState } from 'react';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { GraphControls } from '@/components/GraphControls';
import { NodeDetails } from '@/components/NodeDetails';
import { useKnowledgeGraph, GraphNode } from '@/hooks/useKnowledgeGraph';

export default function GraphPage() {
  const [filters, setFilters] = useState({
    types: ['note', 'person', 'project', 'task']
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  const { data, loading } = useKnowledgeGraph(filters);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-400">Loading graph...</div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-400">Failed to load graph</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Knowledge Graph
          </h1>
          <p className="text-gray-400">
            {data.nodes.length} entities, {data.edges.length} connections
          </p>
        </div>
        
        {/* Controls */}
        <GraphControls onFilterChange={setFilters} />
        
        {/* Graph */}
        <div className="relative">
          <KnowledgeGraph
            data={data}
            onNodeClick={setSelectedNode}
            width={1400}
            height={800}
          />
        </div>
        
        {/* Details Panel */}
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
```

✅ **Checkpoint**: Full interactive graph with details panel

---

## Enhancements

### 1. Search Nodes

```typescript
function GraphSearch({ nodes, onSelect }: {
  nodes: GraphNode[];
  onSelect: (node: GraphNode) => void;
}) {
  const [query, setQuery] = useState('');
  
  const filtered = nodes.filter(n =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search nodes..."
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
      />
      {query && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map(node => (
            <button
              key={node.id}
              onClick={() => {
                onSelect(node);
                setQuery('');
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              {node.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 2. Layout Options

```typescript
function LayoutSelector({ onChange }: {
  onChange: (layout: string) => void;
}) {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 bg-gray-700 rounded-lg"
    >
      <option value="force">Force-Directed</option>
      <option value="radial">Radial</option>
      <option value="tree">Tree</option>
      <option value="circle">Circle</option>
    </select>
  );
}

// Update simulation based on layout
function applyLayout(layout: string, simulation: d3.Simulation<any, any>) {
  switch (layout) {
    case 'radial':
      simulation
        .force('r', d3.forceRadial(200, width / 2, height / 2));
      break;
    case 'tree':
      // Use d3.tree() for hierarchical layout
      break;
    // etc.
  }
  simulation.alpha(1).restart();
}
```

---

### 3. Export Capability

```typescript
function exportGraph(data: GraphData) {
  // Export as SVG
  const svg = document.querySelector('svg');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg!);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'knowledge-graph.svg';
  a.click();
}

// Or export data as JSON
function exportData(data: GraphData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'graph-data.json';
  a.click();
}
```

---

## Alternative: Use React Flow

For easier implementation, use React Flow library:

```bash
pnpm add reactflow
```

```typescript
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

function SimpleGraph({ data }: { data: GraphData }) {
  const nodes: Node[] = data.nodes.map(n => ({
    id: n.id,
    data: { label: n.label },
    style: {
      background: n.color,
      color: 'white',
      borderRadius: '50%',
      width: 60,
      height: 60
    }
  }));
  
  const edges: Edge[] = data.edges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    label: e.type
  }));
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
    />
  );
}
```

---

## 🎉 What You Built

✅ **Interactive Knowledge Graph** with:
- Force-directed physics layout
- Color-coded entity types
- Click to view details
- Hover to highlight connections
- Zoom and pan
- Filter by type
- Search nodes

**Like Obsidian's graph, but:**
- Auto-populated from Synap
- Typed relationships (not just generic links)
- Real-time updates
- Queryable (API access)

---

## Next Steps

- **[Build Activity Timeline](./activity-timeline)** - Event-based history view
- **[Build Branch Visualizer](./branch-visualizer)** - Git-style conversation trees
- **[Knowledge Graph Concept](../concepts/knowledge-graph)** - Deep dive into model
- **[Graph API Reference](../reference/graph-api)** - All graph queries

---

**Your knowledge, visualized! 🌐✨**
