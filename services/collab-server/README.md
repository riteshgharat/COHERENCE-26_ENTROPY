# Collaboration Server

Real-time collaborative workflow editing server using **Yjs CRDT + WebSockets**.

## Setup

```bash
npm install
npm run dev
```

## Architecture

- WebSocket server on port 4000
- Each workflow gets its own CRDT room: `workflow-<id>`
- Uses Yjs for conflict-free real-time document sync
- Awareness protocol for live cursor presence

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check + room count |
| `GET /rooms` | List active collab rooms |
| `ws://localhost:4000/<room>` | WebSocket connection |

## How it works

1. Client opens a workflow editor and connects via WebSocket
2. Server creates/joins a Yjs document room for that workflow
3. All edits (node moves, additions, deletions) are synced via CRDT
4. Cursor positions broadcast via the Awareness protocol
5. Conflicts resolved automatically — no data loss
