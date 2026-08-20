import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { AdminDashboardDTO } from "@/types/admin";

export const adminDashboardKey = () => ["admin", "dashboard"] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKey(),
    queryFn: () => apiFetch<AdminDashboardDTO>("/api/admin/dashboard"),
  });
}
