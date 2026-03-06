import { X, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNodeDefinition } from './nodeDefinitions';
import PropertyField from './PropertyField';
import type { Node } from '@xyflow/react';

interface NodePropertyPanelProps {
  node: Node | null;
  onUpdateData: (key: string, value: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function NodePropertyPanel({
  node,
  onUpdateData,
  onDelete,
  onClose,
}: NodePropertyPanelProps) {
  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
        <div className="h-10 w-10 rounded-xl border border-dashed border-border flex items-center justify-center mb-3">
          <Settings2
            size={16}
            className="text-muted-foreground/40"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[12px] font-medium text-muted-foreground">
          Select a node
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Click any node on the canvas to configure it
        </p>
      </div>
    );
  }

  const def = getNodeDefinition(node.type || '');
  const Icon = def?.icon;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-3 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {def && Icon && (
              <div
                className={`h-6 w-6 flex items-center justify-center rounded-md text-white ${def.color}`}
              >
                <Icon size={12} strokeWidth={2} />
              </div>
            )}
            <span className="text-[12px] font-bold capitalize">
              {def?.label || node.type?.replace(/_/g, ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-5 w-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={12} />
          </button>
        </div>

        <div className="text-[9px] font-mono text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md w-fit">
          id: {node.id}
        </div>

        {def && (
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
            {def.description}
          </p>
        )}
      </div>

      {/* ── Properties ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Label */}
        <div>
          <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Label
          </label>
          <input
            className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-ring/40 transition-all"
            value={(node.data as any).label || ''}
            onChange={(e) => onUpdateData('label', e.target.value)}
            placeholder="Node label..."
          />
        </div>

        {/* All defined properties (including advanced) */}
        {def?.properties.map((prop) => (
          <PropertyField
            key={prop.key}
            property={prop}
            value={
              (node.data as any)[prop.key] ?? prop.defaultValue ?? ''
            }
            onChange={(val) => onUpdateData(prop.key, val)}
            dataContext={node.data as Record<string, unknown>}
          />
        ))}

        {/* Position (read-only) */}
        <div>
          <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground block">X</span>
              <span className="text-[11px] font-mono font-medium">
                {Math.round(node.position.x)}
              </span>
            </div>
            <div className="bg-muted rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground block">Y</span>
              <span className="text-[11px] font-mono font-medium">
                {Math.round(node.position.y)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete ── */}
      <div className="p-3 border-t border-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium"
          onClick={onDelete}
        >
          <Trash2 size={12} />
          Remove node
        </Button>
      </div>
    </div>
  );
}
