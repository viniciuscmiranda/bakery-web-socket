import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Message } from "../types/message";

export const useMessagesServerSentEvents = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Event | null>(null);

  // Popula a lista inicial com as mensagens já existentes
  const query = useQuery({
    queryKey: ["messages-server-sent-events"],
    queryFn: ({ signal }) =>
      api.get<Message[]>("/messages", { signal }).then((res) => res.data),
    refetchOnWindowFocus: false,
    initialData: [],
  });

  useEffect(() => {
    // Retorna evitando criar uma nova conexão se já existir uma
    if (eventSourceRef.current) return;

    const url = api.defaults.baseURL + "/messages/server-sent-events";
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("open", () => {
      setIsConnected(true);
    });

    eventSource.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // Atualizar o cache com as mensagens recebidas
      queryClient.setQueriesData(
        { queryKey: ["messages-server-sent-events"] },
        (prev: Message[]) => [...prev, data]
      );
    });

    eventSource.addEventListener("error", (error) => {
      setIsConnected(false);
      setConnectionError(error);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };
  }, [queryClient]);

  return {
    ...query,
    connectionError,
    isConnected,
  };
};
