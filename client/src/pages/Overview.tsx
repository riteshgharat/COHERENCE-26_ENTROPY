import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Clock,
  Plus,
  Mail,
  Linkedin,
  MessageCircle,
  Users,
  Sparkles,
  CheckCircle2,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit3,
  ArrowUpRight,
  FilePlus2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Data ──────────────────────────────────────────────── */

const myWorkflows = [
  {
    id: 'wf-001',
    name: 'Cold Outreach — Series A Founders',
    description: 'AI-personalised email sequence targeting Series A founders with smart delay and reply detection.',
    status: 'running' as const,
    lastRun: '2 min ago',
    leads: 1240,
    sent: 892,
    replied: 189,
    nodes: 9,
    channels: ['email'],
  },
  {
    id: 'wf-002',
    name: 'Re-engagement Campaign Q1',
    description: 'Multi-channel re-engagement for dormant leads using LinkedIn DM and email follow-ups.',
    status: 'completed' as const,
    lastRun: '1 hour ago',
    leads: 856,
    sent: 856,
    replied: 294,
    nodes: 7,
    channels: ['linkedin', 'email'],
  },
  {
    id: 'wf-003',
    name: 'Event Follow-up — TechCrunch Disrupt',
    description: 'Automated post-event email outreach with AI conversation agent for hot leads.',
    status: 'completed' as const,
    lastRun: '3 hours ago',
    leads: 320,
    sent: 320,
    replied: 128,
    nodes: 6,
    channels: ['email'],
  },
  {
    id: 'wf-004',
    name: 'LinkedIn + Email Combo Test',
    description: 'Experimental dual-channel outreach combining connection requests and cold emails.',
    status: 'paused' as const,
    lastRun: '5 hours ago',
    leads: 2100,
    sent: 315,
    replied: 31,
    nodes: 8,
    channels: ['linkedin', 'email'],
  },
  {
    id: 'wf-005',
    name: 'AI Developer Outreach',
    description: 'Targeted outreach to AI/ML engineers using GPT-personalised messaging via WhatsApp.',
    status: 'failed' as const,
    lastRun: '1 day ago',
    leads: 450,
    sent: 120,
    replied: 8,
    nodes: 5,
    channels: ['whatsapp'],
  },
  {
    id: 'wf-006',
    name: 'YC Batch W26 Intro Sequence',
    description: 'Warm intro email sequence for YC batch founders with CRM sync on reply.',
    status: 'completed' as const,
    lastRun: '2 days ago',
    leads: 580,
    sent: 580,
    replied: 243,
    nodes: 10,
    channels: ['email'],
  },
];

const templates = [
  {
    id: 'tpl-001',
    name: 'Cold email sequence with AI personalization',
    author: 'OutflowAI',
    verified: true,
    setupTime: '5 min',
    channels: ['email'],
  },
  {
    id: 'tpl-002',
    name: 'LinkedIn connection + email follow-up combo',
    author: 'Community',
    verified: true,
    setupTime: '8 min',
    channels: ['linkedin', 'email'],
  },
  {
    id: 'tpl-003',
    name: 'Automated Gmail classification & response with GPT',
    author: 'OutflowAI',
    verified: true,
    setupTime: '11 min',
    channels: ['email', 'whatsapp'],
  },
  {
    id: 'tpl-004',
    name: 'Event follow-up with smart delay & reply detection',
    author: 'Community',
    verified: false,
    setupTime: '6 min',
    channels: ['email'],
  },
  {
    id: 'tpl-005',
    name: 'WhatsApp outreach with AI conversation agent',
    author: 'OutflowAI',
    verified: true,
    setupTime: '14 min',
    channels: ['whatsapp'],
  },
  {
    id: 'tpl-006',
    name: 'Multi-channel re-engagement for dormant leads',
    author: 'Community',
    verified: true,
    setupTime: '10 min',
    channels: ['email', 'linkedin'],
  },
];

const statusConfig = {
  running: { label: 'Running', dot: 'bg-foreground animate-pulse', pill: 'border-foreground/20 bg-foreground/5' },
  completed: { label: 'Completed', dot: 'bg-foreground/30', pill: 'border-border bg-muted/50' },
  paused: { label: 'Paused', dot: 'bg-foreground/20', pill: 'border-border bg-muted/30' },
  failed: { label: 'Failed', dot: 'bg-foreground/40', pill: 'border-border bg-muted/30' },
};

const channelIcons: Record<string, any> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

/* ─── Component ─────────────────────────────────────────── */

export default function Overview() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = myWorkflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in py-2">

      {/* ═══ Welcome header ═══ */}
      <div className="text-center py-8 pb-6">
        <h1 className="text-[32px] font-bold tracking-tight mb-1">
          Welcome, Ayush!
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Manage your outreach workflows — build, run and track from one place.
        </p>
      </div>

      {/* ═══ My Workflows ═══ */}
      <section className="mb-12">

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-widest">
            My Workflows
          </h2>
          <div className="flex items-center gap-2">
            {/* inline search */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 text-[11px] text-muted-foreground hover:border-foreground/20 focus-within:border-foreground/30 transition-colors cursor-text">
              <Search size={11} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter workflows…"
                className="bg-transparent outline-none w-28 text-foreground placeholder:text-muted-foreground"
              />
            </label>
            <Button
              size="sm"
              onClick={() => navigate('/workflows/new')}
              className="gap-1.5 h-7 text-[11px] font-semibold rounded-lg"
            >
              <Plus size={11} /> New
            </Button>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-[6px] text-center">
            <GitBranch size={28} className="text-muted-foreground/25 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-muted-foreground">No workflows found</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Try a different search or create a new one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((wf) => {
              const st = statusConfig[wf.status];

              return (
                <div
                  key={wf.id}
                  className="group relative flex flex-col p-4 rounded-[8px] border-2 border-border bg-card hover:border-foreground/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Status pill */}
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border-2 ${st.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      {st.label}
                    </span>

                    {/* More menu */}
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => setOpenMenu(openMenu === wf.id ? null : wf.id)}
                      >
                        <MoreHorizontal size={13} />
                      </button>
                      {openMenu === wf.id && (
                        <div className="absolute right-0 top-7 z-50 min-w-[148px] rounded-[6px] border-2 border-border bg-popover shadow-xl py-1 animate-scale-in">
                          <button
                            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] font-medium hover:bg-accent transition-colors"
                            onClick={() => { navigate(`/workflows/${wf.id}/edit`); setOpenMenu(null); }}
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button
                            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] font-medium hover:bg-accent transition-colors"
                            onClick={() => { navigate(`/workflows/${wf.id}`); setOpenMenu(null); }}
                          >
                            <ArrowUpRight size={11} /> Preview
                          </button>
                          <button className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] font-medium hover:bg-accent transition-colors">
                            <Copy size={11} /> Duplicate
                          </button>
                          <div className="h-px bg-border mx-2 my-1" />
                          <button className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workflow name */}
                  <h3 className="text-[14px] font-extrabold leading-snug mb-1.5 group-hover:text-foreground transition-colors line-clamp-2 min-h-[2.4rem]">
                    {wf.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                    {wf.description}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                    {/* Channels */}
                    <div className="flex items-center gap-1">
                      {wf.channels.map((ch) => {
                        const Icon = channelIcons[ch];
                        return Icon ? (
                          <div
                            key={ch}
                            className="h-6 w-6 rounded-[4px] border-2 border-border bg-muted flex items-center justify-center text-muted-foreground font-bold"
                          >
                            <Icon size={11} />
                          </div>
                        ) : null;
                      })}
                      <span className="text-[10px] text-muted-foreground ml-1 font-medium">
                        {wf.nodes} nodes
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock size={9} />
                      {wf.lastRun}
                    </div>
                  </div>

                  {/* Stats strip */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: 'Leads', value: wf.leads.toLocaleString() },
                      { label: 'Sent', value: wf.sent.toLocaleString() },
                      { label: 'Replies', value: wf.replied.toLocaleString() },
                    ].map((s) => (
                      <div key={s.label} className="bg-muted/50 rounded-[5px] px-2 py-1.5 text-center border-2 border-border">
                        <div className="text-[14px] font-extrabold">{s.value}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Hover CTA overlay hint */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border-2 border-border rounded-[4px] px-2.5 py-1 shadow-sm">
                      <Edit3 size={9} /> Open Editor
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ Divider ═══ */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-0.5 bg-border" />
        <span className="text-[11px] text-muted-foreground font-medium">or start from a template</span>
        <div className="flex-1 h-0.5 bg-border" />
      </div>

      {/* ═══ Templates ═══ */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold text-foreground uppercase tracking-widest">
            Start with a template
          </h2>
          <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            See all templates <ArrowUpRight size={11} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => navigate(`/workflows/${tpl.id}`)}
              className="group text-left p-4 rounded-[8px] border-2 border-border bg-card hover:border-foreground/50 hover:shadow-md transition-all duration-200"
            >
              {/* Name */}
              <h3 className="text-[13px] font-extrabold leading-snug mb-3 group-hover:text-foreground transition-colors line-clamp-2 min-h-[2.5rem]">
                {tpl.name}
              </h3>

              {/* Author + verified */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
                {tpl.verified ? <Sparkles size={10} /> : <Users size={10} />}
                <span>{tpl.author}</span>
                {tpl.verified && (
                  <>
                    <span>·</span>
                    <CheckCircle2 size={10} />
                    <span>Verified</span>
                  </>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={9} /> {tpl.setupTime} setup
                </span>
                <div className="flex items-center gap-1">
                  {tpl.channels.map((ch) => {
                    const Icon = channelIcons[ch];
                    return Icon ? (
                      <div
                        key={ch}
                        className="h-6 w-6 rounded-md border border-border bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <Icon size={11} />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </button>
          ))}

          {/* Start from scratch */}
          <button
            onClick={() => navigate('/workflows/new')}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-foreground/30 hover:bg-accent/20 transition-all duration-200 min-h-[148px]"
          >
            <div className="h-10 w-10 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground transition-colors">
              <FilePlus2 size={18} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                Start from scratch
              </div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">Blank canvas</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
