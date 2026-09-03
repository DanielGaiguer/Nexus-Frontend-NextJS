import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DataAccessLogFilters, DataAccessLogPageDTO } from "@/types/audit";

export const dataAccessLogsKey = (filters: DataAccessLogFilters) =>
  ["admin", "data-access-logs", filters] as const;

function toQueryString(filters: DataAccessLogFilters): string {
  const params = new URLSearchParams();
  if (filters.adminUserId != null)
    params.set("adminUserId", String(filters.adminUserId));
  if (filters.targetUserId != null)
    params.set("targetUserId", String(filters.targetUserId));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 50));
  return params.toString();
}

export function useDataAccessLogs(filters: DataAccessLogFilters) {
  return useQuery({
    queryKey: dataAccessLogsKey(filters),
    queryFn: () =>
      apiFetch<DataAccessLogPageDTO>(
        `/api/admin/data-access-logs?${toQueryString(filters)}`
      ),
    placeholderData: keepPreviousData,
  });
}
