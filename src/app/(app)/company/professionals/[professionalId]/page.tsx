"use client";

import {
  ArrowLeft,
  Code2,
  FileText,
  Handshake,
  History,
  Lock,
  LockOpen,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";

import { ProfessionalCompareDialog } from "@/components/company/professional-compare-dialog";
import { credentialColorHex } from "@/components/professional/credential-color";
import { ProfileCard } from "@/components/professional/profile-card";
import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyShowInterest } from "@/hooks/mutations/useCompanyMatchActions";
import { useMatch } from "@/hooks/queries/useMatch";
import { useProfessionalContact } from "@/hooks/queries/useProfessionalContact";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";
import { ApiError } from "@/lib/api-client";
import type { CredentialType } from "@/types/professional";

const credentialTypeConfig: Record<
  CredentialType,
  { title: string; emptyLabel: string }
> = {
  CERTIFICATE: {
    title: "Certificados",
    emptyLabel: "Nenhum certificado cadastrado.",
  },
  EVENT: { title: "Eventos", emptyLabel: "Nenhum evento cadastrado." },
};

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

export default function CompanyProfessionalViewPage() {
  return (
    <Suspense fallback={null}>
      <CompanyProfessionalViewContent />
    </Suspense>
  );
}

function CompanyProfessionalViewContent() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const id = Number(professionalId);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Presentes só quando se chega aqui a partir da tela de comparação
  // (company/projects/[projectId]/compare) num match ainda "WAITING" —
  // habilitam o botão de demonstrar interesse, com volta pra comparação.
  const matchId = searchParams.get("matchId");
  const returnTo = searchParams.get("returnTo");
  const showInterest = useCompanyShowInterest();

  const { data: professional, isLoading } = usePublicProfessional(id);
  // O backend só libera o contato de fato se houver match confirmado — aqui
  // só chutamos "true" pra tentar; um 403 vira "contato bloqueado" na UI.
  const contact = useProfessionalContact(id, true);
  const hasContact = !!contact.data;
  // Só existe um projeto "em contexto" quando se chega aqui a partir da tela
  // de comparação (matchId acima) -- por isso o orçamento no card Perfil só
  // aparece nesse caso, não na navegação direta pelo diretório geral.
  const matchIdNum = matchId ? Number(matchId) : undefined;
  const { data: matchDetail } = useMatch(matchIdNum ?? 0, matchIdNum != null);
  const contextProject = matchDetail?.project;
  const contextProjectIsJob = contextProject?.opportunityType === "JOB";

  if (isLoading || !professional) {
    return (
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <ProfessionalCompareDialog professionalId={id} />
          {matchId && returnTo && (
            <Button
              size="sm"
              disabled={showInterest.isPending}
              onClick={() =>
                showInterest.mutate(Number(matchId), {
                  onSuccess: () => {
                    toast.success("Convite enviado ao profissional!");
                    router.push(returnTo);
                  },
                  onError: (error) =>
                    toast.error(
                      error instanceof ApiError
                        ? error.message
                        : "Não foi possível enviar o convite."
                    ),
                })
              }
            >
              <Handshake className="size-3.5" />
              Demonstrar interesse
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Avatar className="size-24">
                <AvatarImage
                  src={professional.profilePhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback className="text-2xl">
                  {professional.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-lg font-bold">{professional.name}</div>
              {professional.city && (
                <div className="text-muted-foreground text-sm">
                  {professional.city}
                  {professional.uf ? ` / ${professional.uf}` : ""}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-1">
                {professional.experienceLevel && (
                  <Badge variant="secondary">
                    {experienceLabels[professional.experienceLevel] ??
                      professional.experienceLevel}
                  </Badge>
                )}
                {professional.available != null && (
                  <Badge
                    variant={professional.available ? "default" : "outline"}
                  >
                    {professional.available ? "Disponível" : "Indisponível"}
                  </Badge>
                )}
              </div>
              {professional.reputation != null &&
              professional.reputation > 0 ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(professional.reputation!)
                          ? "fill-warning text-warning size-3.5"
                          : "text-muted-foreground/30 size-3.5"
                      }
                    />
                  ))}
                  <span className="text-warning ml-1 text-sm font-semibold tabular-nums">
                    {professional.reputation.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">
                  Sem avaliações ainda
                </span>
              )}
              {professional.hasGitHub && professional.githubUrl && (
                <a
                  href={professional.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary flex items-center gap-1 text-xs font-medium"
                >
                  <Code2 className="size-3.5" />
                  {professional.githubLogin ?? "GitHub"}
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                {hasContact ? (
                  <LockOpen className="text-success size-4" />
                ) : (
                  <Lock className="text-muted-foreground size-4" />
                )}
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasContact ? (
                <div className="space-y-2 text-sm">
                  {contact.data!.phone && (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Phone className="text-primary size-4" />
                      {contact.data!.phone}
                    </div>
                  )}
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Mail className="text-primary size-4" />
                    {contact.data!.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full"
                    asChild
                  >
                    <a
                      href={`/api/professional/${id}/resume`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="size-3.5" />
                      Baixar currículo
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Os dados de contato deste profissional são liberados
                  automaticamente após a confirmação de um match.
                </p>
              )}
            </CardContent>
          </Card>

          <ProfileCard
            salary={{
              kind: "range",
              min: professional.minimumSalary,
              max: professional.maximumSalary,
            }}
            preferredTypes={professional.preferredTypes}
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

          <ReputationCard reputation={professional.reputationDetails} />
          <ReviewsPreviewCard
            entityType="professional"
            entityId={id}
            viewAllHref={`/public/professional/${id}/reviews`}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {professional.skills.length > 0 ? (
                professional.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma skill cadastrada.
                </p>
              )}
            </CardContent>
          </Card>

          {(["CERTIFICATE", "EVENT"] as const).map((type) => {
            const config = credentialTypeConfig[type];
            const items = professional.credentials.filter(
              (c) => c.type === type
            );
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="text-sm">{config.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {config.emptyLabel}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {items.map((credential) => (
                        <Badge
                          key={credential.id}
                          variant="outline"
                          style={{
                            backgroundColor: `${credentialColorHex[credential.color]}22`,
                            color: credentialColorHex[credential.color],
                            borderColor: `${credentialColorHex[credential.color]}55`,
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
          })}

          {professional.hasGitHub && professional.githubLogin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Code2 className="size-4" />
                  Atividade no GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={professional.githubUrl ?? "#"}
                  target="_blank"
                  rel="noopener"
                  className="text-muted-foreground mb-2 block text-sm hover:underline"
                >
                  @{professional.githubLogin}
                </a>
                <div className="overflow-x-auto rounded-md border bg-white p-3 dark:border-0 dark:bg-[#161b22]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- domínio externo sem loader configurado, só para este gráfico */}
                  <img
                    src={`https://ghchart.rshah.org/${professional.githubLogin}`}
                    alt={`Gráfico de contribuições do GitHub de ${professional.githubLogin}`}
                    className="block max-w-full rounded"
                  />
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-end gap-1 text-[11px]">
                  <span>Less</span>
                  <span className="size-2.5 rounded-sm border border-black/10 bg-[#ebedf0] dark:border-white/10 dark:bg-[#161b22]" />
                  <span className="size-2.5 rounded-sm bg-[#0e4429]" />
                  <span className="size-2.5 rounded-sm bg-[#006d32]" />
                  <span className="size-2.5 rounded-sm bg-[#26a641]" />
                  <span className="size-2.5 rounded-sm bg-[#39d353]" />
                  <span>More</span>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  Gráfico de contribuições dos últimos 12 meses
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="text-primary size-4" />
                Oportunidades anteriores
                <Badge variant="secondary">
                  {professional.previousProjects.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {professional.previousProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum projeto cadastrado ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {professional.previousProjects.map((project, i) => (
                    <div key={i} className="bg-muted/40 rounded-md border p-3">
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
        </div>
      </div>
    </div>
  );
}
