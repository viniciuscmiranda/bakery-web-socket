import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Message } from "../types/message";

export const useMessagesWebsocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
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
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setIsConnected(false);
      }
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
