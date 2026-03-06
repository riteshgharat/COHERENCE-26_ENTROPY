import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default function ReplyCheckNode({ data, selected }: NodeProps) {
  return (
    <div className={`relative bg-card border rounded-lg shadow-sm min-w-[200px] transition-all duration-150 ${selected ? 'ring-2 ring-ring ring-offset-1 ring-offset-background border-foreground/20' : 'border-border hover:border-foreground/10'}`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background" />
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="h-5 w-5 flex items-center justify-center rounded bg-accent text-foreground/70">
          <GitBranch size={11} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reply Check</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-[12px] font-medium">{(data as any).label || 'Check Reply'}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent text-foreground/70">Yes</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent text-foreground/70">No</span>
        </div>
      </div>
      <Handle type="source" id="yes" position={Position.Right} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background !top-[70%]" />
      <Handle type="source" id="no" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background" />
    </div>
  );
}
