"use client";

import { Tag, TagX, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSkillDialog } from "@/components/admin/create-skill-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSkill } from "@/hooks/mutations/useAdminSkillActions";
import { useAdminSkills } from "@/hooks/queries/useAdminSkills";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AdminSkillDTO } from "@/types/admin";

export default function AdminSkillsPage() {
  const { data: skills, isLoading } = useAdminSkills();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set((skills ?? []).map((s) => s.category));
    return Array.from(set).sort();
  }, [skills]);

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const map = new Map<string, AdminSkillDTO[]>();
    for (const skill of skills ?? []) {
      if (category !== "all" && skill.category !== category) continue;
      const categoryMatches =
        !term || skill.category.toLowerCase().includes(term);
      const nameMatches = !term || skill.name.toLowerCase().includes(term);
      if (!categoryMatches && !nameMatches) continue;
      const list = map.get(skill.category) ?? [];
      // Se o termo bate com a categoria inteira, mostra todas as skills dela;
      // senão, só as que batem no nome.
      if (categoryMatches || nameMatches) list.push(skill);
      map.set(skill.category, list);
    }
    return map;
  }, [skills, search, category]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerenciamento de Skills
          </h1>
          <p className="text-muted-foreground text-sm">
            {skills?.length ?? 0} skills cadastradas
          </p>
        </div>
        <CreateSkillDialog existingCategories={categories} />
      </div>

      <Input
        placeholder="Buscar por nome ou categoria..."
        className="max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            category === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-accent"
          )}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              category === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!isLoading && (!skills || skills.length === 0) && (
        <EmptyState icon={TagX} title="Nenhuma skill cadastrada" />
      )}

      {!isLoading && skills && skills.length > 0 && grouped.size === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nenhuma skill encontrada.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Tag className="text-primary size-4" />
                {cat}
                <Badge variant="secondary">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <SkillChip key={skill.id} skill={skill} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkillChip({ skill }: { skill: AdminSkillDTO }) {
  const deleteSkill = useDeleteSkill();

  return (
    <AlertDialog>
      <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs font-medium">
        {skill.name}
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="hover:text-destructive rounded-full p-1"
            aria-label={`Remover ${skill.name}`}
          >
            <X className="size-3" />
          </button>
        </AlertDialogTrigger>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover skill</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja remover a skill <strong>{skill.name}</strong>? Profissionais
            e projetos que a utilizam perderão essa associação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteSkill.isPending}
            className="bg-destructive hover:bg-destructive/90"
            onClick={() =>
              deleteSkill.mutate(skill.id, {
                onSuccess: () => toast.success("Skill removida com sucesso!"),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível remover a skill."
                  ),
              })
            }
          >
            {deleteSkill.isPending ? "Removendo…" : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
