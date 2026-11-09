class WebSocketClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.socket = null;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.reconnectInterval = 3000;
    this.pingInterval = null;
    this.isConnected = false;
    this.connectionListeners = new Set();
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_BASE_URL 
      ? import.meta.env.VITE_WS_BASE_URL.replace(/^http(s)?:\/\//, '$1' ? 'wss://' : 'ws://')
      : `${wsProtocol}//${window.location.host}`;

    const url = `${wsHost}${this.endpoint}`;
    
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notifyConnectionStatus(true);
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.event) {
            this.emit(parsed.event, parsed.data);
          }
        } catch (err) {
          console.debug('Raw WS message:', event.data);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket encountered error:', error);
        this.socket.close();
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.scheduleReconnect();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send('ping');
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, this.reconnectInterval);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in WebSocket listener for ${event}:`, e);
        }
      }
    }
    // Also trigger wildcard listeners
    if (this.listeners.has('*')) {
      for (const callback of this.listeners.get('*')) {
        try {
          callback(event, data);
        } catch (e) {
          console.error('Error in wildcard WS listener:', e);
        }
      }
    }
  }

  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    callback(this.isConnected);
    return () => this.connectionListeners.delete(callback);
  }

  notifyConnectionStatus(status) {
    for (const callback of this.connectionListeners) {
      callback(status);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyConnectionStatus(false);
  }
}

export const createWebSocketClient = (endpoint) => new WebSocketClient(endpoint);
