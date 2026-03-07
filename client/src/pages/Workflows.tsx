import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Square,
  Upload,
  Sparkles,
  Mail,
  Clock,
  GitBranch,
  RefreshCw,
  Database,
  BarChart3,
  Linkedin,
  MessageCircle,
  GripVertical,
  Save,
  Bot,
  X,
  ArrowLeft,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Settings2,
  Layers,
  Cpu,
  Send,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BaseNode from '@/components/workflow/BaseNode';
import DeletableEdge from '@/components/workflow/DeletableEdge';
import NodePropertyPanel from '@/components/workflow/NodePropertyPanel';
import AgenticWorkflowModal from '@/components/workflow/AgenticWorkflowModal';
import { getDefaultData } from '@/components/workflow/nodeDefinitions';

const nodeTypes = {
  start: BaseNode,
  end: BaseNode,
  lead_upload: BaseNode,
  ai_message: BaseNode,
  send_message: BaseNode,
  reply_check: BaseNode,
  follow_up: BaseNode,
  update_crm: BaseNode,
  analytics: BaseNode,
  ai_conversation: BaseNode,
  sheets_import: BaseNode,
};

const edgeTypes = {
  default: DeletableEdge,
};

/* ── Grouped toolbox ── */
type ToolItem = {
  type: string;
  label: string;
  icon: any;
  description: string;
  color: string;
  data?: Record<string, any>;
};

type ToolGroup = {
  label: string;
  icon: any;
  items: ToolItem[];
};

const toolGroups: ToolGroup[] = [
  {
    label: 'Flow Control',
    icon: Layers,
    items: [
      { type: 'start', label: 'Start', icon: Play, description: 'Workflow entry point', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
      { type: 'end', label: 'End', icon: Square, description: 'Workflow exit', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
      { type: 'delay', label: 'Delay', icon: Clock, description: 'Wait for a duration', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
      { type: 'reply_check', label: 'Reply Check', icon: GitBranch, description: 'Branch on reply status', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
    ],
  },
  {
    label: 'Messaging',
    icon: Send,
    items: [
      { type: 'send_message', label: 'Send Email', icon: Mail, data: { channel: 'email' }, description: 'Email outreach', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400' },
      { type: 'send_message', label: 'LinkedIn DM', icon: Linkedin, data: { channel: 'linkedin' }, description: 'LinkedIn direct message', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
      { type: 'send_message', label: 'WhatsApp', icon: MessageCircle, data: { channel: 'whatsapp' }, description: 'WhatsApp message', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
      { type: 'follow_up', label: 'Follow Up', icon: RefreshCw, description: 'Automated follow-up', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
    ],
  },
  {
    label: 'AI & Automation',
    icon: Cpu,
    items: [
      { type: 'ai_message', label: 'AI Message', icon: Sparkles, description: 'AI-generated content', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400' },
      { type: 'ai_conversation', label: 'AI Agent', icon: Bot, description: 'Auto-converse with AI', color: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-400' },
    ],
  },
  {
    label: 'Data & Analytics',
    icon: BarChart3,
    items: [
      { type: 'lead_upload', label: 'Lead Upload', icon: Upload, description: 'Import CSV / Excel', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
      { type: 'sheets_import', label: 'Google Sheets', icon: Database, description: 'Import from Sheets URL', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
      { type: 'update_crm', label: 'Update CRM', icon: Database, description: 'Sync back to sheets', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
      { type: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Track metrics', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' },
    ],
  },
];

const edgeColor = 'oklch(0.4 0 0)';

const defaultNodes: Node[] = [
  { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
  { id: '2', type: 'sheets_import', position: { x: 370, y: 160 }, data: { label: 'Import from Sheets', spreadsheet_id: '', worksheet_name: 'Sheet1' } },
  { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Personalize Intro', tone: 'warm and personal', sample_message: 'Generate a warm intro email', subject: 'Hi {name}, quick intro', provider: 'groq' } },
  { id: '4', type: 'send_message', position: { x: 370, y: 470 }, data: { label: 'Send Intro Email', channel: 'email', subject: '' } },
  { id: '5', type: 'delay', position: { x: 390, y: 620 }, data: { label: 'Wait 2 Hours', delay_seconds: 7200 } },
  { id: '6', type: 'reply_check', position: { x: 370, y: 770 }, data: { label: 'Got Reply?', timeout_seconds: 30 } },
  { id: '7', type: 'follow_up', position: { x: 140, y: 940 }, data: { label: 'Follow Up', tone: 'polite and brief', max_attempts: 2, provider: 'groq' } },
  { id: '8', type: 'update_crm', position: { x: 560, y: 940 }, data: { label: 'Mark Engaged', spreadsheet_id: '', worksheet_name: 'Sheet1' } },
  { id: '9', type: 'end', position: { x: 400, y: 1100 }, data: {} },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e6-7', source: '6', sourceHandle: 'no', target: '7', style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor }, label: 'No Reply' },
  { id: 'e6-8', source: '6', sourceHandle: 'yes', target: '8', style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor }, label: 'Replied' },
  { id: 'e7-9', source: '7', target: '9', style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
  { id: 'e8-9', source: '8', target: '9', style: { stroke: edgeColor, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor } },
];

let nodeIdCounter = 10;

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const isNew = !id || id === 'new';

  const [nodes, setNodes, onNodesChange] = useNodesState(isNew ? [] : defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(isNew ? [] : defaultEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const [workflowName, setWorkflowName] = useState(isNew ? 'Untitled workflow' : 'Cold Outreach — Series A Founders');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'config'>('nodes');
  const [running, setRunning] = useState(false);
  const [showAgenticModal, setShowAgenticModal] = useState(false);

  useEffect(() => {
    if (!isNew && id && id !== 'new') {
      fetch(`http://localhost:8000/api/v1/workflows/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch workflow');
          return res.json();
        })
        .then((data) => {
          setWorkflowName(data.name || 'Untitled workflow');
          if (data.flow_data) {
            setNodes(data.flow_data.nodes || []);
            setEdges(data.flow_data.edges || []);
          }
        })
        .catch(console.error);
    }
  }, [id, isNew, setNodes, setEdges]);

  const toggleGroup = (label: string) =>
    setCollapsedGroups((p) => ({ ...p, [label]: !p[label] }));

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: edgeColor, strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setActiveTab('config');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveTab('nodes');
  }, []);

  const onDragStart = (e: React.DragEvent, item: ToolItem) => {
    e.dataTransfer.setData('application/reactflow-type', item.type);
    e.dataTransfer.setData('application/reactflow-data', JSON.stringify({ ...(item.data || {}), label: item.label }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow-type');
      if (!type) return;
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;
      const extraData = JSON.parse(e.dataTransfer.getData('application/reactflow-data') || '{}');
      const position = {
        x: e.clientX - bounds.left - 90,
        y: e.clientY - bounds.top - 30,
      };
      const defaults = getDefaultData(type);
      const newNode: Node = {
        id: String(nodeIdCounter++),
        type,
        position,
        data: { ...defaults, ...extraData },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const deleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
    setActiveTab('nodes');
  }, [selectedNodeId, setNodes, setEdges]);

  const handleSave = async () => {
    try {
      const payload = {
        name: workflowName,
        flow_data: { nodes, edges },
      };

      const endpoint = isNew
        ? 'http://localhost:8000/api/v1/workflows/'
        : `http://localhost:8000/api/v1/workflows/${id}`;

      const method = isNew ? 'POST' : 'PATCH';

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (isNew || id === 'new') {
        // Optional: redirect to list or the new ID. We'll just stay to not break flows.
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, [key]: value } } : n)),
    );
  };

  const handleAgenticGenerate = useCallback(
    (generatedNodes: Node[], generatedEdges: Edge[], name?: string) => {
      // Bump the node ID counter past any generated IDs
      const maxId = generatedNodes.reduce((mx, n) => Math.max(mx, parseInt(n.id, 10) || 0), 0);
      if (maxId >= nodeIdCounter) nodeIdCounter = maxId + 1;
      setNodes(generatedNodes);
      setEdges(generatedEdges);
      if (name) setWorkflowName(name);
      setShowAgenticModal(false);
    },
    [setNodes, setEdges],
  );

  const runWorkflow = useCallback(async () => {
    if (running) return;
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) return;

    setRunning(true);

    // Build adjacency list from edges
    const adj = new Map<string, string[]>();
    for (const e of edges) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push(e.target);
    }

    const markNode = (nodeId: string, flags: Record<string, boolean>) =>
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...flags } } : n,
        ),
      );

    // BFS traversal — sequentially execute nodes
    const visited = new Set<string>();
    let queue = [startNode.id];

    let currentLeads: any[] = [];
    let generatedMessage = "Hello from AI";

    while (queue.length > 0) {
      const [nodeId, ...rest] = queue;
      queue = rest;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const nodeData = nodes.find(n => n.id === nodeId)?.data || {};
      const nodeType = nodes.find(n => n.id === nodeId)?.type;

      markNode(nodeId, { _executing: true, _done: false });
      
      try {
        if (nodeType === 'lead_upload' || nodeType === 'sheets_import') {
          const storeInDb = nodeData.store_in_db !== 'no';
          
          if (storeInDb) {
            // Fetch leads from backend
            const res = await fetch('http://localhost:8000/api/v1/leads/?page_size=10');
            if (res.ok) {
              const data = await res.json();
              currentLeads = data.leads || [];
            }
          } else {
            console.log("Mocking lead ingestion in-memory (DB bypassed)");
            currentLeads = [
              { id: 'mem-1', name: 'Demo Lead 1', email: 'demo1@example.com', status: 'new' },
              { id: 'mem-2', name: 'Demo Lead 2', email: 'demo2@example.com', status: 'new' },
              { id: 'mem-3', name: 'Demo Lead 3', email: 'demo3@example.com', status: 'new' },
            ];
          }
          await new Promise<void>((r) => setTimeout(r, nodeType === 'sheets_import' ? 1500 : 700));
        }
        else if (nodeType === 'ai_message') {
          // Generate a preview message via backend AI endpoint
          if (currentLeads.length > 0) {
            const res = await fetch('http://localhost:8000/api/v1/ai/preview-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_data: currentLeads[0], 
                tone: nodeData.tone, 
                sample_message: nodeData.sample_message,
                provider: nodeData.provider
              })
            });
            if (res.ok) {
              const data = await res.json();
              generatedMessage = data.message;
            }
          }
          await new Promise<void>((r) => setTimeout(r, 800));
        }
        else if (nodeType === 'send_message') {
          // Send message to microservices based on channel
          const isWhatsApp = nodeData.channel === 'whatsapp';
          const isEmail = nodeData.channel === 'email';
          
          if (isWhatsApp || isEmail) {
            const port = isWhatsApp ? 3000 : 3002;
            const payload = {
              leads: currentLeads.length > 0 ? currentLeads : undefined,
              subject: nodeData.subject || generatedMessage.substring(0, 30),
              message: generatedMessage || nodeData.subject || 'Hello',
              backendUrl: 'http://127.0.0.1:8000'
            };
            
            await fetch(`http://localhost:${port}/broadcast`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).catch(e => console.error("Broadcast failed", e));
          } else {
            // Delay for linkedin
            await new Promise<void>((r) => setTimeout(r, 1000));
          }
        }
        else if (nodeType === 'update_crm') {
          // Simulate updating Google Sheets
          console.log(`Updating Google Sheet ${nodeData.spreadsheet_id || 'CRM'}...`);
          await new Promise<void>((r) => setTimeout(r, 1200));
        }
        else if (nodeType === 'reply_check') {
          // Simulate waiting for reply based on timeout in seconds
          const timeout = nodeData.timeout_seconds || 30;
          console.log(`Waiting for reply with timeout of ${timeout} seconds...`);
          await new Promise<void>((r) => setTimeout(r, 2000)); // Fast-forwarded
        }
        else if (nodeType === 'delay') {
          // Fast-forward delay for demo
          await new Promise<void>((r) => setTimeout(r, 600));
        }
        else {
          // generic delay for others
          await new Promise<void>((r) => setTimeout(r, 700));
        }
      } catch (err) {
        console.error(`Error executing node ${nodeId}:`, err);
      }

      markNode(nodeId, { _executing: false, _done: true });

      const targets = adj.get(nodeId) || [];
      
      // Node branching
      if (nodeType === 'reply_check') {
         // Randomly decide yes or no for the demo
         const handle = Math.random() > 0.5 ? 'yes' : 'no';
         const branchingEdges = edges.filter(e => e.source === nodeId && e.sourceHandle === handle);
         const targetNodes = branchingEdges.map(e => e.target);
         queue.push(...targetNodes.filter((t) => !visited.has(t)));
      } else {
         queue.push(...targets.filter((t) => !visited.has(t)));
      }
      
    }

    // Clear done state after a brief pause
    await new Promise<void>((r) => setTimeout(r, 1500));
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, _executing: false, _done: false } })),
    );
    setRunning(false);
  }, [running, nodes, edges, setNodes]);

  const rfStyle = useMemo(() => ({ backgroundColor: 'transparent' }), []);

  return (
    <div className="h-screen flex flex-col animate-fade-in">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg shrink-0"
          >
            <ArrowLeft size={14} />
          </Button>

          <div className="h-4 w-px bg-border shrink-0" />

          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-[13px] font-semibold bg-transparent border-none outline-none hover:underline focus:underline decoration-muted-foreground/30 underline-offset-4 min-w-0 max-w-[260px] truncate cursor-text"
            spellCheck={false}
          />

          <span className="text-[9px] font-bold tracking-widest text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md uppercase shrink-0">
            Editing
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:block pr-2">
            {nodes.length} nodes · {edges.length} connections
          </span>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs rounded-lg font-medium border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950"
            onClick={() => setShowAgenticModal(true)}
            disabled={running}
          >
            <Wand2 size={11} />
            AI Generate
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs rounded-lg font-medium"
            onClick={handleSave}
          >
            {saved
              ? <><CheckCircle size={11} className="text-emerald-500" /> Saved</>
              : <><Save size={11} /> Save</>
            }
          </Button>

          <Button size="sm" className="gap-1.5 h-7 text-xs rounded-lg font-medium" onClick={runWorkflow} disabled={running}>
            {running
              ? <><Loader2 size={11} className="animate-spin" /> Running...</>
              : <><Play size={11} /> Run</>
            }
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left panel: Node Library / Config ── */}
        <div className="w-[220px] shrink-0 border-r border-border bg-card flex flex-col">

          {/* Panel tabs */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${activeTab === 'nodes'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${activeTab === 'config'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {selectedNode ? 'Config' : 'Properties'}
            </button>
          </div>

          {/* ── Library tab ── */}
          {activeTab === 'nodes' && (
            <div className="flex-1 overflow-y-auto py-2">
              {toolGroups.map((group) => {
                const isCollapsed = collapsedGroups[group.label];
                return (
                  <div key={group.label} className="mb-0.5">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                    >
                      <group.icon size={9} />
                      {group.label}
                      <span className="ml-auto">
                        {isCollapsed
                          ? <ChevronRight size={10} />
                          : <ChevronDown size={10} />
                        }
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="px-2 space-y-px pb-1">
                        {group.items.map((item, i) => (
                          <div
                            key={`${item.type}-${i}`}
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing transition-colors group select-none"
                          >
                            <div className={`h-6 w-6 flex items-center justify-center rounded-md shrink-0 ${item.color}`}>
                              <item.icon size={12} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-semibold block leading-tight truncate">{item.label}</span>
                              <span className="text-[9px] text-muted-foreground block truncate">{item.description}</span>
                            </div>
                            <GripVertical size={10} className="text-muted-foreground/0 group-hover:text-muted-foreground/50 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Config tab ── */}
          {activeTab === 'config' && (
            <NodePropertyPanel
              node={selectedNode}
              onUpdateData={updateNodeData}
              onDelete={deleteNode}
              onClose={() => { setSelectedNodeId(null); setActiveTab('nodes'); }}
            />
          )}
        </div>

        {/* ── Canvas ── */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={['Delete', 'Backspace']}
            style={rfStyle}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            defaultEdgeOptions={{ animated: true }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
            <Controls
              showInteractive={false}
              className="!bg-card !border-border !shadow-sm !rounded-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
            />
            <MiniMap
              className="!bg-card !border-border !shadow-sm !rounded-lg"
              nodeColor="oklch(0.4 0 0)"
              maskColor="oklch(0.15 0 0 / 0.3)"
            />
          </ReactFlow>

          {/* ── Empty state (only for /workflows/new) ── */}
          {isNew && nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center select-none">
                <div className="relative mx-auto mb-6 w-20 h-20">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-border opacity-60" />
                  {/* Inner icon */}
                  <div className="absolute inset-3 rounded-2xl bg-muted flex items-center justify-center">
                    <GitBranch size={24} className="text-muted-foreground/40" strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-[15px] font-bold text-foreground mb-1">
                  Start building your workflow
                </h3>
                <p className="text-[12px] text-muted-foreground max-w-[220px] leading-relaxed">
                  Drag nodes from the library panel on the left onto this canvas
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground border border-dashed border-border rounded-lg px-3 py-1.5">
                    <GripVertical size={11} />
                    Drag to place
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground border border-dashed border-border rounded-lg px-3 py-1.5">
                    <GitBranch size={11} />
                    Connect nodes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAgenticModal && (
        <AgenticWorkflowModal
          onGenerate={handleAgenticGenerate}
          onClose={() => setShowAgenticModal(false)}
        />
      )}
    </div>
  );
}
