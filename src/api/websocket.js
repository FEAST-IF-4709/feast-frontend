// ============================================
// FEAST WebSocket Client — Real-Time Connection
// ============================================

class FeastWebSocket {
  /**
   * @param {string} path — e.g. "ws/kitchen/{outlet_id}/"
   * @param {string} token — JWT access token
   * @param {object} callbacks — { onMessage, onOpen, onClose, onError }
   */
  constructor(path, token, { onMessage, onOpen, onClose, onError } = {}) {
    this.wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
    this.path = path;
    this.token = token;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.ws = null;
    this.reconnectDelay = 3000;
    this.shouldReconnect = true;
  }

  connect() {
    const url = `${this.wsBaseUrl}/${this.path}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] Connected: ${this.path}`);
      this.reconnectDelay = 3000; // reset delay on successful connection
      this.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage?.(data);
      } catch (e) {
        console.error("[WS] Failed to parse message:", e);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[WS] Closed (code: ${event.code}): ${this.path}`);
      this.onClose?.(event);

      // Don't reconnect for auth errors
      if (event.code === 4401 || event.code === 4403) {
        console.error("[WS] Auth error — not reconnecting");
        return;
      }

      if (this.shouldReconnect) {
        console.log(`[WS] Reconnecting in ${this.reconnectDelay}ms...`);
        setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // exponential backoff
      }
    };

    this.ws.onerror = (error) => {
      console.error("[WS] Error:", error);
      this.onError?.(error);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  /** Send a JSON message through the WebSocket */
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// ── Helper: Connect to Kitchen channel ──
export function connectKitchen(outletId, token, callbacks) {
  const ws = new FeastWebSocket(`ws/kitchen/${outletId}/`, token, callbacks);
  ws.connect();
  return ws;
}

// ── Helper: Connect to Order tracking channel ──
export function connectOrderTracking(orderId, token, callbacks) {
  const ws = new FeastWebSocket(`ws/order/${orderId}/`, token, callbacks);
  ws.connect();
  return ws;
}

// ── Helper: Connect to Dashboard channel ──
export function connectDashboard(outletId, token, callbacks) {
  const ws = new FeastWebSocket(`ws/dashboard/${outletId}/`, token, callbacks);
  ws.connect();
  return ws;
}

export default FeastWebSocket;
