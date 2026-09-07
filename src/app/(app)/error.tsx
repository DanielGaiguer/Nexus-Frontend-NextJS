"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

/**
 * Boundary de erro do shell autenticado — evita a tela branca quando algo
 * quebra no render de uma página (ex.: um MEMBER abrindo uma seção OWNER-only
 * cujo endpoint devolveu 403 e a página não previu dado ausente). Mostra uma
 * saída amigável em vez de derrubar a árvore toda.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isPermission = error instanceof ApiError && error.status === 403;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" />
      </div>
      <div className="max-w-sm">
        <h1 className="text-lg font-bold tracking-tight">
          {isPermission
            ? "Você não tem permissão para ver esta página"
            : "Algo deu errado"}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {isPermission
            ? "Esta seção é exclusiva do proprietário da conta."
            : "Não foi possível carregar este conteúdo. Tente de novo em instantes."}
        </p>
      </div>
      <div className="flex gap-2">
        {!isPermission && (
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
        )}
        <Button asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}
