"use client";

import { ArrowLeft, FileEdit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { ProposalCard } from "@/components/company/proposal-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/queries/useMyProjects";
import { useProjectRanking } from "@/hooks/queries/useProjectRanking";
import { useProjectProposals } from "@/hooks/queries/useProposals";

export default function ProjectProposalsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();

  const { data: project } = useProject(id);
  const { data: proposals, isLoading } = useProjectProposals(id);
  // Ranking já devolve todos os matches do projeto (qualquer status) --
  // reaproveitado só pra achar o Match por trás de cada proposta (via
  // proposal.matchId), pros botões de "Ver profissional" e "Comparar".
  const { data: matches } = useProjectRanking(id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          Propostas Recebidas
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{project?.title}</h1>
        {proposals && (
          <p className="text-muted-foreground mt-1 text-sm">
            {proposals.length} proposta(s) recebida(s)
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      )}

      {!isLoading && (!proposals || proposals.length === 0) && (
        <EmptyState
          icon={FileEdit}
          title="Nenhuma proposta recebida ainda"
          description="Quando profissionais enviarem propostas para este projeto, elas aparecerão aqui para comparação."
        />
      )}

      <div className="flex flex-col gap-3">
        {proposals?.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            match={matches?.find((m) => m.id === proposal.matchId)}
          />
        ))}
      </div>
    </div>
  );
}
