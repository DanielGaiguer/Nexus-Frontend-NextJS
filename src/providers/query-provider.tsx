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
        // Dado deste app não é tempo real e toda mutation invalida as chaves
        // que altera -- então a revalidação passiva pode ser folgada:
        //  - staleTime 2min: navegar entre telas que compartilham uma query
        //    (perfil, matches, propostas) não redispara a chamada a cada clique.
        //  - refetchOnWindowFocus off: voltar o foco pro navegador (comum numa
        //    apresentação) não revalida tudo que está montado de uma vez.
        // Hooks individuais sobem/descem isso quando faz sentido (catálogos 5min,
        // contadores com refetchInterval próprio, etc).
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
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
