"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Evita refetch agressivo em cada foco de janela; cada hook de
        // query pode sobrescrever isso por entidade quando fizer sentido.
        staleTime: 30 * 1000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Um QueryClient por request no servidor (evita vazar dado entre usuários),
// e um único client reaproveitado no browser (evita recriar a cache a cada
// re-render da árvore de componentes). Padrão recomendado pelo TanStack Query
// para o App Router.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
