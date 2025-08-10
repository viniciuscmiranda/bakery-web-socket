import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Message } from "../types/message";

const REFETCH_INTERVAL = 5_000; // 5 segundos

export function useMessagesLongPolling() {
  return useQuery({
    queryKey: ["messages-long-polling"],
    queryFn: async ({ client, signal, queryKey }) => {
      const queryData = client.getQueryData<Message[]>(queryKey) || [];

      const res = await api.get<Message[]>("/messages/long-polling", {
        signal,
        params: {
          // Envia o timestamp da última mensagem recebida pelo cliente, caso exista
          lastMessageTimestamp: queryData.at(-1)?.timestamp,
        },
      });

      return [...queryData, ...res.data];
    },
    refetchInterval: REFETCH_INTERVAL,
    initialData: [],
    // Não tentar novamente se a conexão for fechada manualmente
    retry: (_, error) => error.name !== "AbortError",
    // Backoff para evitar sobrecarregar o servidor em caso de erros reais
    retryDelay: (failureCount) => REFETCH_INTERVAL * failureCount,
  });
}
