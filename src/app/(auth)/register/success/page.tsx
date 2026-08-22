import { CheckCircle2, Clock4, Home } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Cadastro enviado — Nexus" };

export default function RegisterSuccessPage() {
  return (
    <AuthCard
      icon={CheckCircle2}
      iconClassName="bg-success/10 text-success"
      title="Cadastro enviado!"
      description="Sua solicitação foi recebida com sucesso."
    >
      <div className="bg-primary/5 border-primary/15 text-foreground flex items-start gap-2 rounded-md border p-3 text-sm">
        <Clock4 className="text-primary mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Aprovação pendente</p>
          <p className="text-muted-foreground text-xs">
            Um administrador analisará seu cadastro em breve.
          </p>
        </div>
      </div>
      <Button asChild className="w-full">
        <Link href="/">
          <Home className="size-4" />
          Voltar para Home
        </Link>
      </Button>
    </AuthCard>
  );
}
