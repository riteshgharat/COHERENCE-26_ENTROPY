import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';

export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  style,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { deleteElements } = useReactFlow();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* Edge label (e.g. "Replied" / "No Reply") */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="absolute pointer-events-none nodrag nopan text-[9px] font-semibold text-muted-foreground bg-card border border-border rounded-md px-1.5 py-0.5 shadow-sm"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Delete button — appears when edge is selected */}
      {selected && (
        <EdgeLabelRenderer>
          <button
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + (label ? 18 : 0)}px)`,
            }}
            className="absolute pointer-events-all nodrag nopan h-5 w-5 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full flex items-center justify-center shadow-md transition-colors font-bold text-sm leading-none"
            title="Delete connection"
            onClick={(e) => {
              e.stopPropagation();
              deleteElements({ edges: [{ id }] });
            }}
          >
            ×
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
