"use client";

import {
  ArrowLeft,
  FileText,
  GitCompare,
  Handshake,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CandidateCard } from "@/components/company/candidate-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyShowInterest } from "@/hooks/mutations/useCompanyMatchActions";
import { useProject } from "@/hooks/queries/useMyProjects";
import { useProjectRanking } from "@/hooks/queries/useProjectRanking";
import { ApiError } from "@/lib/api-client";

const statusBadge: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  COMPANY_INTERESTED: { label: "Convite enviado", variant: "secondary" },
  PROFESSIONAL_INTERESTED: { label: "Interesse recebido", variant: "default" },
  MATCHED: { label: "Confirmado", variant: "default" },
  REJECTED: { label: "Recusado", variant: "outline" },
};

export default function ProjectRankingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();

  const { data: project } = useProject(id);
  const { data: ranking, isLoading } = useProjectRanking(id);
  const showInterest = useCompanyShowInterest();
  const [selected, setSelected] = useState<number[]>([]);

  function toggleSelect(matchId: number) {
    setSelected((ids) =>
      ids.includes(matchId)
        ? ids.filter((i) => i !== matchId)
        : [...ids, matchId]
    );
  }

  function goToComparison() {
    if (selected.length < 2) {
      toast.error("Selecione ao menos 2 candidatos para comparar.");
      return;
    }
    router.push(
      `/company/projects/${id}/compare?matchIds=${selected.join(",")}`
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <Link
          href="/company/projects"
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para projetos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Ranking {project ? `— ${project.title}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Profissionais ordenados por compatibilidade com esta oportunidade.
        </p>
      </div>

      {selected.length > 0 && (
        <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3 text-sm">
          <span>{selected.length} candidato(s) selecionado(s)</span>
          <Button size="sm" onClick={goToComparison}>
            <GitCompare className="size-4" />
            Comparar selecionados
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && (!ranking || ranking.length === 0) && (
        <EmptyState
          icon={Users}
          title="Nenhum candidato no ranking ainda"
          description="O ranking é gerado automaticamente conforme profissionais compatíveis ficam disponíveis."
        />
      )}

      <div className="flex flex-col gap-3">
        {ranking?.map((match) => {
          const badge = statusBadge[match.status];
          return (
            <div key={match.id} className="flex items-start gap-2">
              <Checkbox
                className="mt-6"
                checked={selected.includes(match.id)}
                onCheckedChange={() => toggleSelect(match.id)}
                aria-label={`Selecionar ${match.professional.name} para comparação`}
              />
              <div className="flex-1">
                <CandidateCard
                  match={match}
                  showProject={false}
                  actions={
                    match.status === "WAITING" ? (
                      <Button
                        size="sm"
                        disabled={showInterest.isPending}
                        onClick={() =>
                          showInterest.mutate(match.id, {
                            onSuccess: () =>
                              toast.success("Convite enviado ao profissional!"),
                            onError: (error) =>
                              toast.error(
                                error instanceof ApiError
                                  ? error.message
                                  : "Não foi possível enviar o convite."
                              ),
                          })
                        }
                      >
                        <Handshake className="size-4" />
                        Convidar
                      </Button>
                    ) : match.status === "MATCHED" ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/company/professionals/${match.professional.id}`}
                          >
                            <User className="size-4" />
                            Ver perfil completo
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/api/professional/${match.professional.id}/resume`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText className="size-4" />
                            Currículo
                          </a>
                        </Button>
                        {badge && (
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        )}
                      </>
                    ) : badge ? (
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    ) : null
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
