import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AcceptanceRateRow {
  id: number;
  name: string;
  totalMatches: number;
  confirmedMatches: number;
  rejectedMatches: number;
  acceptanceRate: number;
}

/**
 * Tabela "Desempenho por X" (projeto/vaga/empresa) — mesmas colunas e
 * mesmos limiares de cor da badge de taxa (>=60 sucesso, >=30 alerta,
 * abaixo perigo) das tabelas equivalentes no dashboard antigo.
 */
function rateBadgeClass(rate: number) {
  return rate >= 60
    ? "bg-success/15 text-success"
    : rate >= 30
      ? "bg-warning/15 text-warning"
      : "bg-destructive/15 text-destructive";
}

export function AcceptanceRateTable({
  rows,
  nameHeader,
}: {
  rows: AcceptanceRateRow[];
  nameHeader: string;
}) {
  return (
    <>
      {/* Mobile: lista de cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => {
          const pending = Math.max(
            0,
            row.totalMatches - row.confirmedMatches - row.rejectedMatches
          );
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 font-medium break-words">
                  {row.name}
                </span>
                <Badge
                  className={`shrink-0 ${rateBadgeClass(row.acceptanceRate)}`}
                >
                  {row.acceptanceRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Total</div>
                  <div className="tabular-nums">{row.totalMatches}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Confirm.</div>
                  <div className="text-success tabular-nums">
                    {row.confirmedMatches}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pendentes</div>
                  <div className="text-warning tabular-nums">{pending}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rejeit.</div>
                  <div className="text-destructive tabular-nums">
                    {row.rejectedMatches}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameHeader}</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Confirmados</TableHead>
              <TableHead>Pendentes</TableHead>
              <TableHead>Rejeitados</TableHead>
              <TableHead>Taxa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const pending = Math.max(
                0,
                row.totalMatches - row.confirmedMatches - row.rejectedMatches
              );
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {row.totalMatches}
                  </TableCell>
                  <TableCell className="text-success tabular-nums">
                    {row.confirmedMatches}
                  </TableCell>
                  <TableCell className="text-warning tabular-nums">
                    {pending}
                  </TableCell>
                  <TableCell className="text-destructive tabular-nums">
                    {row.rejectedMatches}
                  </TableCell>
                  <TableCell>
                    <Badge className={rateBadgeClass(row.acceptanceRate)}>
                      {row.acceptanceRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
