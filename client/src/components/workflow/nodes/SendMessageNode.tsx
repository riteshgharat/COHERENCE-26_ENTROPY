import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail, Linkedin, MessageCircle, Twitter } from 'lucide-react';

const channelConfig: Record<string, { icon: any; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  linkedin: { icon: Linkedin, label: 'LinkedIn' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  twitter: { icon: Twitter, label: 'X (Twitter)' },
};

export default function SendMessageNode({ data, selected }: NodeProps) {
  const channel = (data as any).channel || 'email';
  const config = channelConfig[channel] || channelConfig.email;
  const Icon = config.icon;

  return (
    <div className={`relative bg-card border rounded-lg shadow-sm min-w-[200px] transition-all duration-150 ${selected ? 'ring-2 ring-ring ring-offset-1 ring-offset-background border-foreground/20' : 'border-border hover:border-foreground/10'}`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background" />
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="h-5 w-5 flex items-center justify-center rounded bg-accent text-foreground/70">
          <Icon size={11} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Send · {config.label}</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-[12px] font-medium">{(data as any).label || `Send ${config.label}`}</div>
        {(data as any).subject && (
          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{(data as any).subject}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background" />
    </div>
  );
}
