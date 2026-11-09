import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Radio } from 'lucide-react';

export const RealtimeStatusBadge = ({ className = '' }) => {
  const { isConnected } = useWebSocket();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
        isConnected
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
      } ${className}`}
      title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to real-time service...'}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        ></span>
      </span>
      <span className="tracking-wide uppercase text-[10px]">
        {isConnected ? 'Real-time Live' : 'Connecting'}
      </span>
    </div>
  );
};
