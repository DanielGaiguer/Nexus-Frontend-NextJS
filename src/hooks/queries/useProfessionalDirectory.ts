import { useInfiniteQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalDirectoryPageDTO } from "@/types/professional";

const PAGE_SIZE = 50;

export const professionalDirectoryKey = (search: string) =>
  ["public", "professionals", search] as const;

export function useProfessionalDirectory(search: string) {
  return useInfiniteQuery({
    queryKey: professionalDirectoryKey(search),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      return apiFetch<ProfessionalDirectoryPageDTO>(
        `/api/public/professionals?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });
}
