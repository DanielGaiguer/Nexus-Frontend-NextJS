"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/mutations/useLogin";
import { ApiError } from "@/lib/api-client";
import { nexusUrlFrom } from "@/lib/portal-domain";
import { resolvePortalColor } from "@/components/custom-portal/portal-branding-view";

/**
 * Login enxuto dentro do portal — o profissional entra sem sair de
 * `empresa.nexus.com.br`. Posta em `/api/auth/login` (mesmo route handler do
 * app), que agora planta o cookie com `Domain=.nexus.com.br`, então a sessão
 * passa a valer também no subdomínio.
 */
export function PortalLoginDialog({
  open,
  onOpenChange,
  primaryColor,
  rootHost,
  onLoggedIn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryColor: string | null;
  /** Domínio raiz do Nexus (sem o subdomínio) — pra montar o link de cadastro. */
  rootHost: string;
  onLoggedIn: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const color = resolvePortalColor(primaryColor);

  function handleOpenChange(next: boolean) {
    if (next) {
      setEmail("");
      setPassword("");
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          onOpenChange(false);
          onLoggedIn();
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível entrar. Tente novamente."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar para se candidatar</DialogTitle>
          <DialogDescription>
            Use sua conta do Nexus. A candidatura acontece aqui mesmo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="portal-login-email">E-mail</Label>
            <Input
              id="portal-login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="portal-login-password">Senha</Label>
            <Input
              id="portal-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <Button
              type="submit"
              disabled={login.isPending || !email.trim() || !password}
              className="w-full text-white"
              style={{ background: color }}
            >
              {login.isPending ? "Entrando…" : "Entrar"}
            </Button>
            <a
              href={nexusUrlFrom(rootHost, "/register/professional")}
              className="text-center text-xs underline"
              style={{ color: "#64748b" }}
            >
              Não tem conta? Criar conta de profissional
            </a>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
