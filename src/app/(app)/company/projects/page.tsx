"use client";

import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/company/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyProjects } from "@/hooks/queries/useMyProjects";
import type { ProjectStatus } from "@/types/project";

const tabs: { value: "ALL" | ProjectStatus; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "OPEN", label: "Aberto" },
  { value: "PAUSED", label: "Pausado" },
  { value: "CLOSED", label: "Encerrado" },
];

export default function ProjectsPage() {
  const { data: projects, isLoading } = useMyProjects();
  const [status, setStatus] = useState<"ALL" | ProjectStatus>("ALL");

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (status === "ALL") return projects;
    return projects.filter((p) => p.status === status);
  }, [projects, status]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Minhas Oportunidades
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as vagas e projetos publicados pela sua empresa
          </p>
        </div>
        <Button asChild>
          <Link href="/company/projects/new">
            <Plus className="size-4" />
            Nova oportunidade
          </Link>
        </Button>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhuma oportunidade encontrada"
              description="Publique uma vaga ou projeto para começar a receber matches."
              action={
                <Button asChild size="sm">
                  <Link href="/company/projects/new">Nova oportunidade</Link>
                </Button>
              }
            />
          ) : (
            filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
