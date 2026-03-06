import type { PropertyDef } from './nodeDefinitions';

interface PropertyFieldProps {
  property: PropertyDef;
  value: any;
  onChange: (value: any) => void;
  /** Compact mode = smaller inputs for inline-on-node rendering */
  compact?: boolean;
  /** Full node data so placeholderFn can resolve against sibling fields */
  dataContext?: Record<string, unknown>;
}

const base =
  'w-full bg-background border border-border rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-ring/40 transition-all placeholder:text-muted-foreground/50 nodrag';

export default function PropertyField({
  property,
  value,
  onChange,
  compact = false,
  dataContext,
}: PropertyFieldProps) {
  const { type, label, placeholder, placeholderFn, options, description } = property;
  const resolvedPlaceholder = placeholderFn ? placeholderFn(dataContext ?? {}) : placeholder;
  const size = compact ? 'px-2 py-1' : 'px-2.5 py-1.5';

  return (
    <div>
      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}
      </label>

      {type === 'text' && (
        <input
          className={`${base} ${size}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={resolvedPlaceholder}
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          className={`${base} ${size}`}
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder={resolvedPlaceholder}
        />
      )}

      {type === 'textarea' && (
        <textarea
          className={`${base} resize-none ${size}`}
          rows={compact ? 2 : 3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={resolvedPlaceholder}
        />
      )}

      {type === 'select' && (
        <select
          className={`${base} ${size}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {description && !compact && (
        <p className="text-[9px] text-muted-foreground/60 mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}
