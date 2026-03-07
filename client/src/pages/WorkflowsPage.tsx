import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/api';
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
  UserPlus,
  LogIn,
  Copy,
  Check,
  X,
  Crown,
  Loader2,
  LogOut,
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

const API = API_URL;

interface CollabMember {
  id: string;
  username: string;
  color: string;
  is_online: boolean;
}

interface CollabSessionInfo {
  id: string;
  workflow_id: string;
  name: string;
  invite_code: string;
  created_by: string;
  is_active: boolean;
  members: CollabMember[];
}

/* ─── Component ─────────────────────────────────────────── */

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dbWorkflows, setDbWorkflows] = useState<any[]>([]);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabTab, setCollabTab] = useState<'create' | 'join'>('join');
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabError, setCollabError] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [activeSessions, setActiveSessions] = useState<CollabSessionInfo[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const collabUsername = (() => {
    let name = sessionStorage.getItem('collab-username');
    if (!name) {
      name = `User-${Math.random().toString(36).slice(2, 6)}`;
      sessionStorage.setItem('collab-username', name);
    }
    return name;
  })();

  useEffect(() => {
    fetch(`${API_URL}/api/v1/workflows/`)
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

  // Fetch all active collab sessions when modal opens
  const fetchAllSessions = useCallback(async () => {
    try {
      // Gather sessions for each db workflow
      const allSessions: CollabSessionInfo[] = [];
      for (const wf of dbWorkflows) {
        // Skip mock IDs if they somehow ended up in dbWorkflows
        if (!wf.id || wf.id === 'edit' || wf.id.startsWith('tpl-') || wf.id.startsWith('wf-')) continue;

        const res = await fetch(`${API}/api/v1/collab/sessions/by-workflow/${wf.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.sessions) allSessions.push(...data.sessions);
        }
      }
      setActiveSessions(allSessions);
    } catch { /* silent */ }
  }, [dbWorkflows]);

  useEffect(() => {
    if (showCollabModal && dbWorkflows.length > 0) fetchAllSessions();
  }, [showCollabModal, dbWorkflows, fetchAllSessions]);

  const redirectToEditor = (workflowId: string, session: { id: string; invite_code: string; name: string }) => {
    navigate(`/workflows/${workflowId}/edit`, {
      state: { collabSession: session },
    });
  };

  const joinByInvite = async () => {
    setCollabError('');
    setCollabLoading(true);
    try {
      const lookupRes = await fetch(`${API}/api/v1/collab/join/${inviteCodeInput.trim()}`);
      if (!lookupRes.ok) throw new Error('Invalid or expired invite code');
      const session: CollabSessionInfo = await lookupRes.json();

      const joinRes = await fetch(`${API}/api/v1/collab/sessions/${session.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: collabUsername }),
      });
      if (!joinRes.ok) throw new Error('Failed to join session');
      const updatedSession = await joinRes.json();

      redirectToEditor(updatedSession.workflow_id, {
        id: updatedSession.id,
        invite_code: updatedSession.invite_code,
        name: updatedSession.name,
      });
    } catch (e: unknown) {
      setCollabError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setCollabLoading(false);
    }
  };

  const createCollabSession = async () => {
    setCollabError('');
    if (!selectedWorkflowId) {
      setCollabError('Please select a workflow first');
      return;
    }
    setCollabLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/collab/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: selectedWorkflowId,
          name: sessionName || undefined,
          username: collabUsername,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create session' }));
        throw new Error(err.detail);
      }
      const session = await res.json();
      redirectToEditor(session.workflow_id, {
        id: session.id,
        invite_code: session.invite_code,
        name: session.name,
      });
    } catch (e: unknown) {
      setCollabError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setCollabLoading(false);
    }
  };

  const joinExistingSession = async (session: CollabSessionInfo) => {
    setCollabLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/collab/sessions/${session.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: collabUsername }),
      });
      if (!res.ok) throw new Error('Failed to join');
      const updated = await res.json();
      redirectToEditor(updated.workflow_id, {
        id: updated.id,
        invite_code: updated.invite_code,
        name: updated.name,
      });
    } catch (e: unknown) {
      setCollabError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setCollabLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setShowCollabModal(true)}
            className="gap-2 h-9 text-[13px] font-semibold rounded-[6px] border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <Users size={14} />
            Join Room
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/workflows/new')}
            className="gap-2 h-9 text-[13px] font-semibold rounded-[6px] border-dashed shrink-0"
          >
            <FilePlus2 size={14} />
            Start from scratch
          </Button>
        </div>
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

      {/* ═══ Collab / Join Room Modal ═══ */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-[540px] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Users size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Join or Create a Room</h2>
                  <p className="text-[11px] text-muted-foreground">Collaborate on a workflow in real-time with your team</p>
                </div>
              </div>
              <button onClick={() => { setShowCollabModal(false); setCollabError(''); }} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => { setCollabTab('join'); setCollabError(''); }}
                className={`flex-1 text-[12px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${collabTab === 'join' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <LogIn size={12} /> Join Room
                </span>
              </button>
              <button
                onClick={() => { setCollabTab('create'); setCollabError(''); }}
                className={`flex-1 text-[12px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${collabTab === 'create' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <UserPlus size={12} /> Create Room
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {collabError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[12px] px-3 py-2 rounded-lg">
                  {collabError}
                </div>
              )}

              {/* Join tab */}
              {collabTab === 'join' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Invite Code
                    </label>
                    <input
                      value={inviteCodeInput}
                      onChange={(e) => setInviteCodeInput(e.target.value)}
                      placeholder="Paste invite code from your teammate..."
                      className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && inviteCodeInput.trim() && joinByInvite()}
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
                    <p>Joining as <span className="font-semibold text-foreground">{collabUsername}</span></p>
                    <p>You&apos;ll be redirected to the workflow editor in collab mode</p>
                  </div>

                  <Button
                    onClick={joinByInvite}
                    disabled={collabLoading || !inviteCodeInput.trim()}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {collabLoading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                    Join Room
                  </Button>
                </div>
              )}

              {/* Create tab */}
              {collabTab === 'create' && (
                <div className="space-y-4">
                  {/* Workflow selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Select Workflow
                    </label>
                    {dbWorkflows.length === 0 ? (
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-[12px] text-muted-foreground">No saved workflows found.</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">Create and save a workflow first, then start a room.</p>
                      </div>
                    ) : (
                      <div className="grid gap-1.5 max-h-[200px] overflow-y-auto">
                        {dbWorkflows.map((wf) => (
                          <button
                            key={wf.id}
                            onClick={() => setSelectedWorkflowId(wf.id)}
                            className={`text-left px-3 py-2 rounded-lg border-2 transition-all text-[12px] ${selectedWorkflowId === wf.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-foreground'
                                : 'border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            <span className="font-semibold block truncate">{wf.name}</span>
                            <span className="text-[10px] opacity-60">{wf.nodes} nodes</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Room Name (optional)
                    </label>
                    <input
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="e.g. Sprint Review Collab"
                      className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
                    <p>Creating as <span className="font-semibold text-foreground">{collabUsername}</span></p>
                    <p>An invite code will be generated for your team</p>
                  </div>

                  <Button
                    onClick={createCollabSession}
                    disabled={collabLoading || !selectedWorkflowId}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {collabLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    Create Room & Enter Editor
                  </Button>
                </div>
              )}

              {/* Active sessions */}
              {activeSessions.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    Active Rooms
                  </h3>
                  {activeSessions.map((s) => {
                    const onlineCount = s.members.filter((m) => m.is_online).length;
                    const isCreator = s.created_by === collabUsername;
                    return (
                      <div
                        key={s.id}
                        className="border border-border rounded-lg p-3 space-y-2.5 bg-background"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCreator && <Crown size={12} className="text-amber-500" />}
                            <span className="text-[12px] font-semibold text-foreground">{s.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {onlineCount} online
                          </span>
                        </div>

                        {/* Members */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {s.members.map((m) => (
                            <div
                              key={m.id}
                              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${m.is_online
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                                  : 'bg-muted border-border text-muted-foreground'
                                }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${m.is_online ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                              {m.username}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(s.invite_code)}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent border border-border"
                          >
                            {copiedCode === s.invite_code ? (
                              <><Check size={10} className="text-emerald-500" /> Copied!</>
                            ) : (
                              <><Copy size={10} /> Copy Invite</>
                            )}
                          </button>
                          <button
                            onClick={() => joinExistingSession(s)}
                            disabled={collabLoading}
                            className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 border border-blue-200 dark:border-blue-800"
                          >
                            <LogIn size={10} /> Join & Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
