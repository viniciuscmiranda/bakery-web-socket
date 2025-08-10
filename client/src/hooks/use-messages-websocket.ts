import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Message } from "../types/message";

const DISCONNECT_TIMEOUT = 1_000; // 1 segundo

export const useMessagesWebsocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Event | null>(null);

  // Popula a lista inicial com as mensagens já existentes
  const query = useQuery({
    queryKey: ["messages-websocket"],
    queryFn: ({ signal }) =>
      api.get<Message[]>("/messages", { signal }).then((res) => res.data),
    refetchOnWindowFocus: false,
    initialData: [],
  });

  useEffect(() => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }

    // Retorna evitando criar uma nova conexão se já existir uma
    if (socketRef.current) return;

    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setIsConnected(true);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // Atualizar o cache com as mensagens recebidas
      queryClient.setQueriesData(
        { queryKey: ["messages-websocket"] },
        (prev: Message[]) => [...prev, data]
      );
    });

    socket.addEventListener("error", (error) => {
      setConnectionError(error);
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
    });

    return () => {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }

      // Aguarda um pouco antes de desconectar
      disconnectTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
          setIsConnected(false);
        }
      }, DISCONNECT_TIMEOUT);
    };
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ message }));
    }
  }, []);

  return {
    ...query,
    isConnected,
    connectionError,
    sendMessage,
  };
};
