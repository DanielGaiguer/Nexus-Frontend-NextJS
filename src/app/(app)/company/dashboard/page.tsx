"use client";

import {
  Briefcase,
  FolderOpen,
  Handshake,
  Mail,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { MonthlyMatchesBars } from "@/components/dashboard/monthly-matches-bars";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "@/hooks/queries/useCompanyDashboard";
import { useCompanyDashboardSummary } from "@/hooks/queries/useCompanyDashboardSummary";
import { useCompanyProfile } from "@/hooks/queries/useCompanyProfile";
import { useMyProjects } from "@/hooks/queries/useMyProjects";
import { useReceivedInterests } from "@/hooks/queries/useCompanyMatches";

export default function CompanyDashboardPage() {
  const profile = useCompanyProfile();
  const summary = useCompanyDashboardSummary();
  const dashboard = useCompanyDashboard();
  const projects = useMyProjects();
  const received = useReceivedInterests();

  const openProjects = (projects.data ?? []).filter((p) => p.status === "OPEN");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.data ? (
            <>Olá, {profile.data.companyName} 👋</>
          ) : (
            <Skeleton className="h-8 w-56" />
          )}
        </h1>
        <p className="text-muted-foreground text-sm">
          {received.data && received.data.length > 0
            ? `Você tem ${received.data.length} interesse(s) aguardando resposta.`
            : "Bem-vindo de volta ao Nexus."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Mail}
          label="Interesses recebidos"
          value={String(received.data?.length ?? 0)}
          accent="accent"
        />
        <StatCard
          icon={Handshake}
          label="Matches confirmados"
          value={String(summary.data?.totalMatches ?? 0)}
          accent="success"
        />
        <StatCard
          icon={FolderOpen}
          label="Oportunidades abertas"
          value={String(openProjects.length)}
        />
        <StatCard
          icon={Briefcase}
          label="Total de oportunidades"
          value={String(
            summary.data?.totalProjects ?? projects.data?.length ?? 0
          )}
          accent="secondary"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">
            Últimos interesses recebidos
          </CardTitle>
          <Link
            href="/company/matches"
            className="text-primary text-xs font-semibold hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {received.isLoading ? (
            <Skeleton className="h-24" />
          ) : !received.data || received.data.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Nenhum interesse ainda"
              className="py-6"
            />
          ) : (
            <div className="divide-y">
              {received.data.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={match.professional.profilePhotoUrl ?? undefined}
                      alt=""
                    />
                    <AvatarFallback>
                      {match.professional.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {match.professional.name}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {match.project.title}
                    </div>
                  </div>
                  {match.scoreBreakdown && (
                    <Badge variant="secondary" className="tabular-nums">
                      {Math.round(match.scoreBreakdown.finalScore)}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {dashboard.data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4" />
                Matches por mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.data.matchesPerMonth.length > 0 ? (
                <MonthlyMatchesBars data={dashboard.data.matchesPerMonth} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Ainda sem histórico suficiente.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Skills mais requisitadas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dashboard.data.mostRequiredSkills.length > 0 ? (
                dashboard.data.mostRequiredSkills.map((skill) => (
                  <Badge key={skill.skillName} variant="secondary">
                    {skill.skillName} · {skill.projectCount}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum dado de demanda ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/company/projects/new"
          icon={Sparkles}
          title="Nova oportunidade"
          description="Publique uma vaga ou projeto"
        />
        <QuickLink
          href="/company/professionals"
          icon={Users}
          title="Buscar profissionais"
          description="Explore o diretório de talentos"
        />
        <QuickLink
          href="/company/profile"
          icon={Briefcase}
          title="Atualizar perfil"
          description="Mantenha os dados da empresa em dia"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="hover:border-primary/40 flex items-center gap-3 rounded-lg border p-4 transition-colors"
    >
      <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
    </Link>
  );
}
