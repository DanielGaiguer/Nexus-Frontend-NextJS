"use client";

import {
  Award,
  Bell,
  Briefcase,
  Handshake,
  MailOpen,
  Map,
  User,
} from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { PendingReviewDialog } from "@/components/matches/pending-review-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchInvites, useMatches } from "@/hooks/queries/useMatches";
import { usePreviousProjects } from "@/hooks/queries/usePreviousProjects";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { useProfessionalStats } from "@/hooks/queries/useProfessionalStats";
import { clampScore } from "@/lib/utils";

export default function ProDashboardPage() {
  const profile = useProfessionalProfile();
  const invites = useMatchInvites();
  const allMatches = useMatches();
  const previousProjects = usePreviousProjects();
  const stats = useProfessionalStats();

  const confirmed = (allMatches.data ?? []).filter(
    (m) => m.status === "MATCHED"
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PendingReviewDialog role="professional" active />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.data ? (
            <>Olá, {profile.data.name} 👋</>
          ) : (
            <Skeleton className="h-8 w-56" />
          )}
        </h1>
        <p className="text-muted-foreground text-sm">
          {invites.data && invites.data.length > 0
            ? `Você tem ${invites.data.length} convite(s) aguardando sua resposta.`
            : "Bem-vindo de volta ao Nexus."}
        </p>
      </div>

      {profile.data && profile.data.available === false && (
        <div className="bg-info/10 flex flex-wrap items-center justify-between gap-2 rounded-md p-3 text-sm">
          <span className="text-foreground">
            Sua conta está marcada como indisponível. Vá para Meu Perfil e
            marque como disponível caso deseje participar do cálculo de
            compatibilidade com as oportunidades.
          </span>
          <Link
            href="/pro/profile"
            className="text-primary shrink-0 font-medium hover:underline"
          >
            Meu Perfil
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Bell}
          label="Convites Pendentes"
          value={String(invites.data?.length ?? 0)}
          accent="accent"
        />
        <StatCard
          icon={Handshake}
          label="Matches Confirmados"
          value={String(confirmed.length)}
          accent="success"
        />
        <StatCard
          icon={Briefcase}
          label="Vagas Disponíveis"
          value={String(stats.data?.availableOpportunitiesCount ?? 0)}
        />
        <StatCard
          icon={Award}
          label="Projetos Entregues"
          value={String(previousProjects.data?.length ?? 0)}
          accent="secondary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Últimos Convites</CardTitle>
              <p className="text-muted-foreground text-xs">
                Contratantes com interesse no seu perfil
              </p>
            </div>
            <Link
              href="/pro/matches"
              className="text-primary text-xs font-semibold hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {invites.isLoading ? (
              <Skeleton className="h-24" />
            ) : !invites.data || invites.data.length === 0 ? (
              <EmptyState
                icon={MailOpen}
                title="Nenhum convite ainda"
                className="py-6"
                action={
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/pro/opportunities">Ver oportunidades</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y">
                {invites.data.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={
                          match.project.company?.profilePhotoUrl ?? undefined
                        }
                        alt=""
                      />
                      <AvatarFallback>
                        {match.project.companyName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {match.project.title}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {match.project.companyName}
                      </div>
                    </div>
                    {match.scoreBreakdown && (
                      <Badge variant="secondary" className="tabular-nums">
                        {Math.round(
                          clampScore(match.scoreBreakdown.finalScore)
                        )}
                        %
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Matches Confirmados</CardTitle>
              <p className="text-muted-foreground text-xs">
                Contatos já liberados para você
              </p>
            </div>
            <Link
              href="/pro/matches"
              className="text-primary text-xs font-semibold hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {allMatches.isLoading ? (
              <Skeleton className="h-24" />
            ) : confirmed.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="Nenhum match confirmado ainda"
                className="py-6"
              />
            ) : (
              <div className="divide-y">
                {confirmed.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={
                          match.project.company?.profilePhotoUrl ?? undefined
                        }
                        alt=""
                      />
                      <AvatarFallback>
                        {match.project.companyName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {match.project.title}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {match.project.companyName}
                      </div>
                      {match.project.company?.contactEmail && (
                        <div className="text-primary truncate text-xs">
                          {match.project.company.contactEmail}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-success/15 text-success">
                      Match Confirmado
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/pro/profile"
          icon={User}
          title="Atualizar perfil"
          description="Mantenha skills e disponibilidade em dia"
        />
        <QuickLink
          href="/pro/portfolio"
          icon={Briefcase}
          title="Ver portfólio"
          description="Adicione projetos anteriores para aumentar seu score"
        />
        <QuickLink
          href="/pro/map"
          icon={Map}
          title="Explorar mapa"
          description="Veja contratantes que estão próximos de você"
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
  icon: typeof Map;
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
