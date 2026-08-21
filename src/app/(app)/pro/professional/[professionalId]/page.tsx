"use client";

import { ArrowLeft, Briefcase, Code2, History, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

const typeLabels: Record<string, string> = {
  FREELANCE: "Freelance",
  FULL_TIME: "CLT",
  PART_TIME: "Meio período",
};

function formatMoney(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/**
 * `public-profile.html` visto por outro profissional (peer) — mesmo dado
 * público de `/company/professionals/[id]`, mas sem o card de Contato (não
 * existe "match" entre dois profissionais, então não há liberação de
 * contato) nem o CTA que no app antigo só aparecia pra `session.userRole ==
 * 'COMPANY'`.
 */
export default function PeerProfessionalViewPage() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const id = Number(professionalId);
  const router = useRouter();

  const { data: professional, isLoading } = usePublicProfessional(id);

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
      <button
        type="button"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </button>

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

          {professional.credentials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Certificados e eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {professional.credentials.map((credential) => (
                  <Badge key={credential.id} variant="outline">
                    {credential.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {(professional.minimumSalary != null ||
            professional.maximumSalary != null) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Briefcase className="text-primary size-4" />
                  Pretensão salarial
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {formatMoney(professional.minimumSalary)} –{" "}
                {formatMoney(professional.maximumSalary)}
              </CardContent>
            </Card>
          )}

          {professional.preferredTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Regimes de interesse</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {professional.preferredTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {typeLabels[type] ?? type}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="text-primary size-4" />
                Projetos anteriores
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
