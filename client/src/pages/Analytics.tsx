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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const overviewStats = [
  { icon: Mail, label: 'Total Sent', value: '48,293', change: '+12.4%', up: true },
  { icon: Eye, label: 'Total Opens', value: '28,176', change: '+8.1%', up: true },
  { icon: MessageCircle, label: 'Total Replies', value: '9,847', change: '+15.3%', up: true },
  { icon: Target, label: 'Conversion Rate', value: '6.8%', change: '-0.4%', up: false },
];

const weeklyData = [
  { week: 'W1', sent: 6200, opens: 3540, replies: 1120 },
  { week: 'W2', sent: 7100, opens: 4280, replies: 1450 },
  { week: 'W3', sent: 6800, opens: 3890, replies: 1380 },
  { week: 'W4', sent: 8400, opens: 5120, replies: 1890 },
  { week: 'W5', sent: 7600, opens: 4560, replies: 1620 },
  { week: 'W6', sent: 9200, opens: 5780, replies: 2180 },
  { week: 'W7', sent: 8100, opens: 4890, replies: 1720 },
  { week: 'W8', sent: 9800, opens: 6120, replies: 2340 },
];

const channelData = [
  { name: 'Email', value: 62, color: 'oklch(0.85 0 0)' },
  { name: 'LinkedIn', value: 24, color: 'oklch(0.55 0 0)' },
  { name: 'WhatsApp', value: 10, color: 'oklch(0.35 0 0)' },
  { name: 'X', value: 4, color: 'oklch(0.2 0 0)' },
];

const industryPerformance = [
  { industry: 'SaaS', replyRate: 38, leads: 3200 },
  { industry: 'Fintech', replyRate: 34, leads: 2100 },
  { industry: 'DevTools', replyRate: 31, leads: 1800 },
  { industry: 'AI/ML', replyRate: 42, leads: 1400 },
  { industry: 'E-commerce', replyRate: 22, leads: 2800 },
  { industry: 'Healthcare', replyRate: 18, leads: 900 },
];

const funnelData = [
  { stage: 'Leads', value: 12847 },
  { stage: 'Contacted', value: 9200 },
  { stage: 'Opened', value: 5800 },
  { stage: 'Replied', value: 2100 },
  { stage: 'Converted', value: 870 },
];

const bestMessages = [
  { template: 'Warm intro with company mention', opens: 78, replies: 34, score: 92 },
  { template: 'Value-first with case study', opens: 72, replies: 31, score: 88 },
  { template: 'Short & direct ask', opens: 65, replies: 28, score: 82 },
  { template: 'Mutual connection reference', opens: 81, replies: 26, score: 79 },
];

export default function Analytics() {
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Best Performing Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestMessages.map((msg, i) => (
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
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Outreach Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4 h-40">
            {funnelData.map((stage, i) => {
              const maxVal = funnelData[0].value;
              const heightPct = (stage.value / maxVal) * 100;
              return (
                <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold">{stage.value.toLocaleString()}</span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${heightPct}%`,
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
