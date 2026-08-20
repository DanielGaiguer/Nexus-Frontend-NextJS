import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminDashboardKey } from "@/hooks/queries/useAdminDashboard";
import {
  adminAllCompaniesKey,
  adminLatestCompaniesKey,
  adminPendingCompaniesKey,
} from "@/hooks/queries/useAdminCompanies";
import { apiFetch } from "@/lib/api-client";
import type { RejectCompanyRequestDTO } from "@/types/admin";

function useInvalidateAdminCompanies() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: adminPendingCompaniesKey() });
    queryClient.invalidateQueries({ queryKey: adminLatestCompaniesKey() });
    queryClient.invalidateQueries({ queryKey: adminAllCompaniesKey() });
    queryClient.invalidateQueries({ queryKey: adminDashboardKey() });
  };
}

export function useApproveCompany() {
  const invalidate = useInvalidateAdminCompanies();
  return useMutation({
    mutationFn: (companyId: number) =>
      apiFetch<{ message: string }>(
        `/api/admin/companies/${companyId}/approve`,
        {
          method: "POST",
        }
      ),
    onSuccess: invalidate,
  });
}

export function useRejectCompany() {
  const invalidate = useInvalidateAdminCompanies();
  return useMutation({
    mutationFn: ({
      companyId,
      ...body
    }: RejectCompanyRequestDTO & { companyId: number }) =>
      apiFetch<{ message: string }>(
        `/api/admin/companies/${companyId}/reject`,
        {
          method: "POST",
          body,
        }
      ),
    onSuccess: invalidate,
  });
}
