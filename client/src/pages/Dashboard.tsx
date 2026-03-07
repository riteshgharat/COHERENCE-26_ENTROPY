import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
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

const defaultStats = [
  { icon: Users, label: 'Total Leads', value: '0', change: '', up: true },
  { icon: Megaphone, label: 'Active Campaigns', value: '0', change: '', up: true },
  { icon: Mail, label: 'Messages Sent', value: '0', change: '', up: true },
  { icon: TrendingUp, label: 'Response Rate', value: '0%', change: '', up: true },
];

const statusIcons = {
  success: CheckCircle2,
  destructive: XCircle,
  info: Mail,
  warning: Clock,
};

export default function Dashboard() {
  const [displayStats, setDisplayStats] = useState(defaultStats);
  const [activity, setActivity] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<any>({});

  useEffect(() => {
    fetch(`${API_URL}/api/v1/analytics/dashboard`)
      .then(res => res.json())
      .then(data => {
        setDisplayStats([
          { icon: Users, label: 'Total Leads', value: (data.leads ?? 0).toLocaleString(), change: '', up: true },
          { icon: Megaphone, label: 'Active Campaigns', value: (data.total_executions ?? 0).toLocaleString(), change: '', up: true },
          { icon: Mail, label: 'Messages Sent', value: (data.messages_sent ?? 0).toLocaleString(), change: '', up: true },
          { icon: TrendingUp, label: 'Response Rate', value: `${data.conversion_rate ?? 0}%`, change: data.replies ? `${data.replies} replies` : '', up: (data.conversion_rate ?? 0) > 0 },
        ]);
        if (data.recent_activity) setActivity(data.recent_activity);
        if (data.active_campaigns) setWorkflows(data.active_campaigns);
        if (data.daily_chart) setChartData(data.daily_chart);
        if (data.channel_performance) setChannelPerformance(data.channel_performance);
      })
      .catch(console.error);
  }, []);

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
        {displayStats.map((s) => (
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
                    <stop offset="5%" stopColor="oklch(0.45 0 0)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.45 0 0)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="replyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0} />
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
            {activity.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-muted-foreground">No recent activity yet</div>
            ) : (
            activity.slice(0, 5).map((a) => {
              const Icon = statusIcons[a.status as keyof typeof statusIcons] || Mail;
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${a.status === 'success' ? 'bg-success/10 text-success' :
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
            })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">No active campaigns</div>
            ) : (
            workflows.map((w) => (
              <div key={w.name} className="p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <GitBranch size={13} className="text-foreground/60" />
                  <span className="text-sm font-semibold">{w.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {(w.leads ?? 0).toLocaleString()} leads ·{' '}
                  <Badge variant={w.status === 'running' ? 'default' : 'secondary'} className="text-[10px] h-5">
                    {w.status === 'running' && <Zap size={8} />}
                    {w.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{w.progress ?? 0}%</span>
                </div>
                <Progress value={w.progress ?? 0} />
              </div>
            ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Channel Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sent</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Replies</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(channelPerformance).length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-xs text-muted-foreground">No channel data yet</td></tr>
                  ) : (
                  Object.entries(channelPerformance).map(([ch, data]: [string, any]) => {
                    const sent = data.sent ?? 0;
                    const replied = data.replied ?? 0;
                    const rate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
                    return (
                      <tr key={ch} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium capitalize">{ch}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{sent}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{replied}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={rate} className="w-16 h-1.5" />
                            <span className="text-xs font-semibold">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
