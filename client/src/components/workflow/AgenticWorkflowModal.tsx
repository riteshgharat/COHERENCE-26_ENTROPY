import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { Wand2, X, ChevronRight, Loader2, Sparkles, AlertCircle, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDefaultData } from '@/components/workflow/nodeDefinitions';
import { MarkerType, type Node, type Edge } from '@xyflow/react';

/* ── Type aliases: LLM may return variant spellings ── */
const TYPE_MAP: Record<string, string> = {
  start: 'start',
  end: 'end',
  lead_import: 'lead_upload',
  lead_upload: 'lead_upload',
  channel_select: 'send_message',
  send_message: 'send_message',
  wait: 'delay',
  delay: 'delay',
  check_reply: 'reply_check',
  reply_check: 'reply_check',
  followup: 'follow_up',
  follow_up: 'follow_up',
  update_sheets: 'update_crm',
  update_crm: 'update_crm',
  ai_message: 'ai_message',
  analytics: 'analytics',
  ai_conversation: 'ai_conversation',
};

const EXAMPLE_PROMPTS = [
  'Sales outreach: import Excel leads, generate AI message, send to WhatsApp, wait 2 days, check reply',
  'Cold email campaign: upload CSV, personalize with AI, send email, delay 3 days, follow up if no reply, log to CRM',
  'LinkedIn outreach: import leads, send LinkedIn DM, wait 1 day, if replied mark engaged in CRM',
  'WhatsApp blast: upload leads, AI-generate warm intro, send WhatsApp, auto-reply with AI agent',
  'Full funnel: lead upload → AI email → send → wait → reply check → follow up or CRM update → analytics',
];

const edgeColor = 'oklch(0.4 0 0)';

/* ── Auto-layout: BFS tree positioning ── */
function autoLayout(rawNodes: RawNode[], rawEdges: RawEdge[]): Node[] {
  const CENTER_X = 400;
  const Y_STEP = 160;

  const adj = new Map<string, string[]>();
  for (const e of rawEdges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  const inDegree = new Map<string, number>();
  for (const n of rawNodes) inDegree.set(n.id, 0);
  for (const e of rawEdges) inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);

  const roots = rawNodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);
  const nodeById = new Map(rawNodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const result: Node[] = [];

  interface QItem { id: string; depth: number; col: number }
  const queue: QItem[] = roots.map((n, i) => ({
    id: n.id,
    depth: 0,
    col: i - Math.floor(roots.length / 2),
  }));

  while (queue.length > 0) {
    const { id, depth, col } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const raw = nodeById.get(id);
    if (!raw) continue;

    const rfType = TYPE_MAP[raw.type] || raw.type;
    const defaults = getDefaultData(rfType);

    result.push({
      id: raw.id,
      type: rfType,
      position: { x: CENTER_X + col * 240 - 90, y: depth * Y_STEP + 40 },
      data: {
        ...defaults,
        ...raw.data,
        label: raw.data?.label || defaults.label || rfType.replace(/_/g, ' '),
      },
    });

    const children = adj.get(id) ?? [];
    children.forEach((childId, i) => {
      const childCol = children.length > 1 ? col + (i - Math.floor(children.length / 2)) : col;
      queue.push({ id: childId, depth: depth + 1, col: childCol });
    });
  }

  // Append any completely disconnected nodes
  rawNodes.forEach((n) => {
    if (!visited.has(n.id)) {
      const rfType = TYPE_MAP[n.type] || n.type;
      const defaults = getDefaultData(rfType);
      result.push({
        id: n.id,
        type: rfType,
        position: { x: CENTER_X, y: result.length * Y_STEP + 40 },
        data: { ...defaults, ...n.data },
      });
    }
  });

  return result;
}

function buildEdges(rawEdges: RawEdge[]): Edge[] {
  return rawEdges.map((e, i) => ({
    id: e.id ?? `e${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    animated: true,
    style: { stroke: edgeColor, strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
    label: e.label,
  }));
}

/* ── Types ── */
interface RawNode {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

interface RawEdge {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface Props {
  onGenerate: (nodes: Node[], edges: Edge[], name?: string) => void;
  onClose: () => void;
}

/* ── Generation steps for UI feedback ── */
const STEPS = [
  'Parsing your campaign context…',
  'Selecting optimal node sequence…',
  'Writing AI message copy & subject lines…',
  'Crafting follow-up tone & agent instructions…',
  'Building connections & branches…',
  'Laying out canvas…',
  'Done!',
];

export default function AgenticWorkflowModal({ onGenerate, onClose }: Props) {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'groq' | 'gemini'>('groq');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setStepIdx(0);

    // Animate through steps while waiting
    let step = 0;
    const stepTimer = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 2);
      setStepIdx(step);
    }, 900);

    try {
      const res = await fetch(`${API_URL}/api/v1/ai/generate-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), provider }),
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Server error ${res.status}${detail ? `: ${detail}` : ''}`);
      }

      const data = await res.json();
      setStepIdx(STEPS.length - 1);

      const rawNodes: RawNode[] = data.nodes ?? [];
      const rawEdges: RawEdge[] = data.edges ?? [];

      if (rawNodes.length === 0) {
        throw new Error('LLM returned an empty workflow. Try a more detailed prompt.');
      }

      await new Promise<void>((r) => setTimeout(r, 400));

      const positioned = autoLayout(rawNodes, rawEdges);
      const edges = buildEdges(rawEdges);
      onGenerate(positioned, edges, data.name);
    } catch (err: unknown) {
      clearInterval(stepTimer);
      setError(err instanceof Error ? err.message : 'Generation failed. Check API key and backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
              <Wand2 size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold leading-tight">AI Workflow Generator</h2>
              <p className="text-[11px] text-muted-foreground">Describe your campaign — AI designs the flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 overflow-y-auto">

          {/* Prompt textarea */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Describe your workflow
            </label>
            <textarea
              className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 resize-none placeholder:text-muted-foreground/50 transition-all leading-relaxed"
              rows={4}
              placeholder="e.g. I want to generate a sales flow using a file upload with Excel and send messages to WhatsApp with AI-generated personalized intros..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate();
              }}
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">Ctrl</kbd>
              {' + '}
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">Enter</kbd>
              {' to generate · '}
              <span className={prompt.length > 400 ? 'text-amber-500' : ''}>{prompt.length}</span> chars
            </p>
          </div>

          {/* Example prompts */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Quick examples
            </p>
            <div className="space-y-1">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  disabled={loading}
                  className="w-full text-left flex items-start gap-2 text-[11px] text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-accent hover:text-foreground transition-colors group"
                >
                  <ChevronRight size={9} className="mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span className="leading-relaxed">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model picker */}
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
              Model
            </p>
            <div className="flex rounded-lg border border-border overflow-hidden text-[11px]">
              {(['groq', 'gemini'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold capitalize transition-colors ${
                    provider === p
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {p === 'groq' ? <Zap size={9} /> : <Cpu size={9} />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3">
              <Loader2 size={14} className="animate-spin text-violet-600 dark:text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-violet-700 dark:text-violet-300">
                  {STEPS[stepIdx]}
                </p>
                <div className="mt-1.5 h-1 bg-violet-200 dark:bg-violet-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
              <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Powered by {provider === 'groq' ? 'Groq LLaMA' : 'Google Gemini'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="h-8 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="h-8 text-xs rounded-lg gap-1.5 bg-violet-600 hover:bg-violet-700 text-white border-0"
            >
              {loading
                ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                : <><Sparkles size={11} /> Generate Flow</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
