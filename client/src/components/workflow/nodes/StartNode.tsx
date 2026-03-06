import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default function StartNode({ selected }: { selected?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-150 ${selected ? 'ring-2 ring-ring ring-offset-1 ring-offset-background border-foreground/20' : 'border-border hover:border-foreground/10'}`}>
      <div className="h-5 w-5 rounded flex items-center justify-center bg-foreground text-background">
        <Play size={10} />
      </div>
      <span className="text-[12px] font-semibold">Start</span>
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background" />
    </div>
  );
}
