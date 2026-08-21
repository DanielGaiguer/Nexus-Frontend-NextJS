"use client";

import { type ColumnDef, type RowData, useTable } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  adminTableFeatures,
  type AdminTableFeatures,
} from "@/components/admin/table-features";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** `DataTable` genérico do admin — ordenação por coluna, busca global e paginação (10/página). */
export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
}: {
  // Array de colunas heterogêneo (cada uma com seu próprio TValue de
  // accessor) — igual ao v8, só tipa em ColumnDef<Features, TData, any>[].
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<AdminTableFeatures, TData, any>[];
  data: TData[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}) {
  const table = useTable({
    features: adminTableFeatures,
    columns,
    data,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          value={table.state.globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="bg-card min-w-0 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="hover:text-foreground flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="text-muted-foreground/50 size-3.5" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center whitespace-normal"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Página {table.state.pagination.pageIndex + 1} de{" "}
            {table.getPageCount()} · {table.getRowCount()} registro(s)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
