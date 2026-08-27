import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  adminCustomPortalDetailKey,
  adminCustomPortalsKey,
} from "@/hooks/queries/useAdminCustomPortals";
import { apiFetch } from "@/lib/api-client";
import type {
  BrandingImageKind,
  CustomPortalDTO,
  UpdateCustomPortalBrandingBody,
} from "@/types/custom-portal";

function useInvalidate() {
  const queryClient = useQueryClient();
  return (portalId: number) => {
    queryClient.invalidateQueries({
      queryKey: adminCustomPortalDetailKey(portalId),
    });
    queryClient.invalidateQueries({ queryKey: adminCustomPortalsKey() });
  };
}

/** Admin edita a customização visual de qualquer plataforma (regra 1). */
export function useAdminUpdateCustomPortalBranding() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      portalId,
      ...body
    }: UpdateCustomPortalBrandingBody & { portalId: number }) =>
      apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portals/${portalId}/branding`,
        { method: "PUT", body }
      ),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAdminUploadCustomPortalImage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      portalId,
      kind,
      file,
    }: {
      portalId: number;
      kind: BrandingImageKind;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portals/${portalId}/branding/image?kind=${kind}`,
        { method: "POST", body: formData }
      );
    },
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAdminDeleteCustomPortalImage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      portalId,
      kind,
    }: {
      portalId: number;
      kind: BrandingImageKind;
    }) =>
      apiFetch<CustomPortalDTO>(
        `/api/admin/custom-portals/${portalId}/branding/image?kind=${kind}`,
        { method: "DELETE" }
      ),
    onSuccess: (data) => invalidate(data.id),
  });
}
