// src/app/queryClient.js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evita refetch toda hora ao voltar para a aba
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30s
    },
  },
});