"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataAccessLogs } from "@/hooks/queries/useDataAccessLogs";
import type { DataAccessLogFilters } from "@/types/audit";

const PAGE_SIZE = 50;

function toNumberOrUndefined(v: string): number | undefined {
  const t = v.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export default function AdminDataAccessLogsPage() {
  // Rascunho dos filtros (inputs) vs. filtros aplicados (query).
  const [adminId, setAdminId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState<DataAccessLogFilters>({ page: 0 });

  const { data, isLoading, isFetching } = useDataAccessLogs({
    ...applied,
    size: PAGE_SIZE,
  });

  function apply(page = 0) {
    setApplied({
      adminUserId: toNumberOrUndefined(adminId),
      targetUserId: toNumberOrUndefined(targetId),
      from: from || undefined,
      to: to || undefined,
      page,
    });
  }

  function clear() {
    setAdminId("");
    setTargetId("");
    setFrom("");
    setTo("");
    setApplied({ page: 0 });
  }

  const page = applied.page ?? 0;
  const total = data?.totalElements ?? 0;
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = page * PAGE_SIZE + (data?.content.length ?? 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Auditoria de acesso a dados
        </h1>
        <p className="text-muted-foreground text-sm">
          Registro de cada acesso administrativo a dado pessoal de um usuário —
          quem acessou, de quem, qual ação e quando (LGPD).
        </p>
      </div>

      <div className="border-border bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-md border p-3 text-xs">
        <Lock className="size-3.5 shrink-0" />
        Este log é imutável: nenhuma entrada pode ser editada ou apagada pela
        aplicação, nem por um administrador.
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-admin">ID do admin</Label>
            <Input
              id="f-admin"
              inputMode="numeric"
              className="w-32"
              placeholder="ex.: 3"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-target">ID do usuário-alvo</Label>
            <Input
              id="f-target"
              inputMode="numeric"
              className="w-36"
              placeholder="ex.: 42"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-from">De</Label>
            <Input
              id="f-from"
              type="date"
              className="w-40"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-to">Até</Label>
            <Input
              id="f-to"
              type="date"
              className="w-40"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <Button onClick={() => apply(0)}>Filtrar</Button>
          <Button variant="ghost" onClick={clear}>
            Limpar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Usuário-alvo</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Endpoint</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.content.length > 0 ? (
                  data.content.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(row.at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <span className="block">{row.adminEmail ?? "—"}</span>
                        <span className="text-muted-foreground text-xs">
                          #{row.adminUserId ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.targetUserId ? (
                          <>
                            <span className="block">
                              {row.targetUserEmail ?? "—"}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              #{row.targetUserId} · {row.targetType}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {row.targetType === "NONE"
                              ? "acesso amplo"
                              : `${row.targetType ?? "—"} #${row.targetEntityId ?? "—"}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{row.action}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.httpMethod} {row.endpoint}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      Nenhum registro para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total === 0
            ? "0 registros"
            : `${rangeStart}–${rangeEnd} de ${total}`}
          {isFetching ? " · atualizando…" : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || isFetching}
            onClick={() => apply(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.hasMore || isFetching}
            onClick={() => apply(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
