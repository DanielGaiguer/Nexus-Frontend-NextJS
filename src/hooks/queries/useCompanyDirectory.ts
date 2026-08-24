import { useInfiniteQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyDirectoryPageDTO, CompanyType } from "@/types/company";

const PAGE_SIZE = 50;

export const companyDirectoryKey = (search: string, type?: CompanyType) =>
  ["public", "companies", search, type ?? "ALL"] as const;

/** Diretório de contratantes paginado (pro-companies.html) — mesma paginação/tamanho de página do app antigo. */
export function useCompanyDirectory(search: string, type?: CompanyType) {
  return useInfiniteQuery({
    queryKey: companyDirectoryKey(search, type),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      return apiFetch<CompanyDirectoryPageDTO>(
        `/api/public/companies?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });
}
