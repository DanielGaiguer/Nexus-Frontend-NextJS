import { FileCheck } from "lucide-react";

import { ProposalDetails } from "@/components/matches/proposal-details";
import type { ProposalResponseDTO } from "@/types/proposal";

/**
 * Mostra a proposta que originou este match, sempre que ele foi confirmado via aceite de uma
 * Proposal (Match.acceptedProposal) -- renderizado tanto na tela de matches confirmados da
 * empresa quanto na do profissional, pra proposta aceita ficar permanentemente vinculada e
 * visível pros dois lados, não só um indicador de "foi por proposta".
 */
export function AcceptedProposalPanel({
  proposal,
}: {
  proposal: ProposalResponseDTO;
}) {
  return (
    <div className="bg-muted/30 space-y-3 rounded-md border p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <FileCheck className="size-3.5" />
        Proposta aceita
      </div>
      <ProposalDetails proposal={proposal} />
    </div>
  );
}
