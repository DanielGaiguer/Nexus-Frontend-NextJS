import { Paperclip } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProposalResponseDTO } from "@/types/proposal";

const experienceLevelLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

/**
 * Conteúdo completo de uma proposta -- reaproveitado tanto pelo "Ver proposta completa" da
 * comparação da empresa (ProposalCard) quanto pelo painel de proposta aceita nas telas de match
 * confirmado dos dois lados (AcceptedProposalPanel), pra nunca divergir o que cada lado vê.
 */
export function ProposalDetails({
  proposal,
}: {
  proposal: ProposalResponseDTO;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-muted-foreground text-xs">Valor proposto</div>
          <div className="font-semibold">
            {formatCurrency(proposal.proposedValue)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Prazo estimado</div>
          <div className="font-semibold">{proposal.estimatedDays} dias</div>
        </div>
        {proposal.professionalExperienceLevel && (
          <div>
            <div className="text-muted-foreground text-xs">Experiência</div>
            <div className="font-semibold">
              {experienceLevelLabels[proposal.professionalExperienceLevel] ??
                proposal.professionalExperienceLevel}
            </div>
          </div>
        )}
        {formatDate(proposal.proposedStartDate) && (
          <div>
            <div className="text-muted-foreground text-xs">Início proposto</div>
            <div className="font-semibold">
              {formatDate(proposal.proposedStartDate)}
            </div>
          </div>
        )}
        {formatDate(proposal.proposedDeliveryDate) && (
          <div>
            <div className="text-muted-foreground text-xs">
              Entrega proposta
            </div>
            <div className="font-semibold">
              {formatDate(proposal.proposedDeliveryDate)}
            </div>
          </div>
        )}
      </div>

      {proposal.skills.length > 0 && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Tecnologias
          </div>
          <div className="flex flex-wrap gap-1">
            {proposal.skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-[11px]">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-muted-foreground mb-1 text-xs uppercase">
          Como pretende resolver
        </div>
        <p className="whitespace-pre-wrap">{proposal.description}</p>
      </div>

      {proposal.relevantExperience && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Experiência relevante
          </div>
          <p className="whitespace-pre-wrap">{proposal.relevantExperience}</p>
        </div>
      )}

      {proposal.executionSteps.length > 0 && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Etapas de execução
          </div>
          <ol className="list-inside list-decimal space-y-1">
            {proposal.executionSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {proposal.deliverables && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Entregáveis
          </div>
          <p className="whitespace-pre-wrap">{proposal.deliverables}</p>
        </div>
      )}

      {proposal.paymentTerms && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Condições de pagamento
          </div>
          <p className="whitespace-pre-wrap">{proposal.paymentTerms}</p>
        </div>
      )}

      {proposal.questionsForCompany && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Perguntas ao contratante
          </div>
          <p className="whitespace-pre-wrap">{proposal.questionsForCompany}</p>
        </div>
      )}

      {proposal.attachments.length > 0 && (
        <div>
          <div className="text-muted-foreground mb-1 text-xs uppercase">
            Anexos / portfólio
          </div>
          <div className="flex flex-col gap-1">
            {proposal.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 hover:underline"
              >
                <Paperclip className="size-3.5 shrink-0" />
                <span className="truncate">{attachment.fileName}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
