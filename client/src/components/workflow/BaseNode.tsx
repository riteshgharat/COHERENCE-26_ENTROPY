import { memo, useCallback, useRef, useState } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react';
import { Mail, Linkedin, MessageCircle, Upload, X } from 'lucide-react';
import { getNodeDefinition, type OutputHandle } from './nodeDefinitions';
import PropertyField from './PropertyField';

const positionMap: Record<OutputHandle['position'], Position> = {
  bottom: Position.Bottom,
  right: Position.Right,
  left: Position.Left,
};

const handleClass =
  '!w-2.5 !h-2.5 !bg-foreground !border-2 !border-background';

const channelIcons: Record<string, any> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

// ── File upload zone for lead_upload nodes ──
function LeadUploadZone({
  value,
  onChange,
}: {
  value?: string;
  onChange: (name: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onChange(file.name);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file.name);
  };

  return (
    <div
      className={`nodrag nowheel mx-3 mb-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors select-none ${
        dragging
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
          : value
          ? 'border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/10'
          : 'border-border hover:border-amber-400/60 hover:bg-muted/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-1 py-3 px-2 text-center">
        <Upload size={14} className={value ? 'text-amber-500' : 'text-muted-foreground/50'} />
        {value ? (
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 truncate max-w-[180px]">
            {value}
          </span>
        ) : (
          <>
            <span className="text-[10px] font-semibold text-muted-foreground">
              Drop CSV / Excel
            </span>
            <span className="text-[9px] text-muted-foreground/60">or click to browse</span>
          </>
        )}
      </div>
    </div>
  );
}

function BaseNode({ id, data, type, selected }: NodeProps) {
  const def = getNodeDefinition(type || '');
  const { updateNodeData, deleteElements } = useReactFlow();

  const handleFieldChange = useCallback(
    (key: string, value: any) => {
      updateNodeData(id, { [key]: value });
    },
    [id, updateNodeData],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ nodes: [{ id }] });
    },
    [id, deleteElements],
  );

  if (!def) {
    return (
      <div className="px-3 py-2 rounded-lg border border-destructive bg-card text-xs text-destructive">
        Unknown: {type}
      </div>
    );
  }

  // Dynamic icon for send_message based on channel
  let Icon = def.icon;
  if (type === 'send_message' && (data as any).channel) {
    Icon = channelIcons[(data as any).channel] || def.icon;
  }

  const inlineProps = def.properties.filter((p) => !p.advanced);
  const dataCtx = data as Record<string, unknown>;
  const isExecuting = !!(data as any)._executing;
  const isDone = !!(data as any)._done;

  // ── Compact pill (Start / End) ──
  if (def.compact) {
    return (
      <div
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-150 ${
          isExecuting
            ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background border-amber-300'
            : isDone
            ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-background border-emerald-200'
            : selected
            ? 'ring-2 ring-ring ring-offset-1 ring-offset-background border-foreground/20 shadow-md'
            : 'border-border hover:border-foreground/10 hover:shadow-md'
        }`}
      >
        {def.hasTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className={handleClass}
          />
        )}
        <div
          className={`h-6 w-6 rounded-lg flex items-center justify-center text-white ${def.color}`}
        >
          <Icon size={12} />
        </div>
        <span className="text-[12px] font-bold">
          {(data as any).label || def.label}
        </span>
        {/* Delete button */}
        <button
          className="nodrag ml-1 h-4 w-4 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          title="Delete node"
          onClick={handleDelete}
        >
          <X size={9} />
        </button>
        {def.outputs.map((out, i) => (
          <Handle
            key={out.id || `s-${i}`}
            type="source"
            id={out.id}
            position={positionMap[out.position]}
            className={handleClass}
          />
        ))}
      </div>
    );
  }

  // ── Full card (Langflow-style) ──
  return (
    <div
      className={`group relative bg-card border rounded-xl shadow-sm min-w-[240px] max-w-[280px] transition-all duration-150 ${
        isExecuting
          ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background border-amber-300 shadow-amber-100 dark:shadow-amber-900/20'
          : isDone
          ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-background border-emerald-200'
          : selected
          ? 'ring-2 ring-ring ring-offset-1 ring-offset-background border-foreground/20 shadow-lg'
          : 'border-border hover:border-foreground/10 hover:shadow-md'
      }`}
    >
      {/* Target handle */}
      {def.hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className={handleClass}
        />
      )}

      {/* ── Colored header with delete button ── */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-t-xl border-b border-black/10 ${def.color}`}
      >
        <Icon size={13} className="text-white shrink-0" strokeWidth={2} />
        <span className="text-[11px] font-bold text-white tracking-wide flex-1 truncate">
          {def.label}
        </span>
        {/* Delete button */}
        <button
          className="nodrag h-5 w-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:bg-white/20 transition-all text-white shrink-0"
          title="Delete node"
          onClick={handleDelete}
        >
          <X size={10} />
        </button>
      </div>

      {/* ── Editable label ── */}
      <div className="px-3 pt-2.5">
        <input
          className="nodrag text-[12px] font-semibold w-full bg-transparent outline-none hover:bg-muted/50 focus:bg-muted px-1.5 py-1 -mx-1.5 rounded-md transition-colors"
          value={(data as any).label || ''}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          placeholder={def.label}
        />
      </div>

      {/* ── File upload zone (lead_upload only) ── */}
      {type === 'lead_upload' && (
        <LeadUploadZone
          value={(data as any).file_name}
          onChange={(name) => handleFieldChange('file_name', name)}
        />
      )}

      {/* ── Inline properties ── */}
      {inlineProps.length > 0 && (
        <div className="px-3 pb-3 pt-1 space-y-2 nodrag nowheel">
          {inlineProps.map((prop) => (
            <PropertyField
              key={prop.key}
              property={prop}
              value={(data as any)[prop.key] ?? prop.defaultValue ?? ''}
              onChange={(val) => handleFieldChange(prop.key, val)}
              compact
              dataContext={dataCtx}
            />
          ))}
        </div>
      )}

      {/* ── Output labels for branching nodes ── */}
      {def.outputs.length > 1 && (
        <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
          {def.outputs.map((out) => (
            <span
              key={out.id || out.position}
              className="text-[8px] font-bold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border"
            >
              {out.label || out.id}
              {out.position === 'right' ? ' →' : ' ↓'}
            </span>
          ))}
        </div>
      )}

      {/* ── Source handles ── */}
      {def.outputs.map((out, i) => (
        <Handle
          key={out.id || `s-${i}`}
          type="source"
          id={out.id}
          position={positionMap[out.position] || Position.Bottom}
          className={handleClass}
          style={out.position === 'right' ? { top: '50%' } : undefined}
        />
      ))}
    </div>
  );
}

export default memo(BaseNode);
