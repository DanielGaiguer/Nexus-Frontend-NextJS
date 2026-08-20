import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * TanStack Table v9 trocou a API — não é mais `useReactTable` com
 * `getCoreRowModel()`/`getFilteredRowModel()` como opções; agora as
 * features (ordenação, filtro, paginação) são registradas explicitamente
 * num objeto `tableFeatures` compartilhado, e `createColumnHelper` é
 * genérico sobre esse objeto (ver node_modules/@tanstack/react-table/skills
 * — a versão instalada é a 9.1.2, bem diferente da v8 que treinou este
 * modelo). Um único objeto de features, reaproveitado por todo `DataTable`
 * do admin (usuários, empresas pendentes, oportunidades).
 */
export const adminTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type AdminTableFeatures = typeof adminTableFeatures;
