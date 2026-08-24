"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { ProposalForm } from "@/components/professional/proposal-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProposals } from "@/hooks/queries/useProposals";
import { usePublicOpportunity } from "@/hooks/queries/usePublicOpportunity";

export default function SendProposalPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();

  const { data: project, isLoading: isLoadingProject } =
    usePublicOpportunity(id);
  const { data: myProposals, isLoading: isLoadingProposals } = useMyProposals();

  const isLoading = isLoadingProject || isLoadingProposals;
  const editing = myProposals?.find(
    (p) => p.projectId === id && p.status === "PENDING"
  );

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
          {editing ? "Editar proposta" : "Enviar proposta"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {project?.title ?? "Carregando..."}
        </h1>
        {project?.companyName && (
          <p className="text-muted-foreground text-sm">{project.companyName}</p>
        )}
      </div>

      {isLoading && <Skeleton className="h-96" />}

      {!isLoading && project && !project.acceptsProposals && (
        <p className="text-muted-foreground text-sm">
          Esta oportunidade não aceita propostas.
        </p>
      )}

      {!isLoading && project && project.acceptsProposals && (
        <ProposalForm project={project} editing={editing} />
      )}
    </div>
  );
}
