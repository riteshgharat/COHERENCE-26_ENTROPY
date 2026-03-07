import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Mail,
  Eye,
  MessageCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CHANNEL_COLORS: Record<string, string> = {
  email: 'oklch(0.85 0 0)',
  linkedin: 'oklch(0.55 0 0)',
  whatsapp: 'oklch(0.35 0 0)',
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/analytics/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  const sent = stats?.messages_sent ?? 0;
  const replies = stats?.replies ?? 0;
  const convRate = stats?.conversion_rate ?? 0;
  const leads = stats?.leads ?? 0;

  const overviewStats = [
    { icon: Mail, label: 'Total Sent', value: sent.toLocaleString(), change: sent > 0 ? `+${sent}` : '0', up: sent > 0 },
    { icon: Eye, label: 'Total Leads', value: leads.toLocaleString(), change: leads > 0 ? `+${leads}` : '0', up: leads > 0 },
    { icon: MessageCircle, label: 'Total Replies', value: replies.toLocaleString(), change: replies > 0 ? `+${replies}` : '0', up: replies > 0 },
    { icon: Target, label: 'Response Rate', value: `${convRate}%`, change: convRate > 0 ? `+${convRate}%` : '0%', up: convRate > 0 },
  ];

  const weeklyData = stats?.weekly_chart?.length
    ? stats.weekly_chart
    : Array.from({ length: 8 }, (_, i) => ({ week: `W${i + 1}`, sent: 0, opens: 0, replies: 0 }));

  // Channel distribution from real data
  const channelPerf = stats?.channel_performance || {};
  const channelEntries = Object.entries(channelPerf);
  const totalChannelMsgs = channelEntries.reduce((s: number, [, v]: any) => s + (v.sent || 0) + (v.replied || 0) + (v.pending || 0), 0) || 1;
  const channelData = channelEntries.length > 0
    ? channelEntries.map(([name, v]: any) => {
        const total = (v.sent || 0) + (v.replied || 0) + (v.pending || 0);
        return { name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round((total / totalChannelMsgs) * 100), color: CHANNEL_COLORS[name] || 'oklch(0.6 0 0)' };
      })
    : [{ name: 'Email', value: 60, color: 'oklch(0.85 0 0)' }, { name: 'LinkedIn', value: 25, color: 'oklch(0.55 0 0)' }, { name: 'WhatsApp', value: 15, color: 'oklch(0.35 0 0)' }];

  const industryPerformance = stats?.industry_breakdown ?? [];
  const funnelData = stats?.funnel?.length
    ? stats.funnel
    : [{ stage: 'Leads', value: leads }, { stage: 'Contacted', value: 0 }, { stage: 'Opened', value: 0 }, { stage: 'Replied', value: replies }, { stage: 'Converted', value: 0 }];
  const bestMessages = stats?.best_messages ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overviewStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <s.icon size={18} />
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${s.up ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Weekly Outreach Trend</CardTitle>
              <Badge variant="outline" className="text-[10px]">Last 8 Weeks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.12 0 0)',
                    border: '1px solid oklch(0.2 0 0)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sent" fill="oklch(0.75 0 0)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opens" fill="oklch(0.5 0 0)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" fill="oklch(0.25 0 0)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-2"><div className="h-2 w-6 rounded-full" style={{ background: 'oklch(0.75 0 0)' }} /> Sent</div>
              <div className="flex items-center gap-2"><div className="h-2 w-6 rounded-full" style={{ background: 'oklch(0.5 0 0)' }} /> Opens</div>
              <div className="flex items-center gap-2"><div className="h-2 w-6 rounded-full" style={{ background: 'oklch(0.25 0 0)' }} /> Replies</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {channelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.12 0 0)',
                    border: '1px solid oklch(0.2 0 0)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
              {channelData.map((ch) => (
                <div key={ch.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ch.color }} />
                  <span className="text-muted-foreground">{ch.name}</span>
                  <span className="font-semibold ml-auto">{ch.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Industry Reply Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {industryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={industryPerformance} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" unit="%" />
                  <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} stroke="oklch(0.55 0 0)" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.12 0 0)',
                      border: '1px solid oklch(0.2 0 0)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="replyRate" fill="oklch(0.45 0 0)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                Import leads with industry data to see reply rates
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Best Performing Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestMessages.length > 0 ? bestMessages.map((msg: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{msg.template}</span>
                  <Badge variant="outline" className="text-[10px]">Score: {msg.score}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={10} /> {msg.opens}% open</span>
                  <span className="flex items-center gap-1"><MessageCircle size={10} /> {msg.replies}% reply</span>
                </div>
              </div>
            )) : (
              <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                Send messages to see performance data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Outreach Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4 h-40">
            {funnelData.map((stage: any, i: number) => {
              const maxVal = Math.max(...funnelData.map((s: any) => s.value), 1);
              const heightPct = (stage.value / maxVal) * 100;
              return (
                <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold">{stage.value.toLocaleString()}</span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPct, 2)}%`,
                      background: `oklch(${0.85 - (i * 0.15)} 0 0)`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{stage.stage}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
