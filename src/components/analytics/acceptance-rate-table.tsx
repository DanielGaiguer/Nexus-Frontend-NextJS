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
export function AcceptanceRateTable({
  rows,
  nameHeader,
}: {
  rows: AcceptanceRateRow[];
  nameHeader: string;
}) {
  return (
    <div className="overflow-x-auto">
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
                  <Badge
                    className={
                      row.acceptanceRate >= 60
                        ? "bg-success/15 text-success"
                        : row.acceptanceRate >= 30
                          ? "bg-warning/15 text-warning"
                          : "bg-destructive/15 text-destructive"
                    }
                  >
                    {row.acceptanceRate.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
