import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { AdminSkillDTO } from "@/types/admin";

export const adminSkillsKey = () => ["admin", "skills"] as const;

export function useAdminSkills() {
  return useQuery({
    queryKey: adminSkillsKey(),
    queryFn: () => apiFetch<AdminSkillDTO[]>("/api/admin/skills"),
  });
}
