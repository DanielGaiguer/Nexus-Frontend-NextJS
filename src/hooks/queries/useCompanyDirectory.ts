import { useInfiniteQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyDirectoryPageDTO } from "@/types/company";

const PAGE_SIZE = 50;

export const companyDirectoryKey = (search: string) =>
  ["public", "companies", search] as const;

/** Diretório de empresas paginado (pro-companies.html) — mesma paginação/tamanho de página do app antigo. */
export function useCompanyDirectory(search: string) {
  return useInfiniteQuery({
    queryKey: companyDirectoryKey(search),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      return apiFetch<CompanyDirectoryPageDTO>(
        `/api/public/companies?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });
}
