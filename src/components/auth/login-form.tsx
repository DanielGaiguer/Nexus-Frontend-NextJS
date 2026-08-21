"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LogIn, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { GitHubIcon, LinkedInIcon } from "@/components/auth/brand-icons";
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
import { useLogin } from "@/hooks/mutations/useLogin";
import { ApiError } from "@/lib/api-client";
import { type LoginFormValues, loginSchema } from "@/lib/validation";
import type { UserRole } from "@/types/auth";

const roleHome: Record<UserRole, string> = {
  PROFESSIONAL: "/pro/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

// Espelha os `th:with` de login.html — mensagens que o backend manda de
// volta via query string depois do callback OAuth (AuthService#handle*Callback).
const linkedinErrorMessages: Record<string, string> = {
  no_account:
    "Nenhuma conta encontrada com o e-mail do seu LinkedIn. Cadastre-se primeiro.",
  denied: "Login com LinkedIn cancelado.",
  pending_approval:
    "Cadastro de empresa aguardando aprovação do administrador.",
  rejected: "Cadastro de empresa foi rejeitado.",
  inactive: "Esta conta está inativa.",
  session_expired: "Sua sessão expirou. Faça login novamente.",
  no_email:
    "Seu LinkedIn não retornou um e-mail verificado. Tente com outra conta ou cadastre-se manualmente.",
};
const linkedinErrorFallback =
  "Não foi possível entrar com o LinkedIn. Tente novamente.";

const githubErrorMessages: Record<string, string> = {
  no_account:
    "Nenhuma conta encontrada com o e-mail do seu GitHub. Cadastre-se primeiro.",
  not_professional: "Login com GitHub disponível apenas para profissionais.",
  denied: "Login com GitHub cancelado.",
  inactive: "Esta conta está inativa.",
  session_expired: "Sua sessão expirou. Faça login novamente.",
  email_in_use:
    "Este e-mail já está cadastrado no Nexus. Faça login e conecte o GitHub pelo seu perfil.",
  no_email:
    "Seu GitHub não tem um e-mail público. Torne um e-mail público em github.com/settings/emails e tente novamente.",
};
const githubErrorFallback =
  "Não foi possível entrar com o GitHub. Tente novamente.";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const linkedinError = searchParams.get("linkedinError");
    if (linkedinError) {
      toast.error(
        linkedinErrorMessages[linkedinError] ?? linkedinErrorFallback
      );
    }
    const githubError = searchParams.get("githubError");
    if (githubError) {
      toast.error(githubErrorMessages[githubError] ?? githubErrorFallback);
    }
    // Só na primeira renderização — não quero disparar de novo a cada
    // re-render por causa de outras mudanças em searchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectParam = searchParams.get("redirect");
  const oauthQuery = redirectParam
    ? `?redirect=${encodeURIComponent(redirectParam)}`
    : "";

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onSuccess: (session) => {
        toast.success(`Bem-vindo de volta, ${session.name}!`);
        const redirect = searchParams.get("redirect");
        router.push(
          redirect && redirect.startsWith("/")
            ? redirect
            : roleHome[session.role]
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível entrar. Tente novamente."
        );
      },
    });
  }

  return (
    <AuthCard
      icon={User}
      title="Bem-vindo de volta"
      description="Entre com suas credenciais para continuar"
      footer={
        <div className="space-y-2">
          <p>Ainda não tem conta?</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/register/professional">
                <UserPlus className="size-4" />
                Sou Profissional
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/register/company">
                <Building2 className="size-4" />
                Sou Empresa
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={login.isPending}>
            <LogIn className="size-4" />
            {login.isPending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-2">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">ou</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <Button
        asChild
        className="w-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
      >
        <a href={`/api/auth/linkedin/login${oauthQuery}`}>
          <LinkedInIcon className="size-4" />
          Entrar com LinkedIn
        </a>
      </Button>
      <Button
        asChild
        className="w-full bg-[#24292f] text-white hover:bg-[#24292f]/90"
      >
        <a href={`/api/auth/github/login${oauthQuery}`}>
          <GitHubIcon className="size-4" />
          Entrar com GitHub
        </a>
      </Button>
    </AuthCard>
  );
}
