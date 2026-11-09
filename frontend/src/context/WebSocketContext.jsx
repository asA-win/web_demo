import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createWebSocketClient } from '../services/websocket';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated, token, isAdmin } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const clientRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Determine appropriate endpoint: admin gets full admin stream, others get public stream
    const endpoint = (isAuthenticated && isAdmin && token) 
      ? `/ws/admin?token=${token}` 
      : `/ws/public`;

    const client = createWebSocketClient(endpoint);
    clientRef.current = client;

    const unbindStatus = client.onConnectionChange((status) => {
      setIsConnected(status);
    });

    const unbindAll = client.on('*', (eventName, data) => {
      setLastEvent({ event: eventName, data, timestamp: Date.now() });
      const callbacks = listenersRef.current.get(eventName) || [];
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in WS subscriber callback for ${eventName}:`, e);
        }
      });
    });

    client.connect();

    return () => {
      unbindStatus();
      unbindAll();
      client.disconnect();
    };
  }, [isAuthenticated, isAdmin, token]);

  const subscribe = (eventName, callback) => {
    if (!listenersRef.current.has(eventName)) {
      listenersRef.current.set(eventName, []);
    }
    listenersRef.current.get(eventName).push(callback);

    return () => {
      const list = listenersRef.current.get(eventName) || [];
      listenersRef.current.set(
        eventName,
        list.filter((cb) => cb !== callback)
      );
    };
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastEvent, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
