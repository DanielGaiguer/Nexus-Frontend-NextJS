"use client";

import { Download, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Portabilidade de dados (LGPD, art. 18, V). Baixa um JSON estruturado com
 * todos os dados pessoais do próprio titular. O download é um GET direto para
 * o Route Handler (o cookie httpOnly viaja sozinho); o backend responde com
 * Content-Disposition: attachment e dispara um e-mail de aviso.
 */
export function ExportDataCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="text-primary size-4" />
          Meus dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Baixe uma cópia de todos os seus dados pessoais no Nexus (perfil,
          portfólio, matches, propostas, avaliações, mensagens que você enviou,
          histórico de consentimentos e cobranças) em formato JSON. Um e-mail de
          aviso é enviado quando você solicita a exportação.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href="/api/users/me/export" download>
            <Download className="size-4" />
            Baixar meus dados (JSON)
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
