"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { ProposalDetails } from "@/components/matches/proposal-details";
import { ProposalForm } from "@/components/professional/proposal-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProposals } from "@/hooks/queries/useProposals";
import { usePublicOpportunity } from "@/hooks/queries/usePublicOpportunity";
import { proposalStatusLabels } from "@/types/proposal";

export default function SendProposalPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();
  const [creatingNew, setCreatingNew] = useState(false);

  const { data: project, isLoading: isLoadingProject } =
    usePublicOpportunity(id);
  const { data: myProposals, isLoading: isLoadingProposals } = useMyProposals();

  const isLoading = isLoadingProject || isLoadingProposals;

  // A mais recente entre as propostas desse profissional pra esse projeto --
  // pode ter mais de uma ao longo do tempo (retirada/expirada e reenviada).
  const latest = myProposals
    ?.filter((p) => p.projectId === id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const editing = latest?.status === "PENDING" ? latest : undefined;
  // Proposta anterior não-pendente: só visualização (não dá pra editar uma
  // proposta já decidida) -- "Enviar nova proposta" troca pro formulário em
  // branco, já que o backend permite reenvio depois de uma proposta terminal.
  const showPastReadOnly =
    latest != null && latest.status !== "PENDING" && !creatingNew;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
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
          {editing
            ? "Editar proposta"
            : showPastReadOnly
              ? "Sua proposta"
              : "Enviar proposta"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {project?.title ??
            (isLoading ? "Carregando..." : "Oportunidade não encontrada")}
        </h1>
        {project?.companyName && (
          <p className="text-muted-foreground text-sm">{project.companyName}</p>
        )}
      </div>

      {isLoading && <Skeleton className="h-96" />}

      {!isLoading && (!project || !project.acceptsProposals) && (
        <p className="text-muted-foreground text-sm">
          Esta oportunidade não aceita propostas.
        </p>
      )}

      {!isLoading &&
        project &&
        project.acceptsProposals &&
        showPastReadOnly && (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <Badge
                variant={
                  latest.status === "REJECTED" ? "destructive" : "outline"
                }
                className="w-fit"
              >
                {latest.autoRejectedPositionFilled
                  ? "Vaga preenchida"
                  : proposalStatusLabels[latest.status]}
              </Badge>
              <ProposalDetails proposal={latest} />
              <div className="flex justify-end border-t pt-4">
                <Button size="sm" onClick={() => setCreatingNew(true)}>
                  <FileText className="size-4" />
                  Enviar nova proposta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {!isLoading &&
        project &&
        project.acceptsProposals &&
        !showPastReadOnly && (
          <ProposalForm project={project} editing={editing} />
        )}
    </div>
  );
}
