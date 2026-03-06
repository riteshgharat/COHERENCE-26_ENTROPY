import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  Mail,
  Linkedin,
  MessageCircle,
  Edit3,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const edgeColor = 'oklch(0.4 0 0)';

const sampleNodes: Node[] = [
  { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
  { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Import Leads' } },
  { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Personalize Intro', prompt: 'Generate warm intro based on company details' } },
  { id: '4', type: 'send_message', position: { x: 370, y: 470 }, data: { label: 'Send Email', channel: 'email', subject: 'Personalized cold outreach' } },
  { id: '5', type: 'delay', position: { x: 390, y: 620 }, data: { label: 'Wait 2 Hours', duration: '2 hours' } },
  { id: '6', type: 'reply_check', position: { x: 370, y: 770 }, data: { label: 'Got Reply?' } },
  { id: '7', type: 'follow_up', position: { x: 140, y: 940 }, data: { label: 'Send Follow Up', attempt: 'Attempt #2' } },
  { id: '8', type: 'update_crm', position: { x: 560, y: 940 }, data: { label: 'Mark Engaged' } },
  { id: '9', type: 'end', position: { x: 400, y: 1100 }, data: {} },
];

const sampleEdges: Edge[] = [
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

const workflowData: Record<string, any> = {
  'wf-001': {
    name: 'Cold Outreach — Series A Founders',
    author: 'Ayush Choudhar',
    verified: true,
    tags: ['Cold Outreach', 'AI Personalization'],
    setupTime: '5 min',
    channels: ['email'],
    description: 'This workflow automatically imports Series A founder leads, generates personalized intro emails using AI, sends them via email, waits for replies, and follows up if no response is received.\n\nThe AI personalization engine analyzes each lead\'s company, industry, and recent news to craft highly relevant messages.\n\n## How it works\n\n1. **Import Leads** — Batch import from CSV or connect to your CRM\n2. **AI Personalization** — GPT generates a unique intro for each lead\n3. **Send Email** — Delivers via your connected Gmail account\n4. **Smart Wait** — Randomized 2-4 hour delay to appear human\n5. **Reply Detection** — Checks inbox for responses\n6. **Follow Up** — Sends a contextual follow-up if no reply after 48h\n7. **CRM Sync** — Updates lead status in your database',
  },
  'wf-002': {
    name: 'Re-engagement Campaign Q1',
    author: 'Ayush Choudhar',
    verified: true,
    tags: ['Re-engagement', 'Multi-channel'],
    setupTime: '8 min',
    channels: ['email', 'linkedin'],
    description: 'Re-engages dormant leads from Q4 with a multi-channel approach combining email and LinkedIn outreach.\n\n## How it works\n\n1. **Filter Leads** — Selects leads inactive for 90+ days\n2. **Generate Message** — AI crafts re-engagement messages\n3. **Send via Email** — Primary outreach channel\n4. **LinkedIn Follow-up** — Connection request if no email reply\n5. **Track Results** — Monitors engagement across channels',
  },
};

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const workflow = workflowData[id || ''] || {
    name: id?.startsWith('tpl-') ? 'Template Workflow' : 'Workflow',
    author: 'OutflowAI',
    verified: true,
    tags: ['Outreach', 'Automation'],
    setupTime: '5 min',
    channels: ['email'],
    description: 'An automated outreach workflow that helps you reach prospects efficiently.\n\n## How it works\n\n1. **Import your leads** from CSV, Excel, or directly from your CRM\n2. **AI generates** personalized messages for each lead\n3. **Messages are sent** through your connected channels\n4. **Smart delays** make your outreach appear natural\n5. **Reply detection** checks for responses automatically\n6. **Follow-ups** are sent to non-responders',
  };

  const channelIcons: Record<string, any> = {
    email: Mail,
    linkedin: Linkedin,
    whatsapp: MessageCircle,
  };

  const rfStyle = useMemo(() => ({ backgroundColor: 'transparent' }), []);

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col -m-6 animate-fade-in">
      {/* Back button */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 h-7 text-xs rounded-lg text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} />
          Back
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Preview */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={sampleNodes}
            edges={sampleEdges}
            nodeTypes={nodeTypes}
            style={rfStyle}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
            <Controls
              showInteractive={false}
              position="bottom-left"
              className="!bg-card !border-border !shadow-sm !rounded-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
            />
          </ReactFlow>
        </div>

        {/* Info Panel */}
        <div className="lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
          {/* Workflow Card */}
          <div className="p-5 border-b border-border">
            <h2 className="text-[15px] font-semibold leading-snug mb-3">{workflow.name}</h2>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Sparkles size={10} />
                {workflow.author}
              </span>
              {workflow.verified && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {workflow.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px] font-medium h-5 rounded px-2">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {workflow.setupTime} setup
              </span>
              <div className="flex items-center gap-1">
                {workflow.channels.map((ch: string) => {
                  const Icon = channelIcons[ch];
                  return Icon ? (
                    <div key={ch} className="h-5 w-5 rounded flex items-center justify-center bg-accent">
                      <Icon size={11} />
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 gap-2 h-8 text-xs font-medium rounded-lg"
                onClick={() => navigate(`/workflows/${id}/edit`)}
              >
                <Edit3 size={12} />
                Edit workflow
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-medium rounded-lg">
                <Copy size={12} />
                Duplicate
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="p-5">
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
              {workflow.description.split('\n').map((line: string, i: number) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-[13px] font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                }
                if (line.match(/^\d+\.\s\*\*/)) {
                  const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\s*—?\s*(.*)/);
                  if (match) {
                    return (
                      <div key={i} className="flex gap-2 py-1 text-[12px]">
                        <span className="text-muted-foreground font-mono text-[10px] mt-0.5 shrink-0">{line.match(/^\d+/)?.[0]}.</span>
                        <div>
                          <span className="font-medium">{match[1]}</span>
                          {match[2] && <span className="text-muted-foreground"> — {match[2]}</span>}
                        </div>
                      </div>
                    );
                  }
                }
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-[12px] text-muted-foreground leading-relaxed">{line}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
