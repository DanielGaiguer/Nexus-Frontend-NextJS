import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CustomPortalDetailDTO,
  CustomPortalDTO,
  CustomPortalRequestDTO,
  CustomPortalRequestStatus,
} from "@/types/custom-portal";

export const adminCustomPortalRequestsKey = (
  status?: CustomPortalRequestStatus
) =>
  status
    ? (["admin", "custom-portal-requests", status] as const)
    : (["admin", "custom-portal-requests", "all"] as const);

export const adminCustomPortalsKey = () => ["admin", "custom-portals"] as const;

export const adminCustomPortalDetailKey = (portalId: number) =>
  ["admin", "custom-portals", portalId] as const;

/** Fila de solicitações no painel Admin (opcionalmente filtrada por status). */
export function useAdminCustomPortalRequests(
  status?: CustomPortalRequestStatus
) {
  return useQuery({
    queryKey: adminCustomPortalRequestsKey(status),
    queryFn: () =>
      apiFetch<CustomPortalRequestDTO[]>(
        `/api/admin/custom-portal-requests${status ? `?status=${status}` : ""}`
      ),
  });
}

/** Todas as plataformas personalizadas existentes. */
export function useAdminCustomPortals() {
  return useQuery({
    queryKey: adminCustomPortalsKey(),
    queryFn: () => apiFetch<CustomPortalDTO[]>("/api/admin/custom-portals"),
  });
}

/** Detalhe de uma plataforma personalizada + histórico de status. */
export function useAdminCustomPortalDetail(
  portalId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: adminCustomPortalDetailKey(portalId ?? 0),
    queryFn: () =>
      apiFetch<CustomPortalDetailDTO>(`/api/admin/custom-portals/${portalId}`),
    enabled: enabled && portalId != null,
  });
}
