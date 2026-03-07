import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import {
  Upload,
  Search,
  Filter,
  Download,
  Mail,
  Linkedin,
  Phone,
  MapPin,
  Building2,
  FileSpreadsheet,
  Check,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// The static `leads` array is replaced by a state variable in the component.

const statusConfig = {
  new: { label: 'New', variant: 'secondary' as const, icon: Clock },
  contacted: { label: 'Contacted', variant: 'outline' as const, icon: Mail },
  engaged: { label: 'Engaged', variant: 'default' as const, icon: Check },
  bounced: { label: 'Bounced', variant: 'destructive' as const, icon: XCircle },
};

export default function Leads() {
  const [leads, setLeads] = useState<Record<string, any>[]>([]);
  const [stats, setStats] = useState([
    { label: 'Total Leads', value: '0' },
    { label: 'New Today', value: '0' },
    { label: 'Engaged', value: '0' },
    { label: 'Bounced', value: '0' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [storeInDb, setStoreInDb] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/leads/`);
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
        const total = data.leads.length;
        const engaged = data.leads.filter((l: any) => ['replied', 'interested', 'converted'].includes(l.status)).length;
        const bounced = data.leads.filter((l: any) => l.status === 'not_interested' || l.status === 'bounced').length;
        const newLeads = data.leads.filter((l: any) => l.status === 'new').length;
        setStats([
          { label: 'Total Leads', value: total.toLocaleString() },
          { label: 'New', value: newLeads.toLocaleString() },
          { label: 'Engaged', value: engaged.toLocaleString() },
          { label: 'Bounced', value: bounced.toLocaleString() },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/leads/${id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      fetchLeads();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (storeInDb) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/v1/leads/import`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Import failed');
        alert(`Imported ${data.total_imported} leads, skipped ${data.total_skipped}`);
        fetchLeads();
      } else {
        // Simple frontend CSV parsing
        const text = await file.text();
        const rows = text.split('\n').filter(r => r.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        const newLeads = rows.slice(1).map((row, idx) => {
          const values = row.split(',');
          const lead: any = { id: `temp-${Date.now()}-${idx}`, status: 'new' };
          headers.forEach((header, i) => {
            lead[header] = values[i]?.trim();
          });
          return lead;
        });
        setLeads(prev => [...prev, ...newLeads]);
        alert(`Parsed ${newLeads.length} leads in browser only.`);
      }
      setShowUpload(false);
    } catch (err: any) {
      alert('Import failed: ' + (err.message || err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [leadMessages, setLeadMessages] = useState<Record<string, any[]>>({});

  const fetchMessages = async (leadId: string) => {
    if (leadMessages[leadId]) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/leads/${leadId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setLeadMessages((prev) => ({ ...prev, [leadId]: data.messages || [] }));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const toggleExpand = (leadId: string) => {
    if (expandedLead === leadId) {
      setExpandedLead(null);
    } else {
      setExpandedLead(leadId);
      fetchMessages(leadId);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.industry || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          <div
            className="mx-6 mb-4 p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 text-center animate-fade-in"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file && fileInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInputRef.current.files = dt.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.json" className="hidden" onChange={handleFileUpload} />
            <FileSpreadsheet size={28} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Drag & drop your file here'}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Supports CSV, Excel, and JSON formats</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="checkbox"
                id="storeInDb"
                checked={storeInDb}
                onChange={(e) => setStoreInDb(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="storeInDb" className="text-xs font-medium cursor-pointer">
                Store imported leads in Database
              </label>
            </div>

            <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Browse Files'}
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
                  const statusKey = (lead.status === 'replied' || lead.status === 'interested' || lead.status === 'converted' ? 'engaged' : lead.status === 'contacted' ? 'contacted' : lead.status === 'not_interested' ? 'bounced' : 'new') as keyof typeof statusConfig;
                  const status = statusConfig[statusKey] || statusConfig.new;
                  const isInterested = lead.status === 'interested';
                  const isEngaged = statusKey === 'engaged';
                  const isExpanded = expandedLead === lead.id;
                  const messages = leadMessages[lead.id] || [];
                  return (
                    <React.Fragment key={lead.id}>
                    <tr className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors group ${isInterested ? 'bg-yellow-100/50 dark:bg-yellow-900/20' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {lead.name ? lead.name.split(' ').map((w: string) => w[0]).join('') : '?'}
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
                        <div className="flex items-center gap-1">
                          {isEngaged && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md opacity-60 hover:opacity-100 text-primary"
                              onClick={() => toggleExpand(lead.id)}
                              title="View messages"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <MessageSquare size={14} />}
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
                            onClick={() => handleDelete(lead.id)}
                            title="Delete Lead"
                          >
                            <XCircle size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isEngaged && isExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <MessageSquare size={12} /> Message Summary
                          </div>
                          {messages.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">No messages yet</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {messages.map((msg: any) => (
                                <div key={msg.id} className="flex gap-2 text-[11px] p-2 rounded-lg bg-card border border-border">
                                  <Badge variant="outline" className="text-[9px] h-4 shrink-0">
                                    {msg.direction === 'inbound' ? '← In' : '→ Out'}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[9px] h-4 shrink-0 capitalize">
                                    {msg.channel}
                                  </Badge>
                                  <span className="text-muted-foreground truncate flex-1">
                                    {msg.subject ? <strong>{msg.subject}: </strong> : null}
                                    {msg.body?.slice(0, 120)}{msg.body?.length > 120 ? '…' : ''}
                                  </span>
                                  <span className="text-muted-foreground/60 shrink-0">
                                    {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString() : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
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
