import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

export function useCreateMessage() {
  return useMutation({
    mutationFn: async (message: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return api.post("/messages", { message, clientId: "client" });
    },
  });
}
