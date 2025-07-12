import { useEffect, useState } from 'react';

export function useWebSocket(url: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000') {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    
    socket.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data));
    };
    
    setWs(socket);
    
    return () => socket.close();
  }, [url]);

  return { ws, lastMessage };
}