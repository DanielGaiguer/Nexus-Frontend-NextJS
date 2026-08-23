"use client";

import {
  ArrowLeft,
  BarChart3,
  CircleCheck,
  Code2,
  FileDown,
  Handshake,
  Hash,
  Link2,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { credentialColorHex } from "@/components/professional/credential-color";
import { ProfileCard } from "@/components/professional/profile-card";
import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminProfessionalMatches,
  useAdminProfessionalProfile,
  useAdminProfessionalProjects,
} from "@/hooks/queries/useAdminProfessionalView";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

export default function AdminProfessionalViewPage() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const id = Number(professionalId);
  const router = useRouter();

  const { data: profile, isLoading } = useAdminProfessionalProfile(id);
  const { data: matches } = useAdminProfessionalMatches(id);
  const { data: previousProjects } = useAdminProfessionalProjects(id);
  const { data: publicProfile } = usePublicProfessional(id);

  if (isLoading || !profile) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const confirmed = (matches ?? []).filter((m) => m.status === "MATCHED");
  const invites = (matches ?? []).filter(
    (m) => m.status === "COMPANY_INTERESTED"
  );
  // Só existe um projeto "em contexto" quando há um match confirmado -- se
  // houver mais de um, mostra o do mais recente (matches já vêm ordenados
  // por createdAt DESC).
  const contextProject = confirmed[0]?.project;
  const contextProjectIsJob = contextProject?.opportunityType === "JOB";

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
            Perfil do Profissional
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualização somente leitura
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/professional/${id}/analytics`}>
              <BarChart3 className="size-4" />
              Ver estatísticas
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/api/professional/profile/export?professionalId=${id}`}
              target="_blank"
              rel="noreferrer"
            >
              <FileDown className="size-4" />
              Exportar PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Avatar className="size-24">
                <AvatarImage
                  src={profile.profilePhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback className="text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-lg font-bold">{profile.name}</div>
              <div className="text-muted-foreground text-sm">
                {profile.experienceLevel
                  ? experienceLabels[profile.experienceLevel]
                  : "Profissional"}
              </div>
              {profile.reputation != null ? (
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
            <CardContent className="flex items-center gap-2">
              <CircleCheck
                className={
                  profile.available
                    ? "text-success size-4"
                    : "text-muted-foreground size-4"
                }
              />
              <div>
                <div
                  className={
                    profile.available
                      ? "text-success font-semibold"
                      : "text-muted-foreground font-semibold"
                  }
                >
                  {profile.available ? "Disponível" : "Indisponível"}
                </div>
                <div className="text-muted-foreground text-xs">
                  Disponibilidade atual
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="text-primary size-4" />
                {[profile.city, profile.state].filter(Boolean).join(", ") ||
                  "—"}
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
                <Hash className="text-primary size-4" />
                <span className="tabular-nums">{profile.cep ?? "—"}</span>
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

          <ProfileCard
            salary={{
              kind: "breakdown",
              clt: profile.expectedSalaryCLT,
              pj: profile.expectedSalaryPJ,
              freelanceMin: profile.freelanceMinExpectation,
              freelanceMax: profile.freelanceMaxExpectation,
            }}
            preferredTypes={profile.preferredTypes}
            preferredOpportunityTypes={profile.preferredOpportunityTypes}
            projectBudget={
              contextProject
                ? {
                    label: contextProjectIsJob
                      ? "Salário da vaga"
                      : "Orçamento do projeto",
                    min: contextProjectIsJob
                      ? contextProject.monthlySalaryMin
                      : contextProject.minimumBudget,
                    max: contextProjectIsJob
                      ? contextProject.monthlySalaryMax
                      : contextProject.maximumBudget,
                  }
                : undefined
            }
          />

          <ReputationCard
            reputation={publicProfile?.reputationDetails ?? null}
            title="Análise de qualidade"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome completo" value={profile.name} />
              <Field
                label="Cidade"
                value={
                  [profile.city, profile.state].filter(Boolean).join(", ") ||
                  "—"
                }
              />
              <Field label="Telefone" value={profile.phone ?? "—"} />
              <Field label="E-mail" value={profile.email} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma skill cadastrada.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Oportunidades anteriores{" "}
                <Badge variant="secondary">
                  {previousProjects?.length ?? 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!previousProjects || previousProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum projeto cadastrado.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {previousProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-muted/40 rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {project.title}
                        </span>
                        {project.yearOfCompletion && (
                          <span className="text-muted-foreground text-xs">
                            {project.yearOfCompletion}
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {project.description}
                        </p>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CredentialsCard
            title="Certificados"
            credentials={profile.credentials.filter(
              (c) => c.type === "CERTIFICATE"
            )}
            emptyText="Nenhum certificado cadastrado."
          />

          <CredentialsCard
            title="Eventos"
            credentials={profile.credentials.filter((c) => c.type === "EVENT")}
            emptyText="Nenhum evento cadastrado."
          />

          {profile.hasGitHub && profile.githubLogin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-wide uppercase">
                  <Code2 className="size-3.5" />
                  Atividade no GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={profile.githubUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground mb-2 block text-sm hover:underline"
                >
                  @{profile.githubLogin}
                </a>
                <div className="overflow-x-auto rounded-md border bg-white p-3 dark:border-0 dark:bg-[#161b22]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- domínio externo sem loader configurado, só para este gráfico */}
                  <img
                    src={`https://ghchart.rshah.org/${profile.githubLogin}`}
                    alt={`Gráfico de contribuições do GitHub de ${profile.githubLogin}`}
                    className="block max-w-full rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <ReviewsPreviewCard
            entityType="professional"
            entityId={id}
            viewAllHref={`/public/professional/${id}/reviews`}
          />

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
                      href={`/admin/company/${match.project.companyId}`}
                      className="bg-muted/40 hover:bg-accent flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {match.project.title}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {match.project.companyName}
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
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="text-warning size-4" />
                Convites recebidos{" "}
                <Badge variant="secondary">{invites.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum convite pendente.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {invites.map((match) => (
                    <Link
                      key={match.id}
                      href={`/admin/company/${match.project.companyId}`}
                      className="bg-muted/40 hover:bg-accent flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {match.project.title}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {match.project.companyName}
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
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div
        className={
          accent ? "text-primary text-lg font-bold tabular-nums" : "font-medium"
        }
      >
        {value}
      </div>
    </div>
  );
}

function CredentialsCard({
  title,
  credentials,
  emptyText,
}: {
  title: string;
  credentials: {
    id: number;
    name: string;
    color: keyof typeof credentialColorHex;
  }[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs tracking-wide uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {credentials.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {credentials.map((credential) => (
              <Badge
                key={credential.id}
                variant="outline"
                style={{
                  borderColor: credentialColorHex[credential.color],
                  color: credentialColorHex[credential.color],
                }}
              >
                {credential.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
