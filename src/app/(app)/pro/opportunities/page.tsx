"use client";

import { Eye, Handshake, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MatchCard } from "@/components/professional/match-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShowInterest } from "@/hooks/mutations/useShowInterest";
import { useOpportunities } from "@/hooks/queries/useOpportunities";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { ApiError } from "@/lib/api-client";

export default function OpportunitiesPage() {
  const { data: opportunities, isLoading } = useOpportunities();
  const { data: profile } = useProfessionalProfile();
  const showInterest = useShowInterest();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "JOB" | "PROJECT">(
    "ALL"
  );
  const [sentIds, setSentIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    if (!opportunities) return [];
    const term = search.trim().toLowerCase();
    return opportunities.filter((match) => {
      const matchesSearch =
        !term ||
        match.project.title.toLowerCase().includes(term) ||
        match.project.companyName.toLowerCase().includes(term);
      const matchesType =
        typeFilter === "ALL" || match.project.opportunityType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [opportunities, search, typeFilter]);

  function handleInterest(projectId: number) {
    showInterest.mutate(projectId, {
      onSuccess: () => {
        setSentIds((ids) => [...ids, projectId]);
        toast.success("Interesse enviado à empresa!");
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível enviar seu interesse."
        );
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Oportunidades</h1>
        <p className="text-muted-foreground text-sm">
          Vagas e projetos compatíveis com o seu perfil.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por título ou empresa..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="JOB">Vagas</SelectItem>
            <SelectItem value="PROJECT">Projetos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma oportunidade encontrada"
          description={
            opportunities && opportunities.length > 0
              ? "Tente ajustar a busca ou os filtros."
              : "Quando surgirem vagas ou projetos compatíveis com seu perfil, eles aparecerão aqui."
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((match) => {
          const alreadySent =
            sentIds.includes(match.project.id) ||
            match.professionalStatus === "INTERESTED";
          return (
            <MatchCard
              key={match.id}
              match={match}
              mySkills={profile?.skills}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/public/opportunity/${match.project.id}`}>
                      <Eye className="size-4" />
                      Ver detalhes
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    disabled={alreadySent || showInterest.isPending}
                    onClick={() => handleInterest(match.project.id)}
                  >
                    <Handshake className="size-4" />
                    {alreadySent ? "Interesse enviado" : "Demonstrar interesse"}
                  </Button>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
