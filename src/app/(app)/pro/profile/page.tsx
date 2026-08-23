"use client";

import {
  AlertTriangle,
  Code2,
  Link2,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { CredentialsSection } from "@/components/professional/credentials-section";
import { ProfileCard } from "@/components/professional/profile-card";
import { ProfileEditDialog } from "@/components/professional/profile-edit-dialog";
import { ProfilePhoto } from "@/components/professional/profile-photo";
import { ReputationCard } from "@/components/professional/reputation-card";
import { ResumeCard } from "@/components/professional/resume-card";
import { SkillsEditorDialog } from "@/components/professional/skills-editor-dialog";
import { ReviewsPreviewCard } from "@/components/reviews/reviews-preview-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUpdateProfessionalProfile } from "@/hooks/mutations/useUpdateProfessionalProfile";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";
import { ApiError } from "@/lib/api-client";

const experienceLevelLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

export default function ProProfilePage() {
  const { data: profile, isLoading } = useProfessionalProfile();
  const { data: publicProfile } = usePublicProfessional(profile?.id);
  const updateProfile = useUpdateProfessionalProfile();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  function toggleAvailable(checked: boolean) {
    if (!profile) return;
    updateProfile.mutate(
      { ...profile, available: checked },
      {
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível atualizar."
          );
        },
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm">
            Mantenha seu perfil atualizado para melhores matches
          </p>
        </div>
        <ProfileEditDialog profile={profile} />
      </div>

      {!profile.profileComplete && profile.missingFields.length > 0 && (
        <div className="bg-warning/10 flex items-start gap-2 rounded-md p-3 text-sm">
          <AlertTriangle className="text-warning mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Perfil incompleto</p>
            <p className="text-muted-foreground text-xs">
              Falta: {profile.missingFields.join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <ProfilePhoto
                name={profile.name}
                photoUrl={profile.profilePhotoUrl}
              />
              <div className="text-lg font-bold">{profile.name}</div>
              <div className="text-muted-foreground text-sm">
                {profile.experienceLevel
                  ? experienceLevelLabels[profile.experienceLevel]
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
            <CardContent className="flex items-center justify-between">
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
                  Afeta o score
                </div>
              </div>
              <Switch
                checked={profile.available ?? false}
                onCheckedChange={toggleAvailable}
              />
            </CardContent>
          </Card>

          <ResumeCard
            professionalId={profile.id}
            hasResume={profile.resume != null}
          />

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
              {profile.hasGitHub ? (
                <a
                  href={profile.githubUrl ?? "#"}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Code2 className="size-4" />@{profile.githubLogin}
                </a>
              ) : (
                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Code2 className="size-4" />
                  Conectar GitHub via LinkedIn/OAuth chega numa próxima etapa.
                </p>
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
          />

          <ReputationCard
            reputation={publicProfile?.reputationDetails ?? null}
            title="Análise de qualidade"
          />
          <ReviewsPreviewCard
            entityType="professional"
            entityId={profile.id}
            viewAllHref="/pro/reviews"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome Completo" value={profile.name} />
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
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Skills</CardTitle>
              <SkillsEditorDialog currentSkillNames={profile.skills} />
            </CardHeader>
            <CardContent>
              {profile.skills.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma skill cadastrada.{" "}
                  <SkillsEditorDialog
                    currentSkillNames={profile.skills}
                    trigger={
                      <button className="text-primary hover:underline">
                        Adicionar agora →
                      </button>
                    }
                  />
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CredentialsSection type="CERTIFICATE" />
          <CredentialsSection type="EVENT" />

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
                  rel="noopener"
                  className="text-muted-foreground mb-2 block text-sm hover:underline"
                >
                  @{profile.githubLogin}
                </a>
                <div className="overflow-x-auto rounded-md bg-[#161b22] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- domínio externo sem loader configurado, só para este gráfico */}
                  <img
                    src={`https://ghchart.rshah.org/${profile.githubLogin}`}
                    alt={`Gráfico de contribuições do GitHub de ${profile.githubLogin}`}
                    className="block max-w-full rounded"
                  />
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-end gap-1 text-[11px]">
                  <span>Less</span>
                  <span className="size-2.5 rounded-sm border border-white/10 bg-[#161b22]" />
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
