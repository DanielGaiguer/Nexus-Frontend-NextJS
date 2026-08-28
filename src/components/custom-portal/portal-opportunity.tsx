"use client";

import {
  ArrowLeft,
  Award,
  Calendar,
  CircleCheck,
  Clock,
  DollarSign,
  FileText,
  Gift,
  MapPin,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  PortalBrandingView,
  resolvePortalColor,
} from "@/components/custom-portal/portal-branding-view";
import { PortalLoginDialog } from "@/components/custom-portal/portal-login-dialog";
import { PortalUnavailable } from "@/components/custom-portal/portal-unavailable";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useShowInterest } from "@/hooks/mutations/useShowInterest";
import { useOpportunities } from "@/hooks/queries/useOpportunities";
import { usePublicOpportunity } from "@/hooks/queries/usePublicOpportunity";
import { usePublicPortal } from "@/hooks/queries/usePublicPortal";
import { useSession } from "@/hooks/queries/useSession";
import { ApiError } from "@/lib/api-client";
import { nexusUrl } from "@/lib/portal-domain";
import type { ProjectResponseDTO } from "@/types/project";

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};
const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};
const contractLabels: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  TEMPORARY: "Temporário",
  FREELANCER: "Freelancer",
};

function money(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function PortalOpportunity({
  subdomain,
  opportunityId,
}: {
  subdomain: string;
  opportunityId: number;
}) {
  const portalQ = usePublicPortal(subdomain);
  const jobQ = usePublicOpportunity(opportunityId);
  const portal = portalQ.data;
  const job = jobQ.data;

  if (portalQ.isLoading || jobQ.isLoading) {
    return (
      <div
        className="min-h-screen animate-pulse"
        style={{ background: "#f1f5f9" }}
      />
    );
  }

  if (portalQ.isError || !portal || portal.status !== "ACTIVE") {
    return <PortalUnavailable status={portal?.status} />;
  }
  // vaga inexistente / fechada, ou de outra empresa que não a dona do portal
  if (jobQ.isError || !job || job.companyId !== portal.companyId) {
    return <PortalUnavailable status="ACTIVE" />;
  }

  const color = resolvePortalColor(portal.primaryColor);
  const isJob = job.opportunityType === "JOB";

  return (
    <PortalBrandingView
      dense
      branding={{
        displayName: portal.displayName,
        primaryColor: portal.primaryColor,
        logoUrl: portal.logoUrl,
        bannerUrl: portal.bannerUrl,
        aboutText: null,
        sections: [],
        companyName: portal.companyName,
      }}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: "#64748b" }}
      >
        <ArrowLeft className="size-4" />
        Todas as vagas
      </Link>

      <div className="mt-3">
        <div
          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
          style={{ background: `${color}18`, color }}
        >
          {isJob ? "Vaga de emprego" : "Projeto"}
        </div>
        <h2
          className="mt-2 text-xl font-bold tracking-tight"
          style={{ color: "#0f172a" }}
        >
          {job.title}
        </h2>
        {(job.city || job.uf) && (
          <div
            className="mt-1 flex items-center gap-1 text-sm"
            style={{ color: "#64748b" }}
          >
            <MapPin className="size-3.5" />
            {[job.city, job.uf].filter(Boolean).join(" / ")}
          </div>
        )}
      </div>

      <div className="mt-4">
        <ApplyBox job={job} primaryColor={portal.primaryColor} />
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <Info
          icon={DollarSign}
          label={isJob ? "Salário mensal" : "Faixa de budget"}
          value={
            job.salaryVisible
              ? isJob
                ? `${money(job.monthlySalaryMin)} – ${money(job.monthlySalaryMax)}`
                : `${money(job.minimumBudget)} – ${money(job.maximumBudget)}`
              : "A combinar"
          }
        />
        {job.workMode && (
          <Info
            icon={MapPin}
            label="Modalidade"
            value={modalityLabels[job.workMode] ?? job.workMode}
          />
        )}
        {isJob && job.contractType && (
          <Info
            icon={FileText}
            label="Contrato"
            value={contractLabels[job.contractType] ?? job.contractType}
          />
        )}
        {job.experienceLevel && (
          <Info
            icon={Award}
            label="Experiência"
            value={experienceLabels[job.experienceLevel] ?? job.experienceLevel}
          />
        )}
        {job.workloadHoursPerWeek != null && (
          <Info
            icon={Clock}
            label="Carga horária"
            value={`${job.workloadHoursPerWeek}h/semana`}
          />
        )}
        {job.startDate && (
          <Info
            icon={Calendar}
            label="Início"
            value={new Date(job.startDate).toLocaleDateString("pt-BR")}
          />
        )}
        {job.deadline && (
          <Info
            icon={Calendar}
            label="Prazo"
            value={new Date(job.deadline).toLocaleDateString("pt-BR")}
          />
        )}
      </dl>

      <section className="mt-6">
        <h3 className="text-sm font-bold" style={{ color }}>
          Descrição
        </h3>
        <p
          className="mt-1 text-sm whitespace-pre-line"
          style={{ color: "#334155" }}
        >
          {job.description || "Nenhuma descrição cadastrada."}
        </p>
      </section>

      {job.requiredSkills.length > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-bold" style={{ color }}>
            Skills exigidas
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.requiredSkills.map((s) => (
              <span
                key={s.id}
                className="rounded px-2 py-0.5 text-xs"
                style={{ background: "#f1f5f9", color: "#334155" }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {job.benefits && (
        <section className="mt-5">
          <h3
            className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color }}
          >
            <Gift className="size-4" />
            Benefícios
          </h3>
          <p
            className="mt-1 text-sm whitespace-pre-line"
            style={{ color: "#334155" }}
          >
            {job.benefits}
          </p>
        </section>
      )}
    </PortalBrandingView>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color: "#64748b" }} />
      <div>
        <dt className="text-xs" style={{ color: "#64748b" }}>
          {label}
        </dt>
        <dd className="font-medium" style={{ color: "#0f172a" }}>
          {value}
        </dd>
      </div>
    </div>
  );
}

/** Fluxo de candidatura — login dentro do portal + a MESMA ação de interesse do Nexus. */
function ApplyBox({
  job,
  primaryColor,
}: {
  job: ProjectResponseDTO;
  primaryColor: string | null;
}) {
  const session = useSession();
  const role = session.data?.role ?? null;
  const isPro = role === "PROFESSIONAL";

  const feed = useOpportunities(isPro);
  const showInterest = useShowInterest();
  const logout = useLogout();
  const color = resolvePortalColor(primaryColor);

  const [loginOpen, setLoginOpen] = useState(false);
  const pendingApply = useRef(false);

  const alreadyInterested =
    isPro &&
    feed.data?.some(
      (m) => m.project.id === job.id && m.status === "PROFESSIONAL_INTERESTED"
    );

  function doInterest() {
    showInterest.mutate(job.id, {
      onSuccess: (result) => {
        if (result.screeningRequired && result.screeningInvitationId) {
          toast.message(
            "Esta vaga tem um processo seletivo — você continua no Nexus para respondê-lo."
          );
          window.location.href = nexusUrl(
            `/pro/screening-invitations/${result.screeningInvitationId}/take`
          );
          return;
        }
        toast.success("Candidatura enviada!");
      },
      onError: (error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível enviar a candidatura."
        ),
    });
  }

  // Depois de logar pelo diálogo, dispara a candidatura assim que a sessão
  // vira PROFESSIONAL.
  useEffect(() => {
    if (pendingApply.current && isPro && !feed.isLoading) {
      pendingApply.current = false;
      doInterest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, feed.isLoading]);

  if (session.isLoading) {
    return (
      <button
        disabled
        className="rounded-md px-4 py-2 text-sm font-semibold text-white opacity-60"
        style={{ background: color }}
      >
        Carregando…
      </button>
    );
  }

  if (!session.data) {
    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ background: color }}
        >
          <Send className="mr-1.5 inline size-4" />
          Candidatar-se
        </button>
        <PortalLoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          primaryColor={primaryColor}
          onLoggedIn={() => {
            pendingApply.current = true;
            session.refetch();
            feed.refetch();
          }}
        />
      </>
    );
  }

  if (!isPro) {
    return (
      <div className="text-sm" style={{ color: "#64748b" }}>
        Entre com uma conta de profissional para se candidatar.{" "}
        <button
          className="underline"
          onClick={() =>
            logout.mutate(undefined, { onSuccess: () => session.refetch() })
          }
        >
          Sair
        </button>
      </div>
    );
  }

  if (alreadyInterested) {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color }}
      >
        <CircleCheck className="size-4" />
        Candidatura enviada
      </div>
    );
  }

  return (
    <button
      onClick={doInterest}
      disabled={showInterest.isPending}
      className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      style={{ background: color }}
    >
      <Send className="mr-1.5 inline size-4" />
      {showInterest.isPending ? "Enviando…" : "Demonstrar interesse"}
    </button>
  );
}
