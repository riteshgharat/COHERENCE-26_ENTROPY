import { useEffect, useRef, useCallback } from 'react'
import { useViewport, useReactFlow } from '@xyflow/react'
import type { CollaboratorInfo } from '@/hooks/useYjsCollaboration'

/* ── Cursor overlay: renders other users' cursors on the canvas ── */
export default function CollaboratorCursors({ collaborators }: { collaborators: CollaboratorInfo[] }) {
  const viewport = useViewport()

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}
    >
      {collaborators.map((c) => {
        if (!c.cursor) return null
        // Convert flow coordinates → screen position within the container
        const x = c.cursor.x * viewport.zoom + viewport.x
        const y = c.cursor.y * viewport.zoom + viewport.y

        return (
          <div
            key={c.clientId}
            className="absolute transition-all duration-75 ease-out"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            {/* Cursor pointer svg */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M3 3L10.07 17.97L12.58 10.61L19.94 8.1L3 3Z"
                fill={c.user.color}
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute left-4 top-3 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-md"
              style={{ backgroundColor: c.user.color }}
            >
              {c.user.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Cursor tracker: sends local cursor position to awareness ── */
export function CursorTracker({
  onCursorMove,
  enabled,
}: {
  onCursorMove: (pos: { x: number; y: number } | null) => void
  enabled: boolean
}) {
  const { screenToFlowPosition } = useReactFlow()
  const lastUpdateRef = useRef(0)

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastUpdateRef.current < 80) return // throttle ~12fps
      lastUpdateRef.current = now
      try {
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
        onCursorMove(pos)
      } catch {
        /* ignore if flow not ready */
      }
    },
    [screenToFlowPosition, onCursorMove],
  )

  const handleLeave = useCallback(() => onCursorMove(null), [onCursorMove])

  useEffect(() => {
    if (!enabled) return
    const el = document.querySelector('.react-flow') as HTMLElement | null
    if (!el) return

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [enabled, handleMove, handleLeave])

  return null
}
