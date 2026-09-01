import {
  BadgeCheck,
  Clock,
  HelpCircle,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MatchConfirmationDTO } from "@/types/match";

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const reasonText: Record<string, string> = {
  VALUE_DIVERGENCE: "valores divergentes",
  NO_RESPONSE: "sem resposta no prazo",
  COMPLETION_DISAGREEMENT: "divergência sobre a conclusão",
};

/**
 * Indicador do status da janela de confirmação pós-contratação, para os cards de
 * match dos dois lados. Não renderiza nada enquanto a janela não abriu.
 */
export function MatchConfirmationBadge({
  confirmation,
}: {
  confirmation: MatchConfirmationDTO | null | undefined;
}) {
  if (!confirmation) return null;

  switch (confirmation.status) {
    case "AWAITING_RESPONSES":
      return confirmation.viewerAnswered === false ? (
        <Badge className="bg-warning/15 text-warning">
          <Clock className="size-3" />
          Confirmação pendente — responda
        </Badge>
      ) : (
        <Badge variant="secondary">
          <Clock className="size-3" />
          Aguardando o outro lado confirmar
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge className="bg-success/15 text-success">
          <BadgeCheck className="size-3" />
          Valor confirmado
          {confirmation.confirmedAmount != null &&
            ` · ${money(confirmation.confirmedAmount)}`}
        </Badge>
      );
    case "PENDING_ADMIN_REVIEW":
      return (
        <Badge className="bg-destructive/15 text-destructive">
          <ShieldAlert className="size-3" />
          Em análise pelo suporte
          {confirmation.pendingReason &&
            ` (${reasonText[confirmation.pendingReason] ?? "revisão"})`}
        </Badge>
      );
    case "CLOSED_NO_CHARGE":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <XCircle className="size-3" />
          Encerrada sem cobrança
        </Badge>
      );
    case "CLOSED_UNRESOLVED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <XCircle className="size-3" />
          Encerrada sem confirmação
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <HelpCircle className="size-3" />
          {confirmation.status}
        </Badge>
      );
  }
}
