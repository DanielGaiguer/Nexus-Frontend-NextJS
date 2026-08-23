"use client";

import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Calendar,
  DollarSign,
  Eye,
  FolderOpen,
  Handshake,
  History,
  Link2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCompanyMatches,
  useAdminCompanyProfile,
  useAdminCompanyProjects,
} from "@/hooks/queries/useAdminCompanyView";
import { usePublicCompany } from "@/hooks/queries/usePublicCompany";
import { clampScore } from "@/lib/utils";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PENDING: { label: "Pendente", variant: "secondary" },
  APPROVED: { label: "Aprovada", variant: "default" },
  REJECTED: { label: "Rejeitada", variant: "outline" },
};

const approvalStatus: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Empresa Verificada", className: "text-success" },
  PENDING: { label: "Aguardando Aprovação", className: "text-warning" },
  REJECTED: { label: "Cadastro Rejeitado", className: "text-destructive" },
};

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const projectStatusLabels: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" }
> = {
  OPEN: { label: "Aberto", variant: "default" },
  CLOSED: { label: "Encerrado", variant: "destructive" },
};

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function AdminCompanyViewPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);
  const router = useRouter();

  const { data: profile, isLoading } = useAdminCompanyProfile(id);
  const { data: projects } = useAdminCompanyProjects(id);
  const { data: matches } = useAdminCompanyMatches(id);
  const { data: publicCompany } = usePublicCompany(
    profile?.status === "APPROVED" ? id : undefined
  );

  if (isLoading || !profile) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const openProjects = (projects ?? []).filter((p) => p.status === "OPEN");
  const closedProjects = (projects ?? []).filter((p) => p.status === "CLOSED");
  // "Confirmados" conta todo match MATCHED, ativo ou não (o admin-company-
  // profile.html original nunca filtra por `active` aqui — só o "Oportunidades
  // anteriores" abaixo faz isso). Tinha um `&& m.active !== false` sobrando
  // aqui que fazia esse número (e a Taxa de Sucesso, derivada dele) ficar bem
  // menor que o app antigo pra empresas com matches já encerrados.
  const confirmed = (matches ?? []).filter((m) => m.status === "MATCHED");
  // Mesma "Taxa de sucesso" de company/dashboard e company/profile
  // (useCompanySuccessRate): % dos projetos que já tiveram pelo menos 1
  // match confirmado, ativo ou já encerrado -- nunca passa de 100%. Não dá
  // pra reaproveitar o hook direto (ele busca os matches da empresa
  // *logada*, e aqui é o admin olhando uma empresa qualquer), mas os dados
  // já vêm de useAdminCompanyMatches/useAdminCompanyProjects, então é o
  // mesmo cálculo com outra fonte. Antes essa tela usava confirmados ÷
  // decididos (confirmados+recusados) -- taxa de aceitação de convites,
  // uma métrica diferente que divergia da mostrada pra própria empresa.
  const projectsWithConfirmedMatch = new Set(
    confirmed.map((m) => m.project.id)
  );
  const totalProjects = projects?.length ?? 0;
  const successRate =
    totalProjects > 0
      ? Math.round((projectsWithConfirmedMatch.size / totalProjects) * 100)
      : null;
  const previous = (matches ?? []).filter(
    (m) => m.status === "MATCHED" && m.active === false
  );
  const pending = (matches ?? []).filter(
    (m) =>
      m.status === "COMPANY_INTERESTED" ||
      m.status === "PROFESSIONAL_INTERESTED"
  );
  const status = statusLabels[profile.status] ?? {
    label: profile.status,
    variant: "outline" as const,
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            Perfil da Empresa
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualização somente leitura
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/company/${id}/analytics`}>
            <BarChart3 className="size-4" />
            Ver estatísticas
          </Link>
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Avatar className="size-24 rounded-xl">
                <AvatarImage
                  src={profile.profilePhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback className="rounded-xl text-2xl">
                  {profile.companyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-lg font-bold">{profile.companyName}</div>
              <Badge variant={status.variant}>{status.label}</Badge>
              {profile.reputation != null && profile.reputation > 0 ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(profile.reputation!)
                          ? "fill-warning text-warning size-3.5"
                          : "text-muted-foreground/30 size-3.5"
                      }
                    />
                  ))}
                  <span className="text-warning ml-1 text-sm font-semibold tabular-nums">
                    {profile.reputation.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">
                  Sem avaliações ainda
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="text-primary size-4" />
                {[profile.city, profile.uf].filter(Boolean).join(", ") || "—"}
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="text-primary size-4" />
                {profile.phone ?? "—"}
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="text-primary size-4" />
                {profile.email}
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="font-medium">CNPJ</span>
                <span className="tabular-nums">{profile.taxId ?? "—"}</span>
              </div>
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#0A66C2] hover:underline"
                >
                  <Link2 className="size-4" />
                  <span className="truncate">{profile.linkedinUrl}</span>
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <ShieldCheck
                className={`size-5 shrink-0 ${approvalStatus[profile.status]?.className ?? ""}`}
              />
              <div>
                <div
                  className={`text-sm font-semibold ${approvalStatus[profile.status]?.className ?? ""}`}
                >
                  {approvalStatus[profile.status]?.label ?? profile.status}
                </div>
                <div className="text-muted-foreground text-xs">
                  Status da aprovação
                </div>
              </div>
            </CardContent>
          </Card>

          <ReputationCard
            reputation={publicCompany?.reputationDetails ?? null}
            title="Análise de qualidade"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="text-primary size-4" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {projects?.length ?? 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total de Projetos
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                  <FolderOpen className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {openProjects.length}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Projetos Abertos
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Handshake className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {confirmed.length}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Matches Confirmados
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-warning/10 text-warning flex size-9 shrink-0 items-center justify-center rounded-full">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {successRate != null ? `${successRate}%` : "—"}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Taxa de Sucesso
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {profile.description || "Nenhuma descrição cadastrada."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="text-muted-foreground size-4" />
                Oportunidades fechadas{" "}
                <Badge variant="secondary">{closedProjects.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {closedProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma oportunidade encerrada ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {closedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-muted/40 flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            project.opportunityType === "JOB"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.opportunityType === "JOB"
                            ? "Vaga"
                            : "Projeto"}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {project.title}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/public/opportunity/${project.id}`}>
                          <Eye className="size-3.5" />
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Briefcase className="text-primary size-4" />
                Projetos{" "}
                <Badge variant="secondary">{projects?.length ?? 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!projects || projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum projeto cadastrado.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((project) => {
                    const status = projectStatusLabels[project.status] ?? {
                      label: project.status,
                      variant: "secondary" as const,
                    };
                    return (
                      <div
                        key={project.id}
                        className="bg-muted/40 rounded-lg border p-3"
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {project.title}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        {project.description && (
                          <p className="text-muted-foreground mb-2 text-xs">
                            {project.description.length > 120
                              ? `${project.description.slice(0, 120)}…`
                              : project.description}
                          </p>
                        )}
                        <div className="text-muted-foreground mb-2 flex flex-wrap gap-3 text-xs">
                          {project.minimumBudget != null &&
                            project.maximumBudget != null && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="size-3.5" />
                                R${formatMoney(project.minimumBudget)} – R$
                                {formatMoney(project.maximumBudget)}
                              </span>
                            )}
                          {project.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5" />
                              {new Date(project.deadline).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {project.workMode
                              ? (modalityLabels[project.workMode] ??
                                project.workMode)
                              : "—"}
                          </span>
                        </div>
                        {project.requiredSkills.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {project.requiredSkills.map((skill) => (
                              <Badge
                                key={skill.id}
                                variant="outline"
                                className="text-[11px]"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/public/opportunity/${project.id}`}>
                              <Eye className="size-3.5" />
                              Ver detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Handshake className="text-success size-4" />
                Matches confirmados{" "}
                <Badge variant="secondary">{confirmed.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmed.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum match confirmado.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {confirmed.map((match) => (
                    <Link
                      key={match.id}
                      href={`/admin/professional/${match.professional.id}`}
                      className="bg-muted/40 hover:bg-accent flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {match.professional.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {match.project.title}
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
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Matches pendentes{" "}
                <Badge variant="secondary">{pending.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum match pendente.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((match) => (
                    <div
                      key={match.id}
                      className="bg-muted/40 flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {match.professional.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {match.project.title}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {match.status === "COMPANY_INTERESTED"
                          ? "Convite enviado"
                          : "Interesse recebido"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ReviewsPreviewCard
            entityType="company"
            entityId={id}
            viewAllHref={`/public/company/${id}/reviews`}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="text-primary size-4" />
                Oportunidades anteriores{" "}
                <Badge variant="secondary">{previous.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previous.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum projeto anterior.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {previous.map((match) => (
                    <Link
                      key={match.id}
                      href={`/admin/professional/${match.professional.id}`}
                      className="bg-muted/40 hover:bg-accent flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {match.professional.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {match.project.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                          <History className="size-3.5" />
                          Encerrado
                        </span>
                        {match.scoreBreakdown && (
                          <Badge variant="secondary" className="tabular-nums">
                            {Math.round(
                              clampScore(match.scoreBreakdown.finalScore)
                            )}
                            %
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
