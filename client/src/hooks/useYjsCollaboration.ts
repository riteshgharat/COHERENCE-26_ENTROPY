import { useEffect, useRef, useCallback, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import type { Node, Edge } from '@xyflow/react'
import { COLLAB_WS_URL } from '@/lib/api'

export interface CollaboratorInfo {
  clientId: number
  user: { name: string; color: string }
  cursor?: { x: number; y: number } | null
  selectedNodeId?: string | null
}

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function getUsername(): string {
  let name = sessionStorage.getItem('collab-username')
  if (!name) {
    name = `User-${Math.random().toString(36).slice(2, 6)}`
    sessionStorage.setItem('collab-username', name)
  }
  return name
}

export function useYjsCollaboration(
  workflowId: string | undefined,
  enabled: boolean,
  setNodes: (updater: Node[] | ((prev: Node[]) => Node[])) => void,
  setEdges: (updater: Edge[] | ((prev: Edge[]) => Edge[])) => void,
) {
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([])
  const [connected, setConnected] = useState(false)
  const [synced, setSynced] = useState(false)
  const initializedRef = useRef(false)

  // Setup Yjs document and WebSocket provider
  useEffect(() => {
    if (!enabled || !workflowId) return

    const ydoc = new Y.Doc()
    const roomName = `workflow-${workflowId}`
    const provider = new WebsocketProvider(COLLAB_WS_URL, roomName, ydoc)

    ydocRef.current = ydoc
    providerRef.current = provider
    initializedRef.current = false

    provider.awareness.setLocalStateField('user', {
      name: getUsername(),
      color: getRandomColor(),
    })

    // Connection status
    provider.on('status', ({ status }: { status: string }) => {
      setConnected(status === 'connected')
    })
    provider.on('sync', (isSynced: boolean) => {
      setSynced(isSynced)
    })

    // Collaborator awareness
    const onAwarenessChange = () => {
      const states = provider.awareness.getStates()
      const collabs: CollaboratorInfo[] = []
      states.forEach((state: Record<string, unknown>, clientId: number) => {
        if (clientId === ydoc.clientID || !state.user) return
        const user = state.user as { name: string; color: string }
        const cursor = (state.cursor as { x: number; y: number } | undefined) ?? null
        const selectedNodeId = (state.selectedNodeId as string | undefined) ?? null
        collabs.push({ clientId, user, cursor, selectedNodeId })
      })
      setCollaborators(collabs)
    }
    provider.awareness.on('change', onAwarenessChange)

    // Observe remote changes to nodes
    const nodesMap = ydoc.getMap('nodes')
    const edgesMap = ydoc.getMap('edges')

    const pushNodesToReactFlow = (_: Y.YMapEvent<unknown>, txn: Y.Transaction) => {
      if (txn.origin === 'local') return
      const nodes: Node[] = []
      nodesMap.forEach((v: unknown) => {
        try {
          nodes.push(typeof v === 'string' ? JSON.parse(v) : v)
        } catch { /* skip malformed */ }
      })
      setNodes(nodes)
    }

    const pushEdgesToReactFlow = (_: Y.YMapEvent<unknown>, txn: Y.Transaction) => {
      if (txn.origin === 'local') return
      const edges: Edge[] = []
      edgesMap.forEach((v: unknown) => {
        try {
          edges.push(typeof v === 'string' ? JSON.parse(v) : v)
        } catch { /* skip malformed */ }
      })
      setEdges(edges)
    }

    nodesMap.observe(pushNodesToReactFlow)
    edgesMap.observe(pushEdgesToReactFlow)

    return () => {
      nodesMap.unobserve(pushNodesToReactFlow)
      edgesMap.unobserve(pushEdgesToReactFlow)
      provider.awareness.off('change', onAwarenessChange)
      provider.disconnect()
      ydoc.destroy()
      ydocRef.current = null
      providerRef.current = null
      initializedRef.current = false
      setConnected(false)
      setSynced(false)
      setCollaborators([])
    }
  }, [workflowId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Push local node changes to Yjs
  const syncNodes = useCallback((nodes: Node[]) => {
    const ydoc = ydocRef.current
    if (!ydoc) return
    const nodesMap = ydoc.getMap('nodes')
    ydoc.transact(() => {
      const incoming = new Set(nodes.map((n) => n.id))
      const toDelete: string[] = []
      nodesMap.forEach((_, k: string) => {
        if (!incoming.has(k)) toDelete.push(k)
      })
      toDelete.forEach((k) => nodesMap.delete(k))
      nodes.forEach((n) => nodesMap.set(n.id, JSON.stringify(n)))
    }, 'local')
  }, [])

  // Push local edge changes to Yjs
  const syncEdges = useCallback((edges: Edge[]) => {
    const ydoc = ydocRef.current
    if (!ydoc) return
    const edgesMap = ydoc.getMap('edges')
    ydoc.transact(() => {
      const incoming = new Set(edges.map((e) => e.id))
      const toDelete: string[] = []
      edgesMap.forEach((_, k: string) => {
        if (!incoming.has(k)) toDelete.push(k)
      })
      toDelete.forEach((k) => edgesMap.delete(k))
      edges.forEach((e) => edgesMap.set(e.id, JSON.stringify(e)))
    }, 'local')
  }, [])

  // Seed Yjs doc from existing workflow data (only if Yjs is empty)
  const initializeFromData = useCallback((nodes: Node[], edges: Edge[]) => {
    const ydoc = ydocRef.current
    if (!ydoc || initializedRef.current) return
    initializedRef.current = true
    const nodesMap = ydoc.getMap('nodes')
    const edgesMap = ydoc.getMap('edges')
    if (nodesMap.size > 0) return // already has collaborative data
    ydoc.transact(() => {
      nodes.forEach((n) => nodesMap.set(n.id, JSON.stringify(n)))
      edges.forEach((e) => edgesMap.set(e.id, JSON.stringify(e)))
    }, 'local')
  }, [])

  const updateCursor = useCallback((cursor: { x: number; y: number } | null) => {
    providerRef.current?.awareness.setLocalStateField('cursor', cursor)
  }, [])

  const updateSelectedNode = useCallback((nodeId: string | null) => {
    providerRef.current?.awareness.setLocalStateField('selectedNodeId', nodeId)
  }, [])

  return {
    collaborators,
    connected,
    synced,
    syncNodes,
    syncEdges,
    initializeFromData,
    updateCursor,
    updateSelectedNode,
  }
}
