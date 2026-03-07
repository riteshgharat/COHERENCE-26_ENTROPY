import { Users, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { CollaboratorInfo } from '@/hooks/useYjsCollaboration'

interface CollaborationBarProps {
  enabled: boolean
  connected: boolean
  collaborators: CollaboratorInfo[]
  workflowId?: string
  onToggle: () => void
}

export default function CollaborationBar({
  enabled,
  connected,
  collaborators,
  workflowId,
  onToggle,
}: CollaborationBarProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    if (!workflowId) return
    const url = `${window.location.origin}/workflows/${workflowId}/edit`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!enabled) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
        title="Enable live collaboration"
      >
        <Users size={12} />
        <span>Collaborate</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Connection status */}
      <div className="flex items-center gap-1.5 text-[11px]">
        {connected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-red-600 dark:text-red-400 font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Collaborator avatars */}
      {collaborators.length > 0 && (
        <div className="flex items-center -space-x-1.5">
          {collaborators.slice(0, 5).map((c) => (
            <div
              key={c.clientId}
              className="h-5 w-5 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
              style={{ backgroundColor: c.user.color }}
              title={c.user.name}
            >
              {c.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {collaborators.length > 5 && (
            <div className="h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              +{collaborators.length - 5}
            </div>
          )}
        </div>
      )}

      {/* User count */}
      <span className="text-[11px] text-muted-foreground">
        {collaborators.length + 1} online
      </span>

      {/* Share link */}
      {workflowId && (
        <button
          onClick={copyLink}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
          title="Copy collaboration link"
        >
          {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      )}

      {/* Toggle off */}
      <button
        onClick={onToggle}
        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-accent"
        title="Disable collaboration"
      >
        ✕
      </button>
    </div>
  )
}
