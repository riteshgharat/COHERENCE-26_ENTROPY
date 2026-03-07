import { useEffect, useRef, useCallback, useState } from 'react'
import { API_WS_URL } from '@/lib/api'

const API_WS = API_WS_URL

export interface CollabActivity {
  type: 'user_joined' | 'user_left' | 'activity' | 'workflow_updated'
  username?: string
  action?: string
  timestamp: string
  flow_data?: { nodes: unknown[]; edges: unknown[] }
}

export function useCollabWebSocket(
  workflowId: string | undefined,
  enabled: boolean,
  username: string,
  onWorkflowUpdated?: (flowData: { nodes: unknown[]; edges: unknown[] }) => void,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const [activities, setActivities] = useState<CollabActivity[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !workflowId) return

    const connect = () => {
      const ws = new WebSocket(`${API_WS}/api/v1/collab/ws/${workflowId}`)
      wsRef.current = ws

      ws.onopen = () => {
        setWsConnected(true)
        // Announce join
        ws.send(JSON.stringify({ type: 'user_joined', username }))
      }

      ws.onmessage = (event) => {
        try {
          const data: CollabActivity = JSON.parse(event.data)
          setActivities((prev) => [...prev.slice(-49), data])

          if (data.type === 'workflow_updated' && data.flow_data && onWorkflowUpdated) {
            onWorkflowUpdated(data.flow_data)
          }
        } catch { /* ignore */ }
      }

      ws.onclose = () => {
        setWsConnected(false)
        // Auto-reconnect after 3s
        reconnectRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'user_left', username }))
        ws.close()
      }
      wsRef.current = null
      setWsConnected(false)
    }
  }, [workflowId, enabled, username]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendSave = useCallback(
    (flowData: { nodes: unknown[]; edges: unknown[] }) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(
        JSON.stringify({
          type: 'workflow_save',
          username,
          flow_data: flowData,
        }),
      )
    },
    [username],
  )

  const sendActivity = useCallback(
    (action: string) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(JSON.stringify({ type: 'activity', username, action }))
    },
    [username],
  )

  return { activities, wsConnected, sendSave, sendActivity }
}
