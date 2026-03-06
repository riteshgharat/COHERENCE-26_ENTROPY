import { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const campaigns = [
  {
    id: 1,
    name: 'Cold Outreach — Series A Founders',
    status: 'running' as const,
    channels: ['email', 'linkedin'],
    leads: 1240,
    sent: 892,
    opened: 534,
    replied: 189,
    progress: 72,
    created: '2 days ago',
    replyRate: 21.2,
  },
  {
    id: 2,
    name: 'Re-engagement Campaign Q1',
    status: 'running' as const,
    channels: ['email'],
    leads: 856,
    sent: 360,
    opened: 180,
    replied: 62,
    progress: 42,
    created: '5 days ago',
    replyRate: 17.2,
  },
  {
    id: 3,
    name: 'Event Follow-up — TechCrunch',
    status: 'completed' as const,
    channels: ['email', 'linkedin', 'whatsapp'],
    leads: 320,
    sent: 320,
    opened: 256,
    replied: 128,
    progress: 100,
    created: '1 week ago',
    replyRate: 40.0,
  },
  {
    id: 4,
    name: 'LinkedIn + Email Combo Test',
    status: 'paused' as const,
    channels: ['email', 'linkedin'],
    leads: 2100,
    sent: 315,
    opened: 142,
    replied: 31,
    progress: 15,
    created: '3 days ago',
    replyRate: 9.8,
  },
  {
    id: 5,
    name: 'AI Developer Outreach',
    status: 'draft' as const,
    channels: ['email'],
    leads: 0,
    sent: 0,
    opened: 0,
    replied: 0,
    progress: 0,
    created: 'Just now',
    replyRate: 0,
  },
];

const channelIcons: Record<string, any> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const statusLabels: Record<string, { label: string; variant: any }> = {
  running: { label: 'Running', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  draft: { label: 'Draft', variant: 'secondary' },
};

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button size="sm" className="gap-2 rounded-xl text-xs">
          <Plus size={14} /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((campaign) => {
          const st = statusLabels[campaign.status];
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
                            {campaign.created}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={11} />
                            {campaign.leads.toLocaleString()} leads
                          </div>
                          <div className="flex items-center gap-1">
                            {campaign.channels.map((ch) => {
                              const Icon = channelIcons[ch];
                              return Icon ? <Icon key={ch} size={11} /> : null;
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {campaign.status === 'running' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                            <Pause size={13} />
                          </Button>
                        ) : campaign.status !== 'completed' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
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
                      <div className="text-lg font-extrabold">{campaign.sent}</div>
                      <div className="text-[10px] text-muted-foreground">Sent</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold">{campaign.opened}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Eye size={9} /> Opened
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold">{campaign.replied}</div>
                      <div className="text-[10px] text-muted-foreground">Replies</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold flex items-center gap-1">
                        {campaign.replyRate}%
                        {campaign.replyRate > 15 && <ArrowUpRight size={12} className="text-success" />}
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
