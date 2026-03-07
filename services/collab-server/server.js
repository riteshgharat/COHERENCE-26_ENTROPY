const http = require('http')
const { WebSocketServer } = require('ws')
const { setupWSConnection, docs } = require('y-websocket/bin/utils')

const PORT = Number(process.env.PORT) || 4000

const server = http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    res.end()
    return
  }

  if (req.url === '/health') {
    res.writeHead(200, headers)
    res.end(JSON.stringify({
      status: 'ok',
      service: 'collab-server',
      rooms: docs.size,
    }))
    return
  }

  if (req.url === '/rooms') {
    const rooms = []
    docs.forEach((doc, name) => {
      rooms.push({ name, clients: doc.conns ? doc.conns.size : 0 })
    })
    res.writeHead(200, headers)
    res.end(JSON.stringify({ rooms }))
    return
  }

  res.writeHead(200, headers)
  res.end(JSON.stringify({ service: 'collab-server' }))
})

const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
  console.log(`[collab] Client joined: ${req.url}`)
  conn.on('close', () => console.log(`[collab] Client left: ${req.url}`))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[collab] Collaboration server running on :${PORT}`)
})
