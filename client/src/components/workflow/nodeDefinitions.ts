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
  Bot,
  type LucideIcon,
} from 'lucide-react';

// ── Property Types ──

export type PropertyType = 'text' | 'textarea' | 'select' | 'number';

export interface PropertyDef {
  key: string;
  label: string;
  type: PropertyType;
  placeholder?: string;
  /** Dynamic placeholder resolved from other field values in the same node */
  placeholderFn?: (data: Record<string, unknown>) => string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  description?: string;
  /** If true, only shown in the right-side panel — not inline on the node card */
  advanced?: boolean;
}

export interface OutputHandle {
  id?: string;
  label?: string;
  position: 'bottom' | 'right' | 'left';
}

export interface NodeDefinition {
  type: string;
  label: string;
  category: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind bg-color class for the node header */
  color: string;
  hasTarget: boolean;
  outputs: OutputHandle[];
  properties: PropertyDef[];
  /** Renders as a small pill instead of a full card (Start / End) */
  compact?: boolean;
}

// ── Definitions ──

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  start: {
    type: 'start',
    label: 'Start',
    category: 'Flow Control',
    description: 'Workflow entry point',
    icon: Play,
    color: 'bg-emerald-500',
    hasTarget: false,
    outputs: [{ position: 'bottom' }],
    properties: [],
    compact: true,
  },
  end: {
    type: 'end',
    label: 'End',
    category: 'Flow Control',
    description: 'Workflow exit point',
    icon: Square,
    color: 'bg-zinc-500',
    hasTarget: true,
    outputs: [],
    properties: [],
    compact: true,
  },
  lead_upload: {
    type: 'lead_upload',
    label: 'Lead Upload',
    category: 'Data & Analytics',
    description: 'Import leads from CSV, Excel, or JSON',
    icon: Upload,
    color: 'bg-amber-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'industry',
        label: 'Industry Filter',
        type: 'text',
        placeholder: 'e.g. SaaS, Fintech',
        description: 'Only process leads matching this industry',
      },
      {
        key: 'status',
        label: 'Status Filter',
        type: 'select',
        options: [
          { label: 'All', value: '' },
          { label: 'New', value: 'new' },
          { label: 'Contacted', value: 'contacted' },
          { label: 'Replied', value: 'replied' },
          { label: 'Interested', value: 'interested' },
        ],
        defaultValue: '',
      },
    ],
  },
  ai_message: {
    type: 'ai_message',
    label: 'AI Message',
    category: 'AI & Automation',
    description: 'Generate personalized outreach using AI',
    icon: Sparkles,
    color: 'bg-violet-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'tone',
        label: 'Tone',
        type: 'text',
        defaultValue: 'professional and friendly',
        placeholder: 'e.g. casual, formal, witty',
      },
      {
        key: 'sample_message',
        label: 'Sample Message',
        type: 'textarea',
        placeholder: 'Paste a reference message for style...',
      },
      {
        key: 'subject',
        label: 'Subject Template',
        type: 'text',
        placeholder: 'Hi {name}, quick question',
        description: 'Use {name}, {company} as variables',
      },
      {
        key: 'provider',
        label: 'AI Provider',
        type: 'select',
        defaultValue: 'groq',
        options: [
          { label: 'Groq (Llama)', value: 'groq' },
          { label: 'Google Gemini', value: 'gemini' },
        ],
      },
    ],
  },
  send_message: {
    type: 'send_message',
    label: 'Send Message',
    category: 'Messaging',
    description: 'Send message through a channel',
    icon: Mail,
    color: 'bg-sky-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'channel',
        label: 'Channel',
        type: 'select',
        defaultValue: 'email',
        options: [
          { label: 'Email', value: 'email' },
          { label: 'LinkedIn', value: 'linkedin' },
          { label: 'WhatsApp', value: 'whatsapp' },
        ],
      },
      {
        key: 'subject',
        label: 'Subject / Message',
        type: 'text',
        placeholder: 'Enter message...',
        placeholderFn: (data) => {
          if (data.channel === 'email') return 'Email subject line...';
          if (data.channel === 'linkedin') return 'LinkedIn connection message...';
          if (data.channel === 'whatsapp') return 'WhatsApp message text...';
          return 'Enter message...';
        },
      },
    ],
  },
  delay: {
    type: 'delay',
    label: 'Delay',
    category: 'Flow Control',
    description: 'Wait for a specified duration before continuing',
    icon: Clock,
    color: 'bg-purple-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'delay_seconds',
        label: 'Delay (seconds)',
        type: 'number',
        defaultValue: 86400,
        description: '86400 = 1 day, 3600 = 1 hour',
      },
    ],
  },
  reply_check: {
    type: 'reply_check',
    label: 'Reply Check',
    category: 'Flow Control',
    description: 'Branch based on whether lead replied',
    icon: GitBranch,
    color: 'bg-blue-500',
    hasTarget: true,
    outputs: [
      { id: 'yes', label: 'Replied', position: 'right' },
      { id: 'no', label: 'No Reply', position: 'bottom' },
    ],
    properties: [
      {
        key: 'timeout_hours',
        label: 'Timeout (hours)',
        type: 'number',
        defaultValue: 48,
        description: 'Hours to wait before taking the No Reply branch',
      },
    ],
  },
  follow_up: {
    type: 'follow_up',
    label: 'Follow Up',
    category: 'Messaging',
    description: 'AI-generated follow-up message',
    icon: RefreshCw,
    color: 'bg-orange-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'tone',
        label: 'Tone',
        type: 'text',
        defaultValue: 'polite and brief',
      },
      {
        key: 'max_attempts',
        label: 'Max Attempts',
        type: 'number',
        defaultValue: 3,
      },
      {
        key: 'provider',
        label: 'AI Provider',
        type: 'select',
        defaultValue: 'groq',
        options: [
          { label: 'Groq (Llama)', value: 'groq' },
          { label: 'Google Gemini', value: 'gemini' },
        ],
      },
    ],
  },
  update_crm: {
    type: 'update_crm',
    label: 'Update Sheets',
    category: 'Data & Analytics',
    description: 'Export lead data to Google Sheets',
    icon: Database,
    color: 'bg-teal-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'spreadsheet_id',
        label: 'Spreadsheet ID',
        type: 'text',
        placeholder: 'Google Sheets document ID',
      },
      {
        key: 'worksheet_name',
        label: 'Worksheet Name',
        type: 'text',
        defaultValue: 'Sheet1',
      },
    ],
  },
  analytics: {
    type: 'analytics',
    label: 'Analytics',
    category: 'Data & Analytics',
    description: 'Track custom metrics and events',
    icon: BarChart3,
    color: 'bg-indigo-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'metric_name',
        label: 'Metric Name',
        type: 'text',
        defaultValue: 'custom_event',
        placeholder: 'Event name to track',
      },
    ],
  },
  ai_conversation: {
    type: 'ai_conversation',
    label: 'AI Conversation',
    category: 'AI & Automation',
    description: 'AI agent for ongoing lead conversations',
    icon: Bot,
    color: 'bg-fuchsia-500',
    hasTarget: true,
    outputs: [{ position: 'bottom' }],
    properties: [
      {
        key: 'instructions',
        label: 'Instructions',
        type: 'textarea',
        defaultValue: 'Be polite and suggest a call.',
        placeholder: 'Instructions for the AI agent...',
      },
      {
        key: 'provider',
        label: 'AI Provider',
        type: 'select',
        defaultValue: 'groq',
        options: [
          { label: 'Groq (Llama)', value: 'groq' },
          { label: 'Google Gemini', value: 'gemini' },
        ],
      },
    ],
  },
};

// ── Helpers ──

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS[type];
}

export function getDefaultData(type: string): Record<string, any> {
  const def = NODE_DEFINITIONS[type];
  if (!def) return { label: type };
  const data: Record<string, any> = { label: def.label };
  for (const p of def.properties) {
    if (p.defaultValue !== undefined) {
      data[p.key] = p.defaultValue;
    }
  }
  return data;
}
