import { useState, useEffect } from 'react';
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
const edgeStyle = { stroke: edgeColor, strokeWidth: 1.5 };
const marker = { type: MarkerType.ArrowClosed, color: edgeColor };

// ── Per-template flows ──
const templateFlows: Record<string, { nodes: Node[]; edges: Edge[] }> = {
  // tpl-001 — Cold email sequence with AI personalization
  'tpl-001': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Import Leads' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Personalize Intro', prompt: 'Generate warm intro based on company details' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 470 }, data: { label: 'Send Email', channel: 'email', subject: 'Personalized cold outreach' } },
      { id: '5', type: 'delay', position: { x: 390, y: 620 }, data: { label: 'Wait 2 Hours', duration: '2 hours' } },
      { id: '6', type: 'reply_check', position: { x: 370, y: 770 }, data: { label: 'Got Reply?' } },
      { id: '7', type: 'follow_up', position: { x: 140, y: 940 }, data: { label: 'Send Follow Up', attempt: 'Attempt #2' } },
      { id: '8', type: 'update_crm', position: { x: 560, y: 940 }, data: { label: 'Mark Engaged' } },
      { id: '9', type: 'end', position: { x: 400, y: 1100 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', sourceHandle: 'no', target: '7', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e6-8', source: '6', sourceHandle: 'yes', target: '8', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e7-9', source: '7', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e8-9', source: '8', target: '9', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-002 — LinkedIn connection + email follow-up combo
  'tpl-002': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Import Leads' } },
      { id: '3', type: 'send_message', position: { x: 370, y: 310 }, data: { label: 'LinkedIn Connect', channel: 'linkedin' } },
      { id: '4', type: 'delay', position: { x: 390, y: 460 }, data: { label: 'Wait 3 Days', duration: '3 days' } },
      { id: '5', type: 'reply_check', position: { x: 370, y: 610 }, data: { label: 'Accepted?' } },
      { id: '6', type: 'ai_message', position: { x: 560, y: 770 }, data: { label: 'Generate Email', prompt: 'Write follow-up email for accepted LinkedIn connection' } },
      { id: '7', type: 'send_message', position: { x: 560, y: 930 }, data: { label: 'Send Email', channel: 'email' } },
      { id: '8', type: 'follow_up', position: { x: 140, y: 770 }, data: { label: 'Retry Connect' } },
      { id: '9', type: 'end', position: { x: 400, y: 1080 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', sourceHandle: 'yes', target: '6', style: edgeStyle, markerEnd: marker, label: 'Accepted' },
      { id: 'e5-8', source: '5', sourceHandle: 'no', target: '8', style: edgeStyle, markerEnd: marker, label: 'Pending' },
      { id: 'e6-7', source: '6', target: '7', style: edgeStyle, markerEnd: marker },
      { id: 'e7-9', source: '7', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e8-9', source: '8', target: '9', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-003 — Gmail classification & response with GPT
  'tpl-003': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Inbox Leads' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Classify Email', prompt: 'Classify lead intent: interested, question, or spam' } },
      { id: '4', type: 'reply_check', position: { x: 370, y: 460 }, data: { label: 'High Priority?' } },
      { id: '5', type: 'ai_conversation', position: { x: 560, y: 620 }, data: { label: 'Draft AI Reply' } },
      { id: '6', type: 'send_message', position: { x: 560, y: 780 }, data: { label: 'Send Reply', channel: 'email' } },
      { id: '7', type: 'send_message', position: { x: 140, y: 620 }, data: { label: 'WhatsApp Alert', channel: 'whatsapp' } },
      { id: '8', type: 'update_crm', position: { x: 370, y: 780 }, data: { label: 'Update Status' } },
      { id: '9', type: 'analytics', position: { x: 370, y: 930 }, data: { label: 'Track Metrics' } },
      { id: '10', type: 'end', position: { x: 400, y: 1080 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', sourceHandle: 'yes', target: '5', style: edgeStyle, markerEnd: marker, label: 'High' },
      { id: 'e4-7', source: '4', sourceHandle: 'no', target: '7', style: edgeStyle, markerEnd: marker, label: 'Low' },
      { id: 'e5-6', source: '5', target: '6', style: edgeStyle, markerEnd: marker },
      { id: 'e6-8', source: '6', target: '8', style: edgeStyle, markerEnd: marker },
      { id: 'e7-8', source: '7', target: '8', style: edgeStyle, markerEnd: marker },
      { id: 'e8-9', source: '8', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e9-10', source: '9', target: '10', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-004 — Event follow-up with smart delay & reply detection
  'tpl-004': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Event Attendees' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Thank-You Note', prompt: 'Write event follow-up thank-you email' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 460 }, data: { label: 'Send Email', channel: 'email' } },
      { id: '5', type: 'delay', position: { x: 390, y: 610 }, data: { label: 'Wait 48 Hours', duration: '48 hours' } },
      { id: '6', type: 'reply_check', position: { x: 370, y: 760 }, data: { label: 'Got Reply?' } },
      { id: '7', type: 'follow_up', position: { x: 140, y: 920 }, data: { label: 'Second Follow-Up' } },
      { id: '8', type: 'end', position: { x: 400, y: 1060 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', sourceHandle: 'no', target: '7', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e6-8', source: '6', sourceHandle: 'yes', target: '8', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e7-8', source: '7', target: '8', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-005 — WhatsApp outreach with AI conversation agent
  'tpl-005': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Import Leads' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Craft WA Opener', prompt: 'Write casual WhatsApp intro message' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 460 }, data: { label: 'Send WhatsApp', channel: 'whatsapp' } },
      { id: '5', type: 'delay', position: { x: 390, y: 610 }, data: { label: 'Wait 1 Hour', duration: '1 hour' } },
      { id: '6', type: 'reply_check', position: { x: 370, y: 760 }, data: { label: 'Got Reply?' } },
      { id: '7', type: 'ai_conversation', position: { x: 560, y: 920 }, data: { label: 'AI Agent Chat' } },
      { id: '8', type: 'update_crm', position: { x: 560, y: 1080 }, data: { label: 'Book Meeting' } },
      { id: '9', type: 'follow_up', position: { x: 140, y: 920 }, data: { label: 'Nudge Again' } },
      { id: '10', type: 'end', position: { x: 400, y: 1220 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', sourceHandle: 'yes', target: '7', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e6-9', source: '6', sourceHandle: 'no', target: '9', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e7-8', source: '7', target: '8', style: edgeStyle, markerEnd: marker },
      { id: 'e8-10', source: '8', target: '10', style: edgeStyle, markerEnd: marker },
      { id: 'e9-10', source: '9', target: '10', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-006 — Multi-channel re-engagement for dormant leads
  'tpl-006': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Dormant Leads' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Re-engagement Email', prompt: 'Write friendly re-engagement email for dormant lead' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 460 }, data: { label: 'Send Email', channel: 'email' } },
      { id: '5', type: 'delay', position: { x: 390, y: 610 }, data: { label: 'Wait 5 Days', duration: '5 days' } },
      { id: '6', type: 'reply_check', position: { x: 370, y: 760 }, data: { label: 'Replied?' } },
      { id: '7', type: 'send_message', position: { x: 140, y: 920 }, data: { label: 'LinkedIn Message', channel: 'linkedin' } },
      { id: '8', type: 'update_crm', position: { x: 560, y: 920 }, data: { label: 'Mark Re-engaged' } },
      { id: '9', type: 'analytics', position: { x: 370, y: 1080 }, data: { label: 'Track Results' } },
      { id: '10', type: 'end', position: { x: 400, y: 1220 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', sourceHandle: 'no', target: '7', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e6-8', source: '6', sourceHandle: 'yes', target: '8', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e7-9', source: '7', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e8-9', source: '8', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e9-10', source: '9', target: '10', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-007 — Investor update newsletter with CRM sync
  'tpl-007': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Investor List' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Draft Update', prompt: 'Generate monthly investor update newsletter' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 460 }, data: { label: 'Batch Send', channel: 'email' } },
      { id: '5', type: 'analytics', position: { x: 370, y: 610 }, data: { label: 'Track Opens' } },
      { id: '6', type: 'update_crm', position: { x: 370, y: 760 }, data: { label: 'Sync to CRM' } },
      { id: '7', type: 'end', position: { x: 400, y: 900 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', target: '7', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-008 — LinkedIn warm intro sequence for VC founders
  'tpl-008': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'VC Founders' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Warm Intro Msg', prompt: 'Craft LinkedIn warm intro referencing mutual connections' } },
      { id: '4', type: 'send_message', position: { x: 370, y: 460 }, data: { label: 'LinkedIn DM', channel: 'linkedin' } },
      { id: '5', type: 'delay', position: { x: 390, y: 610 }, data: { label: 'Wait 3 Days', duration: '3 days' } },
      { id: '6', type: 'reply_check', position: { x: 370, y: 760 }, data: { label: 'Got Reply?' } },
      { id: '7', type: 'follow_up', position: { x: 140, y: 920 }, data: { label: 'Gentle Follow-Up' } },
      { id: '8', type: 'update_crm', position: { x: 560, y: 920 }, data: { label: 'Mark Warm Lead' } },
      { id: '9', type: 'end', position: { x: 400, y: 1080 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', sourceHandle: 'no', target: '7', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e6-8', source: '6', sourceHandle: 'yes', target: '8', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e7-9', source: '7', target: '9', style: edgeStyle, markerEnd: marker },
      { id: 'e8-9', source: '8', target: '9', style: edgeStyle, markerEnd: marker },
    ],
  },

  // tpl-009 — WhatsApp + LinkedIn dual outreach for SaaS signups
  'tpl-009': {
    nodes: [
      { id: '1', type: 'start', position: { x: 400, y: 40 }, data: {} },
      { id: '2', type: 'lead_upload', position: { x: 370, y: 160 }, data: { label: 'Trial Users' } },
      { id: '3', type: 'ai_message', position: { x: 360, y: 310 }, data: { label: 'Generate Variants', prompt: 'Create WA + LinkedIn message variants for trial users' } },
      { id: '4', type: 'send_message', position: { x: 180, y: 470 }, data: { label: 'Send WhatsApp', channel: 'whatsapp' } },
      { id: '5', type: 'send_message', position: { x: 560, y: 470 }, data: { label: 'LinkedIn DM', channel: 'linkedin' } },
      { id: '6', type: 'delay', position: { x: 390, y: 620 }, data: { label: 'Wait 2 Days', duration: '2 days' } },
      { id: '7', type: 'reply_check', position: { x: 370, y: 770 }, data: { label: 'Any Reply?' } },
      { id: '8', type: 'ai_conversation', position: { x: 560, y: 930 }, data: { label: 'AI Qualify' } },
      { id: '9', type: 'follow_up', position: { x: 140, y: 930 }, data: { label: 'Final Nudge' } },
      { id: '10', type: 'analytics', position: { x: 370, y: 1090 }, data: { label: 'Conversion Stats' } },
      { id: '11', type: 'end', position: { x: 400, y: 1230 }, data: {} },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e3-5', source: '3', target: '5', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e4-6', source: '4', target: '6', style: edgeStyle, markerEnd: marker },
      { id: 'e5-6', source: '5', target: '6', style: edgeStyle, markerEnd: marker },
      { id: 'e6-7', source: '6', target: '7', animated: true, style: edgeStyle, markerEnd: marker },
      { id: 'e7-8', source: '7', sourceHandle: 'yes', target: '8', style: edgeStyle, markerEnd: marker, label: 'Replied' },
      { id: 'e7-9', source: '7', sourceHandle: 'no', target: '9', style: edgeStyle, markerEnd: marker, label: 'No Reply' },
      { id: 'e8-10', source: '8', target: '10', style: edgeStyle, markerEnd: marker },
      { id: 'e9-10', source: '9', target: '10', style: edgeStyle, markerEnd: marker },
      { id: 'e10-11', source: '10', target: '11', style: edgeStyle, markerEnd: marker },
    ],
  },
};

// Fallback for unknown template IDs or wf-* workflows
const defaultFlow = templateFlows['tpl-001'];

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
  'tpl-001': {
    name: 'Cold email sequence with AI personalization',
    author: 'OutflowAI',
    verified: true,
    tags: ['Cold Outreach', 'AI'],
    setupTime: '5 min',
    channels: ['email'],
    description: 'Let GPT craft a unique intro for every lead using their company info, role, and recent news. Includes smart reply detection and follow-up branching.\n\n## How it works\n\n1. **Import Leads** — Upload CSV or Excel with prospect data\n2. **AI Personalization** — GPT writes a unique intro per lead\n3. **Send Email** — Delivers through your Gmail or SMTP\n4. **Smart Delay** — Randomised 2-hour waits to mimic human cadence\n5. **Reply Detection** — Checks for responses automatically\n6. **Follow Up** — Contextual second touch if no reply\n7. **CRM Update** — Marks engaged leads in your database',
  },
  'tpl-002': {
    name: 'LinkedIn connection + email follow-up combo',
    author: 'Community',
    verified: true,
    tags: ['Multi-channel', 'LinkedIn'],
    setupTime: '8 min',
    channels: ['linkedin', 'email'],
    description: 'Send a LinkedIn connection request first, then follow up with a personalised email if they accept. Full multi-channel orchestration.\n\n## How it works\n\n1. **Import Leads** — Load your target list\n2. **LinkedIn Connect** — Send connection requests\n3. **Wait 3 Days** — Allow time for acceptance\n4. **Check Status** — Branch on accepted vs pending\n5. **AI Email** — Generate a personalised follow-up email\n6. **Send Email** — Deliver through connected email account\n7. **Retry** — Re-attempt connection for pending requests',
  },
  'tpl-003': {
    name: 'Automated Gmail classification & response with GPT',
    author: 'OutflowAI',
    verified: true,
    tags: ['AI', 'Cold Outreach'],
    setupTime: '11 min',
    channels: ['email', 'whatsapp'],
    description: 'Automatically classify incoming emails, generate context-aware replies using GPT, and trigger WhatsApp alerts for high-priority leads.\n\n## How it works\n\n1. **Inbox Leads** — Monitors incoming email contacts\n2. **Classify Email** — AI categorises intent (interested / question / spam)\n3. **Priority Check** — Branch high vs low priority\n4. **AI Reply** — GPT drafts a context-aware response for high-priority\n5. **Send Reply** — Auto-send the reply via email\n6. **WhatsApp Alert** — Notify team of low-priority via WhatsApp\n7. **CRM Update** — Sync status across all channels\n8. **Analytics** — Track classification accuracy and response rates',
  },
  'tpl-004': {
    name: 'Event follow-up with smart delay & reply detection',
    author: 'Community',
    verified: false,
    tags: ['Events', 'Cold Outreach'],
    setupTime: '6 min',
    channels: ['email'],
    description: 'Post-event email sequence with randomised delays to mimic human sending patterns. Branches based on reply status within 48h.\n\n## How it works\n\n1. **Event Attendees** — Import your attendee list\n2. **Thank-You Note** — AI writes a personalised thank-you\n3. **Send Email** — Deliver immediately post-event\n4. **Wait 48 Hours** — Smart delay before checking\n5. **Reply Detection** — Check for responses\n6. **Follow-Up** — Second touch for non-responders',
  },
  'tpl-005': {
    name: 'WhatsApp outreach with AI conversation agent',
    author: 'OutflowAI',
    verified: true,
    tags: ['WhatsApp', 'AI'],
    setupTime: '14 min',
    channels: ['whatsapp'],
    description: 'Deploy an AI conversation agent over WhatsApp to qualify leads, answer FAQs, and book meetings — all fully automated.\n\n## How it works\n\n1. **Import Leads** — Load your target prospect list\n2. **Craft Opener** — AI writes a casual WhatsApp intro\n3. **Send WhatsApp** — Deliver the opener message\n4. **Wait 1 Hour** — Allow time for response\n5. **Reply Check** — Branch on replied vs no reply\n6. **AI Agent Chat** — Full conversation agent handles qualifying\n7. **Book Meeting** — Auto-schedule via CRM integration\n8. **Nudge** — Follow-up for non-responders',
  },
  'tpl-006': {
    name: 'Multi-channel re-engagement for dormant leads',
    author: 'Community',
    verified: true,
    tags: ['Re-engagement', 'Multi-channel'],
    setupTime: '10 min',
    channels: ['email', 'linkedin'],
    description: 'Re-ignite relationships with leads that went cold 90+ days ago using a coordinated email and LinkedIn outreach sequence.\n\n## How it works\n\n1. **Dormant Leads** — Filter leads inactive 90+ days\n2. **Re-engagement Email** — AI writes a friendly re-engagement note\n3. **Send Email** — Primary outreach via email\n4. **Wait 5 Days** — Allow time for response\n5. **Reply Check** — Branch on replied vs silent\n6. **LinkedIn Message** — Secondary outreach for non-responders\n7. **CRM Update** — Mark re-engaged leads\n8. **Analytics** — Track re-engagement rates',
  },
  'tpl-007': {
    name: 'Investor update newsletter with CRM sync',
    author: 'OutflowAI',
    verified: true,
    tags: ['Cold Outreach'],
    setupTime: '7 min',
    channels: ['email'],
    description: 'Batch send investor updates, track open rates, and automatically sync engagement data back to your CRM for follow-up prioritisation.\n\n## How it works\n\n1. **Investor List** — Import your investor contacts\n2. **Draft Update** — AI generates monthly update newsletter\n3. **Batch Send** — Deliver to all investors via email\n4. **Track Opens** — Monitor open & click rates\n5. **CRM Sync** — Push engagement metrics to your CRM',
  },
  'tpl-008': {
    name: 'LinkedIn warm intro sequence for VC founders',
    author: 'Community',
    verified: false,
    tags: ['LinkedIn', 'Cold Outreach'],
    setupTime: '9 min',
    channels: ['linkedin'],
    description: 'Identify mutual connections, craft a warm intro message leveraging shared context, and chain follow-ups with a 3-day smart delay.\n\n## How it works\n\n1. **VC Founders** — Import your target founder list\n2. **Warm Intro** — AI crafts intros referencing mutual connections\n3. **LinkedIn DM** — Send the personalised message\n4. **Wait 3 Days** — Smart delay before follow-up\n5. **Reply Check** — Branch on replied vs silent\n6. **Follow-Up** — Gentle second touch for non-responders\n7. **CRM Update** — Mark warm leads for prioritisation',
  },
  'tpl-009': {
    name: 'WhatsApp + LinkedIn dual outreach for SaaS signups',
    author: 'OutflowAI',
    verified: true,
    tags: ['WhatsApp', 'LinkedIn', 'Multi-channel'],
    setupTime: '12 min',
    channels: ['whatsapp', 'linkedin'],
    description: 'Target trial users who haven\'t converted with a dual outreach sequence via WhatsApp and LinkedIn simultaneously, with AI-generated message variants.\n\n## How it works\n\n1. **Trial Users** — Import unconverted trial signups\n2. **Generate Variants** — AI creates WA + LinkedIn message variants\n3. **Send WhatsApp** — Deliver via WhatsApp\n4. **LinkedIn DM** — Simultaneously reach out on LinkedIn\n5. **Wait 2 Days** — Allow time for responses\n6. **Reply Check** — Branch any-channel replies\n7. **AI Qualify** — Conversation agent qualifies responders\n8. **Final Nudge** — Last-touch for non-responders\n9. **Conversion Stats** — Track conversion metrics',
  },
};

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (id === 'edit') {
      navigate('/workflows', { replace: true });
    }
  }, [id, navigate]);
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

  const flow = templateFlows[id || ''] || defaultFlow;

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
            nodes={flow.nodes}
            edges={flow.edges}
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
