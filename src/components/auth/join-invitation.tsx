"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, TriangleAlert, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { LegalConsentFields } from "@/components/auth/legal-consent-fields";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAcceptInvitation } from "@/hooks/mutations/useCompanyMemberActions";
import { ApiError } from "@/lib/api-client";
import {
  type JoinInvitationFormValues,
  joinInvitationSchema,
} from "@/lib/validation";

/** Lê (sem verificar assinatura — é só pra exibir) o e-mail do token do convite. */
function emailFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as { email?: unknown };
    return typeof claims.email === "string" ? claims.email : null;
  } catch {
    return null;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 block text-lg font-bold tracking-tight">
          nexus<span className="text-primary">.</span>
        </Link>
        {children}
      </div>
    </div>
  );
}

export function JoinInvitation() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const invitedEmail = token ? emailFromToken(token) : null;

  const accept = useAcceptInvitation();
  const [error, setError] = useState<string | null>(null);
  const [joinedCompany, setJoinedCompany] = useState<string | null>(null);

  const form = useForm<JoinInvitationFormValues>({
    resolver: zodResolver(joinInvitationSchema),
    defaultValues: {
      password: "",
      acceptedTermsOfUse: false,
      acceptedMarketingCommunications: false,
      acceptedAlgorithmImprovement: false,
    },
    mode: "onChange",
  });

  if (!token) {
    return (
      <Shell>
        <div className="space-y-3">
          <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
            <TriangleAlert className="size-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Convite inválido</h1>
          <p className="text-muted-foreground text-sm">
            O link do convite está incompleto — o token está ausente. Peça um
            novo convite ao proprietário da conta.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  if (joinedCompany) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Você entrou na equipe!
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sua conta de membro de <strong>{joinedCompany}</strong> foi
              criada. Redirecionando para o painel…
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => router.replace("/company/dashboard")}
          >
            Ir para o painel
          </Button>
        </div>
      </Shell>
    );
  }

  function onSubmit(values: JoinInvitationFormValues) {
    setError(null);
    accept.mutate(
      { token, ...values },
      {
        onSuccess: (session) => {
          setJoinedCompany(session.name);
          router.replace("/company/dashboard");
        },
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível concluir o convite. Tente novamente."
          );
        },
      }
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
          <UserPlus className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Você foi convidado para uma equipe
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {invitedEmail ? (
              <>
                O convite é para <strong>{invitedEmail}</strong>. Defina uma
                senha para criar sua conta de membro.
              </>
            ) : (
              <>Defina uma senha para criar sua conta de membro.</>
            )}
          </p>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <LegalConsentFields />

            <Button
              type="submit"
              className="w-full"
              disabled={accept.isPending || !form.formState.isValid}
            >
              {accept.isPending ? "Entrando…" : "Aceitar convite e entrar"}
            </Button>
          </form>
        </Form>

        <p className="text-muted-foreground text-center text-xs">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </Shell>
  );
}
