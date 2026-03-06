import { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Linkedin,
  Phone,
  MapPin,
  Building2,
  FileSpreadsheet,
  Check,
  Clock,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const leads = [
  { id: 1, name: 'Sarah Chen', company: 'Stripe', email: 'sarah@stripe.com', linkedin: 'sarahchen', phone: '+1-555-0101', industry: 'Fintech', location: 'San Francisco, CA', status: 'engaged' as const },
  { id: 2, name: 'Mike Johnson', company: 'Notion', email: 'mike@notion.so', linkedin: 'mikejohnson', phone: '+1-555-0102', industry: 'Productivity', location: 'New York, NY', status: 'contacted' as const },
  { id: 3, name: 'Emma Wilson', company: 'Figma', email: 'emma@figma.com', linkedin: 'emmawilson', phone: '+1-555-0103', industry: 'Design', location: 'San Francisco, CA', status: 'new' as const },
  { id: 4, name: 'Alex Rivera', company: 'Linear', email: 'alex@linear.app', linkedin: 'alexrivera', phone: '+1-555-0104', industry: 'DevTools', location: 'Remote', status: 'bounced' as const },
  { id: 5, name: 'Lisa Park', company: 'Vercel', email: 'lisa@vercel.com', linkedin: 'lisapark', phone: '+1-555-0105', industry: 'Infrastructure', location: 'San Francisco, CA', status: 'engaged' as const },
  { id: 6, name: 'James Brown', company: 'Supabase', email: 'james@supabase.io', linkedin: 'jamesbrown', phone: '+1-555-0106', industry: 'Database', location: 'Singapore', status: 'contacted' as const },
  { id: 7, name: 'Olivia Martinez', company: 'Anthropic', email: 'olivia@anthropic.com', linkedin: 'oliviamartinez', phone: '+1-555-0107', industry: 'AI', location: 'San Francisco, CA', status: 'new' as const },
  { id: 8, name: 'Daniel Kim', company: 'Retool', email: 'daniel@retool.com', linkedin: 'danielkim', phone: '+1-555-0108', industry: 'DevTools', location: 'San Francisco, CA', status: 'engaged' as const },
];

const statusConfig = {
  new: { label: 'New', variant: 'secondary' as const, icon: Clock },
  contacted: { label: 'Contacted', variant: 'outline' as const, icon: Mail },
  engaged: { label: 'Engaged', variant: 'default' as const, icon: Check },
  bounced: { label: 'Bounced', variant: 'destructive' as const, icon: XCircle },
};

const stats = [
  { label: 'Total Leads', value: '12,847' },
  { label: 'New Today', value: '148' },
  { label: 'Engaged', value: '4,291' },
  { label: 'Bounced', value: '312' },
];

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold">Lead Database</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-52 pl-9 h-8 text-xs rounded-lg"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg">
                <Filter size={12} /> Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg">
                <Download size={12} /> Export
              </Button>
              <Button size="sm" className="gap-1.5 text-xs h-8 rounded-lg" onClick={() => setShowUpload(!showUpload)}>
                <Upload size={12} /> Import
              </Button>
            </div>
          </div>
        </CardHeader>

        {showUpload && (
          <div className="mx-6 mb-4 p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 text-center animate-fade-in">
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.json" className="hidden" />
            <FileSpreadsheet size={28} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Supports CSV, Excel, and JSON formats</p>
            <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Industry</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channels</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const status = statusConfig[lead.status];
                  return (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {lead.name.split(' ').map(w => w[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{lead.name}</div>
                            <div className="text-[10px] text-muted-foreground">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 size={12} className="text-muted-foreground" />
                          {lead.company}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">{lead.industry}</td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={11} />
                          {lead.location}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={status.variant} className="text-[10px] gap-1">
                          <status.icon size={10} />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-60 hover:opacity-100">
                            <Mail size={12} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-60 hover:opacity-100">
                            <Linkedin size={12} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-60 hover:opacity-100">
                            <Phone size={12} />
                          </Button>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
