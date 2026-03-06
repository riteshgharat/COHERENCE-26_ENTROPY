import { useCallback, useRef, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StartNode from '@/components/workflow/nodes/StartNode';
import EndNode from '@/components/workflow/nodes/EndNode';
import LeadUploadNode from '@/components/workflow/nodes/LeadUploadNode';
import AIMessageNode from '@/components/workflow/nodes/AIMessageNode';
import SendMessageNode from '@/components/workflow/nodes/SendMessageNode';
import DelayNode from '@/components/workflow/nodes/DelayNode';
import ReplyCheckNode from '@/components/workflow/nodes/ReplyCheckNode';
import FollowUpNode from '@/components/workflow/nodes/FollowUpNode';
import UpdateCRMNode from '@/components/workflow/nodes/UpdateCRMNode';
import AnalyticsNode from '@/components/workflow/nodes/AnalyticsNode';
import AIConversationNode from '@/components/workflow/nodes/AIConversationNode';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  lead_upload: LeadUploadNode,
  ai_message: AIMessageNode,
  send_message: SendMessageNode,
  delay: DelayNode,
  reply_check: ReplyCheckNode,
  follow_up: FollowUpNode,
  update_crm: UpdateCRMNode,
  analytics: AnalyticsNode,
  ai_conversation: AIConversationNode,
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
      { type: 'update_crm', label: 'Update CRM', icon: Database, description: 'Sync to CRM', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
      { type: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Track metrics', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' },
    ],
  },
];

const allItems = toolGroups.flatMap(g => g.items);

const edgeColor = 'oklch(0.4 0 0)';

const defaultNodes: Node[] = [
  { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
  { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Import Leads' } },
  { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Personalize Intro', prompt: 'Generate a warm intro email' } },
  { id: '4', type: 'send_message', position: { x: 370, y: 470 }, data: { label: 'Send Intro Email', channel: 'email' } },
  { id: '5', type: 'delay', position: { x: 390, y: 620 }, data: { label: 'Wait 2 Hours', duration: '2 hours' } },
  { id: '6', type: 'reply_check', position: { x: 370, y: 770 }, data: { label: 'Got Reply?' } },
  { id: '7', type: 'follow_up', position: { x: 140, y: 940 }, data: { label: 'Follow Up', attempt: 'Attempt #2' } },
  { id: '8', type: 'update_crm', position: { x: 560, y: 940 }, data: { label: 'Mark Engaged' } },
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
  const isNew = id === 'new';

  const [nodes, setNodes, onNodesChange] = useNodesState(isNew ? [] : defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(isNew ? [] : defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState(isNew ? 'Untitled workflow' : 'Cold Outreach — Series A Founders');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'config'>('nodes');

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
    setSelectedNode(node);
    setActiveTab('config');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setActiveTab('nodes');
  }, []);

  const onDragStart = (e: React.DragEvent, item: ToolItem) => {
    e.dataTransfer.setData('application/reactflow-type', item.type);
    e.dataTransfer.setData('application/reactflow-data', JSON.stringify(item.data || {}));
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
      const newNode: Node = {
        id: String(nodeIdCounter++),
        type,
        position,
        data: {
          label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          ...extraData,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    setActiveTab('nodes');
  }, [selectedNode, setNodes, setEdges]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateNodeData = (key: string, value: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: value } } : n)),
    );
    setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, [key]: value } } : null);
  };

  const rfStyle = useMemo(() => ({ backgroundColor: 'transparent' }), []);

  /* ── helpers ── */
  const nodeMetaFor = (node: Node) => allItems.find(i => i.type === node.type);

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
            className="gap-1.5 h-7 text-xs rounded-lg font-medium"
            onClick={handleSave}
          >
            {saved
              ? <><CheckCircle size={11} className="text-emerald-500" /> Saved</>
              : <><Save size={11} /> Save</>
            }
          </Button>

          <Button size="sm" className="gap-1.5 h-7 text-xs rounded-lg font-medium">
            <Play size={11} /> Run
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
              className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === 'nodes'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${
                activeTab === 'config'
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
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedNode ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="h-10 w-10 rounded-xl border border-dashed border-border flex items-center justify-center mb-3">
                    <Settings2 size={16} className="text-muted-foreground/40" strokeWidth={1.5} />
                  </div>
                  <p className="text-[12px] font-medium text-muted-foreground">Select a node</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Click any node on the canvas to configure it</p>
                </div>
              ) : (
                <>
                  {/* Node header */}
                  <div className="px-3 py-3 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const meta = nodeMetaFor(selectedNode);
                          if (!meta) return null;
                          return (
                            <div className={`h-6 w-6 flex items-center justify-center rounded-md ${meta.color}`}>
                              <meta.icon size={12} strokeWidth={1.5} />
                            </div>
                          );
                        })()}
                        <span className="text-[12px] font-bold capitalize">
                          {selectedNode.type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <button
                        onClick={() => { setSelectedNode(null); setActiveTab('nodes'); }}
                        className="h-5 w-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md w-fit">
                      id: {selectedNode.id}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">

                    {/* Label */}
                    {(selectedNode.data as any).label !== undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Label
                        </label>
                        <input
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                          value={(selectedNode.data as any).label || ''}
                          onChange={(e) => updateNodeData('label', e.target.value)}
                          placeholder="Node label…"
                        />
                      </div>
                    )}

                    {/* AI Prompt */}
                    {(selectedNode.data as any).prompt !== undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          AI Prompt
                        </label>
                        <textarea
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all resize-none placeholder:text-muted-foreground/50"
                          rows={4}
                          value={(selectedNode.data as any).prompt || ''}
                          onChange={(e) => updateNodeData('prompt', e.target.value)}
                          placeholder="Enter AI message prompt…"
                        />
                      </div>
                    )}

                    {/* Channel */}
                    {(selectedNode.data as any).channel && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Channel
                        </label>
                        <select
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all capitalize"
                          value={(selectedNode.data as any).channel || 'email'}
                          onChange={(e) => updateNodeData('channel', e.target.value)}
                        >
                          <option value="email">Email</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                    )}

                    {/* Duration */}
                    {(selectedNode.data as any).duration !== undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Duration
                        </label>
                        <input
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                          value={(selectedNode.data as any).duration || ''}
                          onChange={(e) => updateNodeData('duration', e.target.value)}
                          placeholder="e.g. 2 hours, 1 day"
                        />
                      </div>
                    )}

                    {/* Subject (send_message) */}
                    {(selectedNode.data as any).subject !== undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Subject
                        </label>
                        <input
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                          value={(selectedNode.data as any).subject || ''}
                          onChange={(e) => updateNodeData('subject', e.target.value)}
                          placeholder="Email subject…"
                        />
                      </div>
                    )}

                    {/* Attempt (follow_up) */}
                    {(selectedNode.data as any).attempt !== undefined && (
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Attempt
                        </label>
                        <input
                          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                          value={(selectedNode.data as any).attempt || ''}
                          onChange={(e) => updateNodeData('attempt', e.target.value)}
                          placeholder="e.g. Attempt #2"
                        />
                      </div>
                    )}

                    {/* Position */}
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted rounded-lg px-2.5 py-1.5">
                          <span className="text-[9px] text-muted-foreground block">X</span>
                          <span className="text-[11px] font-mono font-medium">{Math.round(selectedNode.position.x)}</span>
                        </div>
                        <div className="bg-muted rounded-lg px-2.5 py-1.5">
                          <span className="text-[9px] text-muted-foreground block">Y</span>
                          <span className="text-[11px] font-mono font-medium">{Math.round(selectedNode.position.y)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="p-3 border-t border-border shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium"
                      onClick={deleteNode}
                    >
                      <Trash2 size={12} />
                      Remove node
                    </Button>
                  </div>
                </>
              )}
            </div>
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
    </div>
  );
}
