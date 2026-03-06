import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus2,
  Clock,
  Mail,
  Linkedin,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Users,
  Search,
  Star,
  GitBranch,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Data ──────────────────────────────────────────────── */

const categories = ['All', 'Cold Outreach', 'AI', 'Multi-channel', 'Re-engagement', 'WhatsApp', 'LinkedIn', 'Events'];

const templates = [
  {
    id: 'tpl-001',
    name: 'Cold email sequence with AI personalization',
    description: 'Let GPT craft a unique intro for every lead using their company info, role, and recent news. Includes smart reply detection and follow-up branching.',
    author: 'OutflowAI',
    verified: true,
    setupTime: '5 min',
    nodes: 9,
    stars: 1240,
    channels: ['email'],
    tags: ['Cold Outreach', 'AI'],
  },
  {
    id: 'tpl-002',
    name: 'LinkedIn connection + email follow-up combo',
    description: 'Send a LinkedIn connection request first, then follow up with a personalised email if they accept. Full multi-channel orchestration.',
    author: 'Community',
    verified: true,
    setupTime: '8 min',
    nodes: 7,
    stars: 873,
    channels: ['linkedin', 'email'],
    tags: ['Multi-channel', 'LinkedIn'],
  },
  {
    id: 'tpl-003',
    name: 'Automated Gmail classification & response with GPT',
    description: 'Automatically classify incoming emails, generate context-aware replies using GPT, and trigger WhatsApp alerts for high-priority leads.',
    author: 'OutflowAI',
    verified: true,
    setupTime: '11 min',
    nodes: 12,
    stars: 2100,
    channels: ['email', 'whatsapp'],
    tags: ['AI', 'Cold Outreach'],
  },
  {
    id: 'tpl-004',
    name: 'Event follow-up with smart delay & reply detection',
    description: 'Post-event email sequence with randomised delays to mimic human sending patterns. Branches based on reply status within 48h.',
    author: 'Community',
    verified: false,
    setupTime: '6 min',
    nodes: 6,
    stars: 541,
    channels: ['email'],
    tags: ['Events', 'Cold Outreach'],
  },
  {
    id: 'tpl-005',
    name: 'WhatsApp outreach with AI conversation agent',
    description: 'Deploy an AI conversation agent over WhatsApp to qualify leads, answer FAQs, and book meetings — all fully automated.',
    author: 'OutflowAI',
    verified: true,
    setupTime: '14 min',
    nodes: 8,
    stars: 1880,
    channels: ['whatsapp'],
    tags: ['WhatsApp', 'AI'],
  },
  {
    id: 'tpl-006',
    name: 'Multi-channel re-engagement for dormant leads',
    description: 'Re-ignite relationships with leads that went cold 90+ days ago using a coordinated email and LinkedIn outreach sequence.',
    author: 'Community',
    verified: true,
    setupTime: '10 min',
    nodes: 8,
    stars: 720,
    channels: ['email', 'linkedin'],
    tags: ['Re-engagement', 'Multi-channel'],
  },
  {
    id: 'tpl-007',
    name: 'Investor update newsletter with CRM sync',
    description: 'Batch send investor updates, track open rates, and automatically sync engagement data back to your CRM for follow-up prioritisation.',
    author: 'OutflowAI',
    verified: true,
    setupTime: '7 min',
    nodes: 5,
    stars: 618,
    channels: ['email'],
    tags: ['Cold Outreach'],
  },
  {
    id: 'tpl-008',
    name: 'LinkedIn warm intro sequence for VC founders',
    description: 'Identify mutual connections, craft a warm intro message leveraging shared context, and chain follow-ups with a 3-day smart delay.',
    author: 'Community',
    verified: false,
    setupTime: '9 min',
    nodes: 7,
    stars: 490,
    channels: ['linkedin'],
    tags: ['LinkedIn', 'Cold Outreach'],
  },
  {
    id: 'tpl-009',
    name: 'WhatsApp + LinkedIn dual outreach for SaaS signups',
    description: 'Target trial users who haven\'t converted with a dual outreach sequence via WhatsApp and LinkedIn simultaneously, with AI-generated message variants.',
    author: 'OutflowAI',
    verified: true,
    setupTime: '12 min',
    nodes: 10,
    stars: 1340,
    channels: ['whatsapp', 'linkedin'],
    tags: ['WhatsApp', 'LinkedIn', 'Multi-channel'],
  },
];

const channelIcons: Record<string, any> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

/* ─── Component ─────────────────────────────────────────── */

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dbWorkflows, setDbWorkflows] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/workflows/')
      .then((res) => res.json())
      .then((data) => {
        if (data.workflows) {
          const mapped = data.workflows.map((wf: any) => ({
            id: wf.id,
            name: wf.name || 'Untitled Workflow',
            description: 'Custom workflow created from the editor.',
            author: 'You',
            verified: false,
            setupTime: '0 min',
            nodes: wf.flow_data?.nodes?.length || 0,
            stars: 0,
            channels: ['email'],
            tags: ['Custom'],
          }));
          setDbWorkflows(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const allTemplates = [...dbWorkflows, ...templates];

  const filtered = allTemplates.filter((t: any) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === 'All' || t.tags.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-5xl mx-auto animate-fade-in py-2">

      {/* ═══ Header ═══ */}
      <div className="flex items-end justify-between pt-2 pb-6">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em] mb-1.5">
            OutflowAI • Workflows
          </p>
          <h1 className="text-[28px] font-black tracking-tight leading-none">Choose a template</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">
            Pick a pre-built workflow or start with a blank canvas.
          </p>
        </div>

        {/* Start from scratch — always visible at top-right */}
        <Button
          variant="outline"
          onClick={() => navigate('/workflows/new')}
          className="gap-2 h-9 text-[13px] font-semibold rounded-[6px] border-dashed shrink-0"
        >
          <FilePlus2 size={14} />
          Start from scratch
        </Button>
      </div>

      {/* ═══ Search + filter bar ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Search */}
        <label className="flex items-center gap-2 px-3 py-2 rounded-[6px] border-2 border-border bg-background text-[12px] text-muted-foreground hover:border-foreground/40 focus-within:border-foreground/60 transition-colors cursor-text w-full sm:w-64">
          <Search size={12} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
          />
        </label>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-[4px] border-2 transition-all duration-150 ${activeCategory === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Template grid ═══ */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-[6px] text-center">
          <GitBranch size={28} className="text-muted-foreground/20 mb-3" strokeWidth={1} />
          <p className="text-sm font-semibold text-muted-foreground">No templates found</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => navigate(`/workflows/${tpl.id}`)}
              className="group text-left flex flex-col p-4 rounded-[8px] border-2 border-border bg-card hover:border-foreground/50 hover:shadow-lg transition-all duration-200"
            >
              {/* Channel icons + star count */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  {tpl.channels.map((ch) => {
                    const Icon = channelIcons[ch];
                    return Icon ? (
                      <div
                        key={ch}
                        className="h-[28px] w-[28px] rounded-[5px] border-2 border-border bg-muted flex items-center justify-center text-foreground"
                      >
                        <Icon size={12} />
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Star size={9} />
                  {tpl.stars.toLocaleString()}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-[13px] font-extrabold leading-snug mb-2 group-hover:text-foreground transition-colors line-clamp-2 min-h-[2.4rem]">
                {tpl.name}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                {tpl.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  {tpl.verified ? <Sparkles size={10} /> : <Users size={10} />}
                  <span className="font-medium">{tpl.author}</span>
                  {tpl.verified && (
                    <>
                      <span className="text-border">·</span>
                      <CheckCircle2 size={9} />
                      <span>Verified</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={9} /> {tpl.setupTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch size={9} /> {tpl.nodes}
                  </span>
                </div>
              </div>

              {/* Hover CTA */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={11} />
                Use template
              </div>
            </button>
          ))}

          {/* Start from scratch card at end */}
          {/* <button
            onClick={() => navigate('/workflows/new')}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-[8px] border border-dashed border-border hover:border-foreground/30 hover:bg-accent/20 transition-all duration-200 min-h-[200px]"
          >
            <div className="h-11 w-11 rounded-[8px] border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground transition-colors">
              <FilePlus2 size={19} strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                Start from scratch
              </div>
              <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                Blank canvas, your rules
              </div>
            </div>
          </button> */}
        </div>
      )}

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}
