import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Message } from "../types/message";

const REFETCH_INTERVAL = 5_000; // 5 segundos

export function useMessagesPolling() {
  return useQuery({
    queryKey: ["messages-polling"],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await api.get<Message[]>("/messages", { signal });
      return res.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: REFETCH_INTERVAL,
    initialData: [],
  });
}
