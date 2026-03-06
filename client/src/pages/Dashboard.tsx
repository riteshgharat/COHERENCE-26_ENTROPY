import {
  Users,
  Megaphone,
  Mail,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  Zap,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const stats = [
  { icon: Users, label: 'Total Leads', value: '12,847', change: '+12.5%', up: true },
  { icon: Megaphone, label: 'Active Campaigns', value: '24', change: '+3 this week', up: true },
  { icon: Mail, label: 'Emails Sent Today', value: '1,293', change: '+8.2%', up: true },
  { icon: TrendingUp, label: 'Response Rate', value: '34.2%', change: '-2.1%', up: false },
];

const activity = [
  { id: 1, lead: 'Sarah Chen', company: 'Stripe', action: 'Intro email sent', time: '2m ago', status: 'success' as const },
  { id: 2, lead: 'Mike Johnson', company: 'Notion', action: 'Replied to follow-up', time: '8m ago', status: 'success' as const },
  { id: 3, lead: 'Emma Wilson', company: 'Figma', action: 'Opened email (3rd time)', time: '15m ago', status: 'info' as const },
  { id: 4, lead: 'Alex Rivera', company: 'Linear', action: 'Email bounced', time: '22m ago', status: 'destructive' as const },
  { id: 5, lead: 'Lisa Park', company: 'Vercel', action: 'Follow-up #2 sent', time: '35m ago', status: 'success' as const },
  { id: 6, lead: 'James Brown', company: 'Supabase', action: 'Waiting (2h delay)', time: '1h ago', status: 'warning' as const },
];

const workflows = [
  { name: 'Cold Outreach - Series A', leads: 1240, progress: 68, status: 'running' },
  { name: 'Re-engagement Campaign', leads: 856, progress: 42, status: 'running' },
  { name: 'Event Follow-up', leads: 320, progress: 91, status: 'running' },
  { name: 'LinkedIn + Email Combo', leads: 2100, progress: 15, status: 'paused' },
];

const topSegments = [
  { name: 'YC Batch W26', sent: 450, replied: 189, rate: 42 },
  { name: 'Series A Founders', sent: 320, replied: 128, rate: 40 },
  { name: 'DevTool Engineers', sent: 890, replied: 312, rate: 35 },
  { name: 'Marketing Leads', sent: 670, replied: 201, rate: 30 },
];

const chartData = [
  { name: 'Mon', sent: 240, replies: 85 },
  { name: 'Tue', sent: 320, replies: 112 },
  { name: 'Wed', sent: 280, replies: 96 },
  { name: 'Thu', sent: 450, replies: 163 },
  { name: 'Fri', sent: 380, replies: 141 },
  { name: 'Sat', sent: 120, replies: 42 },
  { name: 'Sun', sent: 90, replies: 34 },
];

const statusIcons = {
  success: CheckCircle2,
  destructive: XCircle,
  info: Mail,
  warning: Clock,
};

export default function Dashboard() {
  return (
    <div className="max-w-7xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
        </div>
        <Button className="gap-2 rounded-xl shadow-sm">
          <Play size={14} />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="group hover:shadow-md transition-all duration-300 cursor-default overflow-hidden relative">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted text-foreground">
                  <s.icon size={18} />
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${s.up ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Outreach Performance</CardTitle>
              <Badge variant="outline" className="text-[10px] font-medium">This Week</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.45 0 0)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.45 0 0)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="replyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.12 0 0)',
                    border: '1px solid oklch(0.2 0 0)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="sent" stroke="oklch(0.65 0 0)" fill="url(#sentGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="replies" stroke="oklch(0.65 0.18 155)" fill="url(#replyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-6 rounded-full bg-foreground/40" />
                Sent
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-6 rounded-full bg-success" />
                Replies
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Live Activity</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-semibold text-success">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activity.slice(0, 5).map((a) => {
              const Icon = statusIcons[a.status];
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${
                    a.status === 'success' ? 'bg-success/10 text-success' :
                    a.status === 'destructive' ? 'bg-destructive/10 text-destructive' :
                    a.status === 'info' ? 'bg-info/10 text-info' :
                    'bg-warning/10 text-warning'
                  }`}>
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs">
                      <span className="font-semibold">{a.lead}</span>
                      <span className="text-muted-foreground"> · {a.company}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{a.action}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflows.map((w) => (
              <div key={w.name} className="p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <GitBranch size={13} className="text-foreground/60" />
                  <span className="text-sm font-semibold">{w.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {w.leads.toLocaleString()} leads ·{' '}
                  <Badge variant={w.status === 'running' ? 'default' : 'secondary'} className="text-[10px] h-5">
                    {w.status === 'running' && <Zap size={8} />}
                    {w.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{w.progress}%</span>
                </div>
                <Progress value={w.progress} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Top Performing Segments</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Segment</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sent</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Replies</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topSegments.map((t) => (
                    <tr key={t.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium">{t.name}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{t.sent}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{t.replied}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={t.rate} className="w-16 h-1.5" />
                          <span className="text-xs font-semibold">{t.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
