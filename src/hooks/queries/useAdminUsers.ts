import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { UserSummaryDTO } from "@/types/admin";

export const adminUsersKey = () => ["admin", "users"] as const;

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUsersKey(),
    queryFn: () => apiFetch<UserSummaryDTO[]>("/api/admin/users"),
  });
}
