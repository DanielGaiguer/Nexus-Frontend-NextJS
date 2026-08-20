"use client";

import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  FolderOpen,
  Handshake,
  Link2,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ReputationCard } from "@/components/professional/reputation-card";
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

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PENDING: { label: "Aguardando aprovação", variant: "secondary" },
  APPROVED: { label: "Aprovada", variant: "default" },
  REJECTED: { label: "Rejeitada", variant: "outline" },
};

export default function AdminCompanyViewPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);

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
  const confirmed = (matches ?? []).filter(
    (m) => m.status === "MATCHED" && m.active !== false
  );
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
          <Link
            href="/admin/users"
            className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" />
            Voltar para Usuários
          </Link>
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

          <ReputationCard
            reputation={publicCompany?.reputationDetails ?? null}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {profile.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sobre a empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {profile.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {projects?.length ?? 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total de oportunidades
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3">
                <div className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-full">
                  <FolderOpen className="size-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {openProjects.length}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Oportunidades abertas
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                          {Math.round(match.scoreBreakdown.finalScore)}%
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
                Interesses pendentes{" "}
                <Badge variant="secondary">{pending.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum interesse pendente.
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

          {previous.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Matches anteriores{" "}
                  <Badge variant="secondary">{previous.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {previous.map((match) => (
                  <div
                    key={match.id}
                    className="bg-muted/40 flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm font-medium">
                      {match.professional.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {match.project.title}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {closedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Oportunidades encerradas{" "}
                  <Badge variant="secondary">{closedProjects.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {closedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-muted/40 flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm font-medium">{project.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
