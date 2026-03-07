import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import {
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  Mail,
  Linkedin,
  MessageCircle,
  Users,
  Clock,
  Search,
  ArrowUpRight,
  Zap,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CampaignData {
  id: string;
  name: string;
  workflow_id: string;
  status: string;
  leads_total: number;
  messages_sent: number;
  messages_opened: number;
  replies_count: number;
  progress: number;
  reply_rate: number;
  created_at: string;
  updated_at: string;
}

const channelIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  running: { label: 'Running', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  draft: { label: 'Draft', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [workflows, setWorkflows] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');

  useEffect(() => {
    fetchCampaigns();
    fetch(`${API_URL}/api/v1/workflows/`)
      .then((r) => r.json())
      .then((d) => setWorkflows(d.workflows || []))
      .catch(console.error);
  }, []);

  const fetchCampaigns = () => {
    fetch(`${API_URL}/api/v1/campaigns/`)
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns || []))
      .catch(console.error);
  };

  const handleCreate = async () => {
    if (!newName || !selectedWorkflow) return;
    try {
      await fetch(`${API_URL}/api/v1/campaigns/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, workflow_id: selectedWorkflow }),
      });
      setShowCreate(false);
      setNewName('');
      setSelectedWorkflow('');
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/campaigns/${id}/start`, {
        method: 'POST',
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/campaigns/${id}/pause`, {
        method: 'POST',
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9 h-8 text-xs rounded-xl"
            />
          </div>
        </div>
        <Button size="sm" className="gap-2 rounded-xl text-xs" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Campaign
        </Button>
      </div>

      {/* Create Campaign Dialog */}
      {showCreate && (
        <Card className="border-2 border-primary/30 animate-fade-in">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Create New Campaign</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreate(false)}>
                <X size={14} />
              </Button>
            </div>
            <div className="grid gap-3">
              <Input
                placeholder="Campaign name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-sm"
              />
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Select a workflow…</option>
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleCreate} disabled={!newName || !selectedWorkflow}>
                <Zap size={12} className="mr-1.5" /> Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No campaigns yet. Create one to get started!
          </div>
        )}
        {filtered.map((campaign) => {
          const st = statusLabels[campaign.status] || statusLabels.draft;
          return (
            <Card key={campaign.id} className="group hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold">{campaign.name}</h3>
                          <Badge variant={st.variant} className="text-[10px] h-5 gap-1">
                            {campaign.status === 'running' && <Zap size={8} />}
                            {st.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            {timeAgo(campaign.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={11} />
                            {campaign.leads_total.toLocaleString()} leads
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {campaign.status === 'running' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handlePause(campaign.id)}>
                            <Pause size={13} />
                          </Button>
                        ) : campaign.status !== 'completed' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleStart(campaign.id)}>
                            <Play size={13} />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                          <MoreHorizontal size={13} />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-1.5" />
                    </div>
                  </div>

                  <div className="lg:border-l border-t lg:border-t-0 border-border lg:w-72 p-5 bg-muted/20 grid grid-cols-4 lg:grid-cols-2 gap-3">
                    <div>
                      <div className="text-lg font-extrabold">{campaign.messages_sent}</div>
                      <div className="text-[10px] text-muted-foreground">Sent</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold">{campaign.messages_opened}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Eye size={9} /> Opened
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold">{campaign.replies_count}</div>
                      <div className="text-[10px] text-muted-foreground">Replies</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold flex items-center gap-1">
                        {campaign.reply_rate}%
                        {campaign.reply_rate > 15 && <ArrowUpRight size={12} className="text-success" />}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Reply Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
