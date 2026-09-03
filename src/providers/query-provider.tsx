"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";

// 428 CONSENT_REQUIRED: o usuário tinha o app aberto quando uma nova versão dos
// Termos foi publicada. O ConsentGateFilter do backend bloqueia a mutation;
// aqui a gente leva o usuário pra tela de re-aceite recarregando (o layout
// autenticado re-renderiza e mostra o <ReacceptTermsGate>). Guard evita
// múltiplos reloads se várias mutations falharem juntas.
let consentReloadTriggered = false;
function handleConsentRequired(error: unknown) {
  if (
    error instanceof ApiError &&
    error.status === 428 &&
    !consentReloadTriggered &&
    typeof window !== "undefined"
  ) {
    consentReloadTriggered = true;
    toast.error(
      "Os Termos de Uso foram atualizados. Você precisa aceitá-los para continuar."
    );
    window.location.reload();
  }
}

function makeQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({ onError: handleConsentRequired }),
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
        // 1 tentativa extra, exceto em 429: repetir logo consome outro token e
        // atrasa a recuperação. O 429 vira estado de erro do hook (mensagem
        // amigável no ponto de uso), nunca tela fatal.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.status === 429
            ? false
            : failureCount < 1,
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
