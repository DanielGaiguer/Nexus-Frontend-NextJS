import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myCustomPortalKey } from "@/hooks/queries/useCustomPortal";
import { apiFetch } from "@/lib/api-client";
import type {
  BrandingImageKind,
  CustomPortalDTO,
  UpdateCustomPortalBrandingBody,
} from "@/types/custom-portal";

/** Contratante dono edita a customização visual (campos de texto) da sua plataforma. */
export function useUpdateCustomPortalBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCustomPortalBrandingBody) =>
      apiFetch<CustomPortalDTO>("/api/company/custom-portal/branding", {
        method: "PUT",
        body,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myCustomPortalKey() }),
  });
}

export function useUploadCustomPortalImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }: { kind: BrandingImageKind; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<CustomPortalDTO>(
        `/api/company/custom-portal/branding/image?kind=${kind}`,
        { method: "POST", body: formData }
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myCustomPortalKey() }),
  });
}

export function useDeleteCustomPortalImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind }: { kind: BrandingImageKind }) =>
      apiFetch<CustomPortalDTO>(
        `/api/company/custom-portal/branding/image?kind=${kind}`,
        { method: "DELETE" }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myCustomPortalKey() }),
  });
}
