"use client";

import {
  ArrowLeft,
  Building2,
  History,
  Lock,
  LockOpen,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyContact } from "@/hooks/queries/useCompanyContact";
import {
  useCompanyClosedProjects,
  usePublicCompany,
} from "@/hooks/queries/usePublicCompany";

export default function CompanyViewPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);

  const { data: company, isLoading } = usePublicCompany(id);
  const { data: closedProjects } = useCompanyClosedProjects(id);
  // O backend só libera o contato de fato se houver match confirmado — aqui
  // só chutamos "true" pra tentar; um 403 vira "contato bloqueado" na UI.
  const contact = useCompanyContact(id, true);
  const hasContact = !!contact.data;

  if (isLoading || !company) {
    return (
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Link
        href="/pro/companies"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Avatar className="size-24 rounded-xl">
                <AvatarImage
                  src={company.profilePhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback className="rounded-xl text-2xl">
                  {company.companyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-lg font-bold">{company.companyName}</div>
              {company.city && (
                <div className="text-muted-foreground text-sm">
                  {company.city}
                  {company.uf ? ` / ${company.uf}` : ""}
                </div>
              )}
              {company.reputation != null && company.reputation > 0 ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(company.reputation!)
                          ? "fill-warning text-warning size-3.5"
                          : "text-muted-foreground/30 size-3.5"
                      }
                    />
                  ))}
                  <span className="text-warning ml-1 text-sm font-semibold tabular-nums">
                    {company.reputation.toFixed(1)}
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
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Os dados de contato desta empresa são liberados
                  automaticamente após a confirmação de um match.
                </p>
              )}
            </CardContent>
          </Card>

          <ReputationCard reputation={company.reputationDetails} />
          <ReviewsPreviewCard
            entityType="company"
            entityId={id}
            viewAllHref={`/public/company/${id}/reviews`}
          />
        </div>

        <div className="flex flex-col gap-4">
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="text-primary size-4" />
                  Sobre a empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="text-primary size-4" />
                Oportunidades fechadas
                <Badge variant="secondary">{closedProjects?.length ?? 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!closedProjects || closedProjects.length === 0 ? (
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
                        <span className="text-sm font-medium">
                          {project.title}
                        </span>
                      </div>
                      {project.createdAt && (
                        <span className="text-muted-foreground text-xs">
                          {new Date(project.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {company.previousProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="text-primary size-4" />
                  Oportunidades anteriores
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {company.previousProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-muted/40 flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm font-medium">
                      {project.projectTitle}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(project.completedAt).toLocaleDateString(
                        "pt-BR",
                        {
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
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
