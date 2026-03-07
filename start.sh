#!/usr/bin/env bash
# =============================================================================
# OutflowAI — Single Command Startup
# Usage:
#   bash start.sh               → start everything (LAN mode)
#   bash start.sh --ngrok       → start everything + ngrok public tunnel
#   bash start.sh --no-redis    → skip Redis (if already running)
#   bash start.sh --no-frontend → skip Vite frontend
# =============================================================================

set -e

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS=()
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

# ── Flags ────────────────────────────────────────────────────────────────────
START_REDIS=true
START_FRONTEND=true
USE_NGROK=false
for arg in "$@"; do
  case $arg in
    --no-redis)    START_REDIS=false ;;
    --no-frontend) START_FRONTEND=false ;;
    --ngrok)       USE_NGROK=true ;;
  esac
done

# ── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo -e "${CYAN}[outflow]${NC} $1"; }
ok()   { echo -e "${GREEN}  ✔${NC} $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC} $1"; }
err()  { echo -e "${RED}  ✖${NC} $1"; }

# Port check using Python (works on Windows/Git Bash — no nc needed)
port_open() {
  python -c "
import socket, sys
s = socket.socket()
s.settimeout(0.5)
code = s.connect_ex(('127.0.0.1', $1))
s.close()
sys.exit(code)
" 2>/dev/null
}

wait_for_port() {
  local port=$1 name=$2 retries=40
  while ! port_open "$port"; do
    retries=$((retries - 1))
    if [ $retries -le 0 ]; then
      err "$name did not start on :$port — check .logs/ for details"
      return 1
    fi
    sleep 0.5
  done
  ok "$name is up on :$port"
}

cleanup() {
  echo ""
  log "Shutting down all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null && echo "  killed PID $pid"
  done
  # Kill ngrok if we started it
  if $USE_NGROK; then
    pkill -f "ngrok http" 2>/dev/null && echo "  killed ngrok"
  fi
  log "All services stopped. Bye!"
}
trap cleanup EXIT INT TERM

# ── Detect LAN IP ────────────────────────────────────────────────────────────
LAN_IP=$(python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(('8.8.8.8', 80))
    print(s.getsockname()[0])
except Exception:
    print('127.0.0.1')
finally:
    s.close()
" 2>/dev/null || echo "127.0.0.1")

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         OutflowAI — Starting up          ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── 0. Load backend .env ─────────────────────────────────────────────────────
ENV_FILE="$ROOT_DIR/backend/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  ok "Loaded env from backend/.env"
else
  warn "No backend/.env found — using existing env vars"
fi

# ── 1. Redis ─────────────────────────────────────────────────────────────────
if $START_REDIS; then
  log "Starting Redis..."
  if command -v redis-server &>/dev/null; then
    redis-server --daemonize yes --logfile "$LOG_DIR/redis.log" --port 6379 \
      >/dev/null 2>&1 || warn "Redis may already be running"
    wait_for_port 6379 "Redis"
  elif command -v docker &>/dev/null; then
    docker run -d --rm --name outflow-redis -p 6379:6379 redis:7-alpine \
      >/dev/null 2>&1 || warn "Redis Docker container may already be running"
    wait_for_port 6379 "Redis (Docker)"
  else
    warn "redis-server and docker not found — skipping Redis (Celery uses sync fallback)"
  fi
fi

# ── 2. Backend (FastAPI via uv) on :8000 ─────────────────────────────────────
log "Starting Backend (FastAPI) on :8000..."
cd "$ROOT_DIR/backend"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
  >"$LOG_DIR/backend.log" 2>&1 &
PIDS+=($!)
wait_for_port 8000 "Backend"
cd "$ROOT_DIR"

# ── 3. Celery Worker (via uv) ─────────────────────────────────────────────────
log "Starting Celery worker..."
cd "$ROOT_DIR/backend"
uv run celery -A app.workers.celery_app worker --loglevel=info \
  >"$LOG_DIR/celery.log" 2>&1 &
PIDS+=($!)
ok "Celery worker started (PID ${PIDS[-1]})"
cd "$ROOT_DIR"

# ── 4. Email Service (Python/uv) on :3002 ────────────────────────────────────
log "Starting Email service on :3002..."
cd "$ROOT_DIR/services/email-service"
PORT=3002 uv run uvicorn server:app --host 0.0.0.0 --port 3002 \
  >"$LOG_DIR/email-service.log" 2>&1 &
PIDS+=($!)
wait_for_port 3002 "Email service" || warn "Email service failed — check .logs/email-service.log"
cd "$ROOT_DIR"

# ── 5. LinkedIn Service (Node.js) on :3001 ────────────────────────────────────
log "Starting LinkedIn service on :3001..."
cd "$ROOT_DIR/services/linkedin-service"
PORT=3001 node server.js >"$LOG_DIR/linkedin-service.log" 2>&1 &
PIDS+=($!)
wait_for_port 3001 "LinkedIn service" || warn "LinkedIn service failed — check .logs/linkedin-service.log"
cd "$ROOT_DIR"

# ── 6. WhatsApp Service (Node.js) on :3000 ────────────────────────────────────
log "Starting WhatsApp service on :3000..."
cd "$ROOT_DIR/services/whatsapp-service"
PORT=3000 node server.js >"$LOG_DIR/whatsapp-service.log" 2>&1 &
PIDS+=($!)
wait_for_port 3000 "WhatsApp service" || warn "WhatsApp service failed — check .logs/whatsapp-service.log"
cd "$ROOT_DIR"

# ── 7. Collab Server (y-websocket / Yjs) on :4000 ─────────────────────────────
log "Starting Collab server (Yjs) on :4000..."
cd "$ROOT_DIR/services/collab-server"
if [ ! -d "node_modules" ]; then
  npm install --silent 2>/dev/null
fi
PORT=4000 node server.js >"$LOG_DIR/collab-server.log" 2>&1 &
PIDS+=($!)
wait_for_port 4000 "Collab server" || warn "Collab server failed — check .logs/collab-server.log"
cd "$ROOT_DIR"

# ── 8. Ngrok tunnel (optional) ────────────────────────────────────────────────
NGROK_URL=""
if $USE_NGROK; then
  log "Starting ngrok tunnel for backend :8000..."
  if command -v ngrok &>/dev/null; then
    ngrok http 8000 --log=stdout >"$LOG_DIR/ngrok.log" 2>&1 &
    PIDS+=($!)
    sleep 3
    # Extract the public URL from ngrok's local API
    NGROK_URL=$(python -c "
import json, urllib.request
try:
    data = json.loads(urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels').read())
    for t in data.get('tunnels', []):
        if t.get('proto') == 'https':
            print(t['public_url'])
            break
except Exception:
    pass
" 2>/dev/null || true)
    if [ -n "$NGROK_URL" ]; then
      ok "Ngrok tunnel: $NGROK_URL"
      export VITE_API_URL="$NGROK_URL"
      # Derive WebSocket URL from ngrok HTTPS URL
      NGROK_WS="${NGROK_URL/https:/wss:}"
      export VITE_API_WS_URL="$NGROK_WS"
    else
      warn "Could not read ngrok URL — check .logs/ngrok.log"
    fi
  else
    warn "ngrok not found — install from https://ngrok.com/download"
    warn "Skipping tunnel, using LAN access only"
  fi
fi

# ── 9. Frontend (Vite) on :5173 ───────────────────────────────────────────────
if $START_FRONTEND; then
  log "Starting Frontend (Vite) on :5173 (--host)..."
  cd "$ROOT_DIR/client"
  npm run dev >"$LOG_DIR/frontend.log" 2>&1 &
  PIDS+=($!)
  wait_for_port 5173 "Frontend"
  cd "$ROOT_DIR"
fi

# ── 10. Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                  Service URLs                        ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${NC}"
echo -e " ${GREEN}Frontend${NC}       →  http://localhost:5173"
echo -e " ${GREEN}Frontend (LAN)${NC} →  http://${LAN_IP}:5173"
echo -e " ${GREEN}Backend API${NC}    →  http://localhost:8000"
echo -e " ${GREEN}Backend (LAN)${NC}  →  http://${LAN_IP}:8000"
echo -e " ${GREEN}Swagger Docs${NC}   →  http://localhost:8000/docs"
echo -e " ${GREEN}Collab Server${NC}  →  ws://${LAN_IP}:4000"
echo -e " ${GREEN}WhatsApp Svc${NC}   →  http://localhost:3000"
echo -e " ${GREEN}LinkedIn Svc${NC}   →  http://localhost:3001"
echo -e " ${GREEN}Email Svc${NC}      →  http://localhost:3002"
if [ -n "$NGROK_URL" ]; then
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${NC}"
echo -e " ${CYAN}Ngrok (Public)${NC} →  ${NGROK_URL}"
echo -e " ${CYAN}Ngrok WS${NC}       →  ${NGROK_WS}"
fi
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${YELLOW}Multi-device access:${NC}"
echo -e "    Open ${BOLD}http://${LAN_IP}:5173${NC} on other devices on the same network"
if [ -n "$NGROK_URL" ]; then
echo -e "    Or share ${BOLD}${NGROK_URL}${NC} for public internet access"
fi
echo ""
echo -e "  Logs:  tail -f ${CYAN}.logs/backend.log${NC}"
echo ""
log "All services running. Press Ctrl+C to stop everything."

# ── Keep alive ────────────────────────────────────────────────────────────────
wait
