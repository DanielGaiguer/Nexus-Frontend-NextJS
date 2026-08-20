"use client";

import { CircleCheck, Clock, Handshake, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { MonthlyMatchesBarChart } from "@/components/admin/monthly-matches-bar-chart";
import { SkillDemandRadarChart } from "@/components/admin/skill-demand-radar-chart";
import { UserCompositionChart } from "@/components/admin/user-composition-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDashboard } from "@/hooks/queries/useAdminDashboard";
import {
  useAdminPendingCompanies,
  useAdminLatestCompanies,
} from "@/hooks/queries/useAdminCompanies";
import { useAdminProjects } from "@/hooks/queries/useAdminProjects";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  APPROVED: { label: "Aprovada", variant: "default" },
  PENDING: { label: "Pendente", variant: "secondary" },
  REJECTED: { label: "Rejeitada", variant: "outline" },
};

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  const pending = useAdminPendingCompanies();
  const latest = useAdminLatestCompanies();
  const projects = useAdminProjects();

  const skillDemand = useMemo(() => {
    if (!projects.data) return [];
    const counts = new Map<string, number>();
    for (const project of projects.data) {
      for (const skill of project.requiredSkills) {
        counts.set(skill.name, (counts.get(skill.name) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([skillName, count]) => ({ skillName, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects.data]);

  if (dashboard.isLoading || !dashboard.data) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const d = dashboard.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Painel do Administrador
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão geral em tempo real da plataforma Nexus
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {d.totalUsers}
            </div>
            <div className="text-muted-foreground text-xs">
              Total de usuários
            </div>
            <div className="mt-1.5 text-xs">
              <span className="text-success font-medium">
                {d.totalProfessionals}
              </span>
              <span className="text-muted-foreground"> profissionais · </span>
              <span className="text-accent-foreground font-medium">
                {d.totalCompanies}
              </span>
              <span className="text-muted-foreground"> empresas</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {d.totalProjects}
            </div>
            <div className="text-muted-foreground text-xs">
              Total de oportunidades
            </div>
            <Badge variant="secondary" className="mt-1.5 text-[11px]">
              {d.totalOpenProjects} abertos
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {d.totalMatches}
            </div>
            <div className="text-muted-foreground text-xs">
              Total de matches
            </div>
            <Badge variant="secondary" className="mt-1.5 text-[11px]">
              {d.totalConfirmedMatches} confirmados
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div
              className={`text-2xl font-bold tabular-nums ${d.pendingCompanies > 0 ? "text-warning" : ""}`}
            >
              {d.pendingCompanies}
            </div>
            <div className="text-muted-foreground text-xs">
              Aguardando aprovação
            </div>
            <div className="text-warning mt-1.5 text-xs">
              {d.pendingCompanies > 0
                ? "empresas pendentes"
                : "nenhuma pendente"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4" />
              Taxa de conversão
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="text-primary text-4xl font-bold tabular-nums">
              {d.matchConversionRate.toFixed(1)}%
            </div>
            <Progress value={d.matchConversionRate} className="h-2 w-full" />
            <p className="text-muted-foreground text-center text-xs">
              dos matches gerados viraram conexões reais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4" />
              Composição de usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserCompositionChart
              totalProfessionals={d.totalProfessionals}
              totalCompanies={d.totalCompanies}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Handshake className="size-4" />
              Funil de matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelRow
              label="Total de matches"
              value={d.totalMatches}
              max={d.totalMatches}
              color="bg-primary"
            />
            <FunnelRow
              label="Confirmados"
              value={d.totalConfirmedMatches}
              max={d.totalMatches}
              color="bg-success"
            />
            <FunnelRow
              label="Oportunidades abertas"
              value={d.totalOpenProjects}
              max={d.totalProjects}
              color="bg-accent-foreground"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Matches por mês</CardTitle>
          </CardHeader>
          <CardContent>
            {d.monthlyMatches.length > 0 ? (
              <MonthlyMatchesBarChart data={d.monthlyMatches} />
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Ainda sem histórico suficiente.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Skills mais demandadas na plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillDemand.length > 0 ? (
              <SkillDemandRadarChart data={skillDemand} />
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhum dado de demanda ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Aguardando aprovação</CardTitle>
            <p className="text-muted-foreground text-xs">
              {d.pendingCompanies} empresa(s)
            </p>
          </div>
          <Link
            href="/admin/approvals"
            className="text-primary text-xs font-semibold hover:underline"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {!pending.data || pending.data.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="Nenhuma empresa pendente"
              className="py-6"
            />
          ) : (
            <div className="divide-y">
              {pending.data.slice(0, 5).map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage
                      src={company.profilePhotoUrl ?? undefined}
                      alt=""
                    />
                    <AvatarFallback>
                      {company.companyName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {company.companyName}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {[company.city, company.uf].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Clock className="size-3" />
                    Pendente
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">
            Últimas empresas cadastradas
          </CardTitle>
          <Link
            href="/admin/approvals"
            className="text-primary text-xs font-semibold hover:underline"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!latest.data || latest.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Nenhuma empresa cadastrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                latest.data.map((company) => {
                  const status = statusLabels[company.status] ?? {
                    label: company.status,
                    variant: "outline" as const,
                  };
                  return (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage
                              src={company.profilePhotoUrl ?? undefined}
                              alt=""
                            />
                            <AvatarFallback>
                              {company.companyName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {company.companyName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {company.taxId ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[company.city, company.uf]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="bg-muted h-1.5 rounded-full">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
