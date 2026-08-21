"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ProjectForm } from "@/components/company/project-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/queries/useMyProjects";

export default function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(Number(projectId));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <Link
          href="/company/projects"
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para projetos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar Oportunidade
        </h1>
        <p className="text-muted-foreground text-sm">
          Escolha o tipo de oportunidade e preencha os dados correspondentes
        </p>
      </div>
      <div className="bg-info/10 text-foreground rounded-md p-3 text-sm">
        Ao salvar, os scores dos matches em aberto serão recalculados
        automaticamente.
      </div>
      {isLoading || !project ? (
        <Skeleton className="h-96" />
      ) : (
        <ProjectForm editing={project} />
      )}
    </div>
  );
}
