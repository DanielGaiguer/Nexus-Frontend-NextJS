import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CompanyFiscalProfileDTO,
  FiscalConfigDTO,
  NfseInvoiceDTO,
  NfseModeDTO,
} from "@/types/nfse";

export const fiscalConfigKey = () => ["admin", "fiscal-config"] as const;
export const adminInvoicesKey = (status: string) =>
  ["admin", "invoices", status] as const;
export const adminNfseModeKey = () => ["admin", "invoices", "mode"] as const;
export const fiscalProfileKey = () =>
  ["company", "billing", "fiscal-profile"] as const;
export const companyInvoicesKey = () =>
  ["company", "billing", "invoices"] as const;

/** Admin: id da empresa emitente no eNotas + descrição padrão do serviço. */
export function useFiscalConfig() {
  return useQuery({
    queryKey: fiscalConfigKey(),
    queryFn: () => apiFetch<FiscalConfigDTO>("/api/admin/fiscal-config"),
    staleTime: 5 * 60 * 1000,
  });
}

/** Admin: fila de NFS-e (acompanhamento + pendências que falharam). */
export function useAdminInvoices(status = "ALL") {
  return useQuery({
    queryKey: adminInvoicesKey(status),
    queryFn: () => {
      const qs = status !== "ALL" ? `?status=${status}` : "";
      return apiFetch<NfseInvoiceDTO[]>(`/api/admin/invoices${qs}`);
    },
    refetchInterval: 30 * 1000,
  });
}

/** Se a simulação de emissão está disponível (modo simulate, sem eNotas). */
export function useAdminNfseMode() {
  return useQuery({
    queryKey: adminNfseModeKey(),
    queryFn: () => apiFetch<NfseModeDTO>("/api/admin/invoices/mode"),
    staleTime: 5 * 60 * 1000,
  });
}

/** Contratante: dados fiscais (tomador) que a NFS-e exige. */
export function useCompanyFiscalProfile(enabled = true) {
  return useQuery({
    queryKey: fiscalProfileKey(),
    queryFn: () =>
      apiFetch<CompanyFiscalProfileDTO>("/api/company/billing/fiscal-profile"),
    enabled,
  });
}

/** Contratante: notas fiscais das comissões pagas. */
export function useCompanyInvoices(enabled = true) {
  return useQuery({
    queryKey: companyInvoicesKey(),
    queryFn: () => apiFetch<NfseInvoiceDTO[]>("/api/company/billing/invoices"),
    enabled,
    refetchInterval: 60 * 1000,
  });
}
