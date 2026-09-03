"use client";

import { CheckCircle2, Home, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useConfirmAccountDeletion } from "@/hooks/mutations/useAccountDeletion";
import { ApiError } from "@/lib/api-client";

export function ConfirmAccountDeletion() {
  const token = useSearchParams().get("token") ?? "";
  const confirm = useConfirmAccountDeletion();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    confirm.mutate(
      { token },
      {
        onSuccess: () => setDone(true),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível concluir a exclusão. Tente novamente."
          ),
      }
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 block text-lg font-bold tracking-tight">
          nexus<span className="text-primary">.</span>
        </Link>

        {done ? (
          <div className="space-y-4">
            <div className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Conta excluída
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Seus dados pessoais foram anonimizados. Matches, avaliações e
                conversas anteriores passam a exibir “Usuário removido”.
                Registros fiscais e financeiros já emitidos são mantidos pelo
                prazo exigido por lei.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="size-4" />
                Ir para a Home
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
              <TriangleAlert className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Confirmar exclusão da conta
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Ao confirmar, seus dados pessoais serão anonimizados de forma
                permanente. Esta ação não pode ser desfeita.
              </p>
            </div>

            {!token ? (
              <p className="text-destructive text-sm">
                Link inválido — o token de confirmação está ausente. Solicite a
                exclusão novamente pelo seu perfil.
              </p>
            ) : (
              <>
                {error ? (
                  <p className="text-destructive text-sm">{error}</p>
                ) : null}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={confirm.isPending}
                >
                  {confirm.isPending
                    ? "Excluindo…"
                    : "Confirmar exclusão permanente"}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Cancelar</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
