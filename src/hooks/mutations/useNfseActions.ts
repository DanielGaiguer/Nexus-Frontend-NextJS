import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  companyInvoicesKey,
  fiscalConfigKey,
  fiscalProfileKey,
} from "@/hooks/queries/useNfse";
import { apiFetch } from "@/lib/api-client";
import type {
  CompanyFiscalProfileDTO,
  FiscalConfigDTO,
  NfseInvoiceDTO,
  UpdateCompanyFiscalProfileBody,
  UpdateFiscalConfigBody,
} from "@/types/nfse";

/** Admin: salva o id da empresa emitente no eNotas + descrição padrão. */
export function useUpdateFiscalConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFiscalConfigBody) =>
      apiFetch<FiscalConfigDTO>("/api/admin/fiscal-config", {
        method: "PUT",
        body,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fiscalConfigKey() }),
  });
}

/** Contratante: salva os dados fiscais. O backend re-tenta as notas que falharam. */
export function useSaveFiscalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCompanyFiscalProfileBody) =>
      apiFetch<CompanyFiscalProfileDTO>("/api/company/billing/fiscal-profile", {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalProfileKey() });
      queryClient.invalidateQueries({ queryKey: companyInvoicesKey() });
    },
  });
}

/** Admin: re-tenta a emissão de uma nota FAILED/PENDING. */
export function useRetryInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<NfseInvoiceDTO>(`/api/admin/invoices/${id}/retry`, {
        method: "POST",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] }),
  });
}

/** Modo simulate: o Admin decide o resultado da emissão (sem eNotas). */
export function useSimulateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      outcome,
    }: {
      id: number;
      outcome: "authorized" | "denied";
    }) =>
      apiFetch<NfseInvoiceDTO>(`/api/admin/invoices/${id}/simulate`, {
        method: "POST",
        body: { outcome },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] }),
  });
}
