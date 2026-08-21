"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LogIn, Mail, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Mail className="size-3.5" />
        Login com LinkedIn/GitHub chega numa próxima etapa desta migração.
      </div>
    </AuthCard>
  );
}
