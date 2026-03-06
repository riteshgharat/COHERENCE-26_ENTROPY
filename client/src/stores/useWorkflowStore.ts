import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

export type WorkflowNodeType =
  | 'start'
  | 'lead_upload'
  | 'ai_message'
  | 'send_email'
  | 'send_linkedin'
  | 'send_whatsapp'
  | 'delay'
  | 'reply_check'
  | 'follow_up'
  | 'ai_conversation'
  | 'update_crm'
  | 'analytics'
  | 'end';

export interface WorkflowNodeData {
  label: string;
  description?: string;
  nodeType: WorkflowNodeType;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

interface WorkflowState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  removeNode: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),
}));
