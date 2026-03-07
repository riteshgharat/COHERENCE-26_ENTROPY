import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Copy, Check, X, LogIn, LogOut, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/api'

const API = API_URL

interface CollabMember {
  id: string
  username: string
  color: string
  is_online: boolean
  joined_at: string
}

interface CollabSession {
  id: string
  workflow_id: string
  name: string
  invite_code: string
  created_by: string
  is_active: boolean
  created_at: string
  members: CollabMember[]
}

interface CollabTeamModalProps {
  workflowId: string
  username: string
  onClose: () => void
  onSessionJoined: (session: CollabSession) => void
}

export default function CollabTeamModal({
  workflowId,
  username,
  onClose,
  onSessionJoined,
}: CollabTeamModalProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [sessions, setSessions] = useState<CollabSession[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Fetch existing sessions for this workflow
  const fetchSessions = useCallback(async () => {
    if (!workflowId || workflowId === 'edit' || workflowId.startsWith('tpl-') || workflowId.startsWith('wf-')) {
      return;
    }
    try {
      const res = await fetch(`${API}/api/v1/collab/sessions/by-workflow/${workflowId}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions ?? [])
      }
    } catch { /* silent */ }
  }, [workflowId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const createSession = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/collab/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          name: sessionName || undefined,
          username,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create session' }))
        throw new Error(err.detail)
      }
      const session = await res.json()
      setSessions((prev) => [...prev, session])
      onSessionJoined(session)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const joinByInvite = async () => {
    setError('')
    setLoading(true)
    try {
      // First look up the session
      const lookupRes = await fetch(`${API}/api/v1/collab/join/${inviteCodeInput.trim()}`)
      if (!lookupRes.ok) {
        throw new Error('Invalid or expired invite code')
      }
      const session: CollabSession = await lookupRes.json()

      // Then join it
      const joinRes = await fetch(`${API}/api/v1/collab/sessions/${session.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (!joinRes.ok) {
        throw new Error('Failed to join session')
      }
      const updatedSession = await joinRes.json()
      onSessionJoined(updatedSession)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const joinSession = async (sessionId: string) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/collab/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) throw new Error('Failed to join')
      const session = await res.json()
      onSessionJoined(session)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const leaveSession = async (sessionId: string) => {
    try {
      await fetch(`${API}/api/v1/collab/sessions/${sessionId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      fetchSessions()
    } catch { /* silent */ }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Collaborate & Team Up</h2>
              <p className="text-[11px] text-muted-foreground">Work together on this workflow in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setTab('create'); setError(''); }}
            className={`flex-1 text-[12px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${tab === 'create' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <UserPlus size={12} /> Create Session
            </span>
          </button>
          <button
            onClick={() => { setTab('join'); setError(''); }}
            className={`flex-1 text-[12px] font-semibold py-2.5 transition-colors border-b-2 -mb-px ${tab === 'join' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <LogIn size={12} /> Join via Invite
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[12px] px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {tab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Session Name (optional)
                </label>
                <input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Sprint Review Collab"
                  className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
                <p>You'll be logged in as <span className="font-semibold text-foreground">{username}</span></p>
                <p>An invite code will be generated for your team to join</p>
              </div>

              <Button
                onClick={createSession}
                disabled={loading}
                className="w-full gap-2"
                size="sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Create Collaboration Session
              </Button>
            </div>
          )}

          {tab === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Invite Code
                </label>
                <input
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="Paste invite code here..."
                  className="w-full text-[13px] border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                />
              </div>

              <Button
                onClick={joinByInvite}
                disabled={loading || !inviteCodeInput.trim()}
                className="w-full gap-2"
                size="sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                Join Session
              </Button>
            </div>
          )}

          {/* Existing Sessions */}
          {sessions.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Active Sessions
              </h3>
              {sessions.map((s) => {
                const onlineCount = s.members.filter((m) => m.is_online).length
                const isCreator = s.created_by === username
                const isMember = s.members.some((m) => m.username === username)
                return (
                  <div
                    key={s.id}
                    className="border border-border rounded-lg p-3 space-y-2.5 bg-background"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCreator && <Crown size={12} className="text-amber-500" />}
                        <span className="text-[12px] font-semibold text-foreground">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {onlineCount} online
                      </span>
                    </div>

                    {/* Members */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {s.members.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${m.is_online
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                              : 'bg-muted border-border text-muted-foreground'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${m.is_online ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                          />
                          {m.username}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(s.invite_code)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent border border-border"
                      >
                        {copiedCode === s.invite_code ? (
                          <><Check size={10} className="text-emerald-500" /> Copied!</>
                        ) : (
                          <><Copy size={10} /> Copy Invite</>
                        )}
                      </button>

                      {!isMember ? (
                        <button
                          onClick={() => joinSession(s.id)}
                          className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 border border-blue-200 dark:border-blue-800"
                        >
                          <LogIn size={10} /> Join
                        </button>
                      ) : (
                        <button
                          onClick={() => leaveSession(s.id)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 border border-border"
                        >
                          <LogOut size={10} /> Leave
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
