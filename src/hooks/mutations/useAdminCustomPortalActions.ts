import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  adminCustomPortalDetailKey,
  adminCustomPortalsKey,
} from "@/hooks/queries/useAdminCustomPortals";
import { apiFetch } from "@/lib/api-client";
import type {
  ApproveCustomPortalRequestBody,
  CreateCustomPortalBody,
  CustomPortalDTO,
  CustomPortalRequestDTO,
  UpdateCustomPortalSubscriptionBody,
} from "@/types/custom-portal";

function useInvalidateAdminCustomPortals() {
  const queryClient = useQueryClient();
  return (portalId?: number) => {
    // Prefixo comum a adminCustomPortalRequestsKey(status) — cobre a lista
    // completa e qualquer aba filtrada por status de uma vez.
    queryClient.invalidateQueries({
      queryKey: ["admin", "custom-portal-requests"],
    });
    queryClient.invalidateQueries({ queryKey: adminCustomPortalsKey() });
    if (portalId != null) {
      queryClient.invalidateQueries({
        queryKey: adminCustomPortalDetailKey(portalId),
      });
    }
  };
}

export function useApproveCustomPortalRequest() {
  const invalidate = useInvalidateAdminCustomPortals();
  return useMutation({
    mutationFn: ({
      requestId,
      ...body
    }: ApproveCustomPortalRequestBody & { requestId: number }) =>
      apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portal-requests/${requestId}/approve`,
        { method: "POST", body }
      ),
    onSuccess: () => invalidate(),
  });
}

export function useRejectCustomPortalRequest() {
  const invalidate = useInvalidateAdminCustomPortals();
  return useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: number;
      reason: string;
    }) =>
      apiFetch<CustomPortalRequestDTO>(
        `/api/admin/custom-portal-requests/${requestId}/reject`,
        { method: "POST", body: { reason } }
      ),
    onSuccess: () => invalidate(),
  });
}

export function useCreateCustomPortal() {
  const invalidate = useInvalidateAdminCustomPortals();
  return useMutation({
    mutationFn: (body: CreateCustomPortalBody) =>
      apiFetch<CustomPortalDTO>("/api/admin/custom-portals", {
        method: "POST",
        body,
      }),
    onSuccess: () => invalidate(),
  });
}

type StatusAction = "suspend" | "reactivate" | "cancel";

function useCustomPortalStatusMutation(action: StatusAction) {
  const invalidate = useInvalidateAdminCustomPortals();
  return useMutation({
    mutationFn: ({ portalId, note }: { portalId: number; note?: string }) =>
      apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portals/${portalId}/${action}`,
        { method: "POST", body: { note } }
      ),
    onSuccess: (data) => invalidate(data.id),
  });
}

export const useSuspendCustomPortal = () =>
  useCustomPortalStatusMutation("suspend");
export const useReactivateCustomPortal = () =>
  useCustomPortalStatusMutation("reactivate");
export const useCancelCustomPortal = () =>
  useCustomPortalStatusMutation("cancel");

export function useUpdateCustomPortalSubscription() {
  const invalidate = useInvalidateAdminCustomPortals();
  return useMutation({
    mutationFn: ({
      portalId,
      ...body
    }: UpdateCustomPortalSubscriptionBody & { portalId: number }) =>
      apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portals/${portalId}/subscription`,
        { method: "PUT", body }
      ),
    onSuccess: (data) => invalidate(data.id),
  });
}
