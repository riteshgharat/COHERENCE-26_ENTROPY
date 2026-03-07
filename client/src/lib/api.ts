/**
 * Central API configuration — auto-resolves for LAN & ngrok access.
 *
 * Priority: VITE_* env vars  →  derive from window.location.hostname
 * This lets other devices on the same network (or via ngrok) hit the
 * correct backend without hardcoding "localhost".
 */

const hostname =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';

/** REST API base URL (no trailing slash) */
export const API_URL =
  import.meta.env.VITE_API_URL || `http://${hostname}:8000`;

/** Backend WebSocket base URL (no trailing slash) */
export const API_WS_URL =
  import.meta.env.VITE_API_WS_URL || `ws://${hostname}:8000`;

/** Yjs collaboration WebSocket server URL (no trailing slash) */
export const COLLAB_WS_URL =
  import.meta.env.VITE_COLLAB_WS_URL || `ws://${hostname}:4000`;
