"use client";

import { Briefcase, Building2, MapPin } from "lucide-react";
import Link from "next/link";

import {
  PortalBrandingView,
  resolvePortalColor,
} from "@/components/custom-portal/portal-branding-view";
import { PortalUnavailable } from "@/components/custom-portal/portal-unavailable";
import { useCompanyOpenProjects } from "@/hooks/queries/usePublicCompany";
import { usePublicPortal } from "@/hooks/queries/usePublicPortal";
import type { ProjectResponseDTO } from "@/types/project";

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

function money(value: number | null | undefined) {
  if (value == null) return null;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function salaryLabel(job: ProjectResponseDTO): string | null {
  if (!job.salaryVisible) return null;
  if (job.opportunityType === "JOB") {
    const min = money(job.monthlySalaryMin);
    const max = money(job.monthlySalaryMax);
    return min ? `${min}${max ? ` – ${max}` : ""} / mês` : null;
  }
  const min = money(job.minimumBudget);
  const max = money(job.maximumBudget);
  return min ? `${min}${max ? ` – ${max}` : ""}` : null;
}

export function PortalHome({ subdomain }: { subdomain: string }) {
  const portalQ = usePublicPortal(subdomain);
  const portal = portalQ.data;
  const active = portal?.status === "ACTIVE";

  const jobsQ = useCompanyOpenProjects(active ? portal.companyId : undefined);

  if (portalQ.isLoading) {
    return (
      <div
        className="min-h-screen animate-pulse"
        style={{ background: "#f1f5f9" }}
      />
    );
  }

  if (portalQ.isError || !portal || !active) {
    return <PortalUnavailable status={portal?.status} />;
  }

  const color = resolvePortalColor(portal.primaryColor);
  const jobs = jobsQ.data ?? [];

  return (
    <PortalBrandingView
      jobsAnchor="vagas"
      branding={{
        displayName: portal.displayName,
        primaryColor: portal.primaryColor,
        logoUrl: portal.logoUrl,
        bannerUrl: portal.bannerUrl,
        aboutText: portal.aboutText,
        sections: portal.sections,
        companyName: portal.companyName,
      }}
    >
      <section id="vagas">
        <h2 className="text-lg font-bold" style={{ color }}>
          Vagas abertas
          <span
            className="ml-2 text-sm font-normal"
            style={{ color: "#64748b" }}
          >
            {jobsQ.isLoading ? "" : jobs.length}
          </span>
        </h2>

        {jobsQ.isLoading ? (
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg"
                style={{ background: "#f1f5f9" }}
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "#64748b" }}>
            Nenhuma vaga aberta no momento. Volte em breve.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/vaga/${job.id}`}
                className="block rounded-lg border p-4 transition-colors hover:border-slate-400"
                style={{ borderColor: "#e2e8f0" }}
              >
                <div
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
                  style={{ background: `${color}18`, color }}
                >
                  {job.opportunityType === "JOB" ? (
                    <Building2 className="size-3" />
                  ) : (
                    <Briefcase className="size-3" />
                  )}
                  {job.opportunityType === "JOB" ? "Vaga" : "Projeto"}
                </div>
                <h3 className="mt-2 font-semibold" style={{ color: "#0f172a" }}>
                  {job.title}
                </h3>
                <div
                  className="mt-1 flex flex-wrap items-center gap-3 text-xs"
                  style={{ color: "#64748b" }}
                >
                  {job.workMode && (
                    <span>{modalityLabels[job.workMode] ?? job.workMode}</span>
                  )}
                  {(job.city || job.uf) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {[job.city, job.uf].filter(Boolean).join(" / ")}
                    </span>
                  )}
                </div>
                {salaryLabel(job) && (
                  <div className="mt-2 text-sm font-semibold" style={{ color }}>
                    {salaryLabel(job)}
                  </div>
                )}
                {job.requiredSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="rounded px-1.5 py-0.5 text-[11px]"
                        style={{ background: "#f1f5f9", color: "#334155" }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </PortalBrandingView>
  );
}
