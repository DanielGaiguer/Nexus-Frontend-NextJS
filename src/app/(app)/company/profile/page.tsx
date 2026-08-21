"use client";

import {
  AlertTriangle,
  FileText,
  Link2,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

import { CompanyPhoto } from "@/components/company/company-photo";
import { CompanyProfileEditDialog } from "@/components/company/company-profile-edit-dialog";
import { ReputationCard } from "@/components/professional/reputation-card";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/queries/useCompanyProfile";
import { usePublicCompany } from "@/hooks/queries/usePublicCompany";

const statusLabels: Record<string, string> = {
  PENDING: "Aguardando aprovação",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};

export default function CompanyProfilePage() {
  const { data: profile, isLoading } = useCompanyProfile();
  // GET /api/public/company/{id} só existe pra empresa APPROVED — pendente/
  // rejeitada dá 404, então nem chamamos nesse caso.
  const { data: publicProfile } = usePublicCompany(
    profile?.status === "APPROVED" ? profile.id : undefined
  );

  if (isLoading || !profile) {
    return (
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Perfil da Empresa
          </h1>
          <p className="text-muted-foreground text-sm">
            Mantenha os dados da empresa atualizados para melhores matches
          </p>
        </div>
        <CompanyProfileEditDialog profile={profile} />
      </div>

      {profile.status !== "APPROVED" && (
        <div className="bg-warning/10 flex items-start gap-2 rounded-md p-3 text-sm">
          <AlertTriangle className="text-warning mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              {statusLabels[profile.status] ?? profile.status}
            </p>
            <p className="text-muted-foreground text-xs">
              Sua empresa ainda não foi aprovada por um administrador — algumas
              funcionalidades ficam indisponíveis até lá.
            </p>
          </div>
        </div>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <CompanyPhoto
                name={profile.companyName}
                photoUrl={profile.profilePhotoUrl}
              />
              <div className="text-lg font-bold">{profile.companyName}</div>
              {profile.city && (
                <div className="text-muted-foreground text-sm">
                  {profile.city}
                  {profile.uf ? ` / ${profile.uf}` : ""}
                </div>
              )}
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
                <FileText className="text-primary size-4" />
                {profile.taxId ?? "—"}
              </div>
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
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 text-[#0A66C2] hover:underline"
                >
                  <Link2 className="size-4" />
                  <span className="truncate">{profile.linkedinUrl}</span>
                </a>
              )}
            </CardContent>
          </Card>

          <ReputationCard
            reputation={publicProfile?.reputationDetails ?? null}
          />
          <ReviewsPreviewCard
            entityType="company"
            entityId={profile.id}
            viewAllHref="/company/reviews"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sobre a empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.description ? (
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {profile.description}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma descrição cadastrada ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
