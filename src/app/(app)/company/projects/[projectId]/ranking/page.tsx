"use client";

import {
  ArrowLeft,
  DollarSign,
  FileText,
  GitCompare,
  Handshake,
  MapPin,
  Search,
  User,
  Users,
  X,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/queries/useMyProjects";
import { useCompanyShowInterest } from "@/hooks/mutations/useCompanyMatchActions";
import {
  type RankingFilters,
  useProjectRanking,
} from "@/hooks/queries/useProjectRanking";
import { ApiError } from "@/lib/api-client";

const MAX_COMPARE = 5;

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const experienceLevels = [
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const ufList = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const statusBadge: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  COMPANY_INTERESTED: { label: "Convite enviado", variant: "secondary" },
  PROFESSIONAL_INTERESTED: { label: "Interesse recebido", variant: "default" },
  MATCHED: { label: "Confirmado", variant: "default" },
  REJECTED: { label: "Recusado", variant: "outline" },
};

const initialFilters: RankingFilters = {};

export default function ProjectRankingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();

  const { data: project } = useProject(id);
  const [filters, setFilters] = useState<RankingFilters>(initialFilters);
  const [pendingFilters, setPendingFilters] =
    useState<RankingFilters>(initialFilters);
  const { data: ranking, isLoading } = useProjectRanking(id, filters);
  const showInterest = useCompanyShowInterest();
  const [selected, setSelected] = useState<number[]>([]);

  function toggleSelect(matchId: number) {
    setSelected((ids) => {
      if (ids.includes(matchId)) return ids.filter((i) => i !== matchId);
      if (ids.length >= MAX_COMPARE) {
        toast.error(`Você pode comparar no máximo ${MAX_COMPARE} candidatos.`);
        return ids;
      }
      return [...ids, matchId];
    });
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

  function applyFilters() {
    setFilters(pendingFilters);
  }

  function clearFilters() {
    setPendingFilters(initialFilters);
    setFilters(initialFilters);
  }

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
          Ranking de Profissionais
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{project?.title}</h1>
        {ranking && project && (
          <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {ranking.length} profissionais classificados
            </span>
            {project.workMode && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {modalityLabels[project.workMode] ?? project.workMode}
              </span>
            )}
            {project.minimumBudget != null && project.maximumBudget != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {project.minimumBudget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
                –
                {project.maximumBudget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Cidade (ex: São Paulo)"
            value={pendingFilters.city ?? ""}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, city: e.target.value }))
            }
          />
          <Select
            value={pendingFilters.uf ?? "ALL"}
            onValueChange={(v) =>
              setPendingFilters((f) => ({
                ...f,
                uf: v === "ALL" ? undefined : v,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {ufList.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={pendingFilters.experienceLevel ?? "ALL"}
            onValueChange={(v) =>
              setPendingFilters((f) => ({
                ...f,
                experienceLevel: v === "ALL" ? undefined : v,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Experiência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {experienceLevels.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={
              pendingFilters.available == null
                ? "ALL"
                : String(pendingFilters.available)
            }
            onValueChange={(v) =>
              setPendingFilters((f) => ({
                ...f,
                available: v === "ALL" ? undefined : v === "true",
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="true">Disponível</SelectItem>
              <SelectItem value="false">Indisponível</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="number"
            placeholder="Salário mín."
            value={pendingFilters.minSalary ?? ""}
            onChange={(e) =>
              setPendingFilters((f) => ({
                ...f,
                minSalary: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Salário máx."
            value={pendingFilters.maxSalary ?? ""}
            onChange={(e) =>
              setPendingFilters((f) => ({
                ...f,
                maxSalary: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            placeholder="Skill (ex: Java)"
            value={pendingFilters.skill ?? ""}
            onChange={(e) =>
              setPendingFilters((f) => ({ ...f, skill: e.target.value }))
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="size-4" />
            Limpar
          </Button>
          <Button type="button" size="sm" onClick={applyFilters}>
            <Search className="size-4" />
            Filtrar
          </Button>
        </div>
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
          title="Nenhum profissional no ranking"
          description="Ainda não há profissionais elegíveis para este projeto. O ranking é gerado automaticamente quando profissionais se cadastram."
        />
      )}

      <div className="flex flex-col gap-3">
        {ranking?.map((match, index) => {
          const badge = statusBadge[match.status];
          const canViewProfile = match.status !== "REJECTED";
          return (
            <div key={match.id} className="flex items-start gap-2">
              <span className="text-muted-foreground/40 w-8 pt-6 text-center text-xl font-bold">
                #{index + 1}
              </span>
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
                    <>
                      {canViewProfile && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={
                              match.status === "MATCHED"
                                ? `/company/professionals/${match.professional.id}`
                                : `/public/professional/${match.professional.id}`
                            }
                          >
                            <User className="size-4" />
                            Ver perfil completo
                          </Link>
                        </Button>
                      )}
                      {match.status === "MATCHED" && (
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
                      )}
                      {match.status === "WAITING" ? (
                        <Button
                          size="sm"
                          disabled={showInterest.isPending}
                          onClick={() =>
                            showInterest.mutate(match.id, {
                              onSuccess: () =>
                                toast.success(
                                  "Convite enviado ao profissional!"
                                ),
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
                          Demonstrar interesse
                        </Button>
                      ) : (
                        badge && (
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        )
                      )}
                    </>
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
