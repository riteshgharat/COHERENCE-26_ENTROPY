import { useState } from 'react';
import {
  Mail,
  Linkedin,
  MessageCircle,
  Twitter,
  CheckCircle2,
  Circle,
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
  QrCode,
  Key,
  MoreHorizontal,
  Unplug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const channels = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails via Google Workspace. OAuth 2.0 connection — zero password storage.',
    icon: Mail,
    connected: true,
    account: 'team@outflowai.com',
    method: 'OAuth 2.0',
    methodIcon: Shield,
    stats: [
      { label: 'Sent', value: '8,420' },
      { label: 'Delivered', value: '8,312' },
      { label: 'Bounced', value: '108' },
    ],
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Microsoft 365 email integration for enterprise-grade sending.',
    icon: Mail,
    connected: false,
    account: null,
    method: 'OAuth 2.0',
    methodIcon: Shield,
    stats: null,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Send connection requests and DMs at scale via session cookie.',
    icon: Linkedin,
    connected: true,
    account: 'Ayush Choudhar',
    method: 'Session Cookie',
    methodIcon: Key,
    stats: [
      { label: 'Sent', value: '1,240' },
      { label: 'Accepted', value: '680' },
      { label: 'Replied', value: '342' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'WhatsApp Business API integration — scan QR to connect your number.',
    icon: MessageCircle,
    connected: false,
    account: null,
    method: 'QR Code',
    methodIcon: QrCode,
    stats: null,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Send direct messages and engage with leads on X/Twitter.',
    icon: Twitter,
    connected: false,
    account: null,
    method: 'OAuth 2.0',
    methodIcon: Shield,
    stats: null,
  },
];

export default function Channels() {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (channelId: string) => {
    setConnecting(channelId);
    setTimeout(() => setConnecting(null), 2000);
  };

  const connected = channels.filter((c) => c.connected).length;
  const available = channels.filter((c) => !c.connected).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="pb-6 pt-1">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em] mb-1.5">
          OutflowAI • Channels
        </p>
        <h1 className="text-[26px] font-black tracking-tight leading-none">Connected Channels</h1>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          Manage your outreach channel integrations
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Zap, label: 'Connected', value: connected },
          { icon: Circle, label: 'Available', value: available },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 p-4 rounded-[8px] border-2 border-border bg-card">
            <div className="h-10 w-10 rounded-[7px] border-2 border-border bg-muted flex items-center justify-center shrink-0">
              <s.icon size={17} strokeWidth={1.6} />
            </div>
            <div>
              <div className="text-[26px] font-black leading-none">{s.value}</div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{s.label} Channels</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Channel list ── */}
      <div className="space-y-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="rounded-[8px] border-2 border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row">

              {/* Left — info */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-11 w-11 rounded-[8px] border-2 border-border bg-muted flex items-center justify-center text-foreground shrink-0">
                      <channel.icon size={20} strokeWidth={1.6} />
                    </div>

                    {/* Name + details */}
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-[14px] font-extrabold">{channel.name}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border-2 ${
                          channel.connected
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-background text-muted-foreground border-border'
                        }`}>
                          {channel.connected
                            ? <><CheckCircle2 size={8} /> Connected</>
                            : 'Not Connected'
                          }
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-2 leading-relaxed max-w-sm">
                        {channel.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-border bg-muted/50">
                          <channel.methodIcon size={10} strokeWidth={1.6} />
                          <span className="font-semibold">{channel.method}</span>
                        </div>
                        {channel.account && (
                          <span className="font-semibold text-foreground">· {channel.account}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  {channel.connected && (
                    <button className="h-7 w-7 flex items-center justify-center rounded-[5px] border-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
                      <MoreHorizontal size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right — stats or CTA */}
              {channel.connected && channel.stats ? (
                <div className="md:border-l-2 border-t-2 md:border-t-0 border-border bg-muted/30 md:w-56 p-5 flex flex-col justify-center">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Stats</div>
                  <div className="grid grid-cols-3 gap-3">
                    {channel.stats.map((s) => (
                      <div key={s.label} className="text-center rounded-[5px] border-2 border-border bg-background px-2 py-2">
                        <div className="text-[15px] font-extrabold leading-none">{s.value}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                    <Unplug size={11} /> Disconnect
                  </button>
                </div>
              ) : (
                <div className="md:border-l-2 border-t-2 md:border-t-0 border-border md:w-56 p-5 flex items-center justify-center bg-muted/10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-[6px] text-[12px] font-bold border-2 border-border hover:border-foreground/40 h-9 w-full"
                    disabled={connecting === channel.id}
                    onClick={() => handleConnect(channel.id)}
                  >
                    {connecting === channel.id ? (
                      <><RefreshCw size={12} className="animate-spin" /> Connecting…</>
                    ) : (
                      <><ExternalLink size={12} /> Connect {channel.name}</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
