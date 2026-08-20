import type { MonthlyMatchDTO } from "@/types/analytics";

/**
 * Barras simples (sem lib de gráfico) pra "matches por mês" — os últimos 6
 * meses que o backend devolveu. Uma lib de charts de verdade (dataviz) entra
 * quando o dashboard analítico completo for portado.
 */
export function MonthlyMatchesBars({ data }: { data: MonthlyMatchDTO[] }) {
  const months = data.slice(-6);
  const max = Math.max(1, ...months.map((m) => m.totalMatches));

  return (
    <div className="flex h-32 items-end gap-2">
      {months.map((month) => (
        <div
          key={`${month.year}-${month.month}`}
          className="flex flex-1 flex-col items-center gap-1.5"
        >
          <div className="flex h-24 w-full items-end">
            <div
              className="bg-primary w-full rounded-t-sm"
              style={{ height: `${(month.totalMatches / max) * 100}%` }}
              title={`${month.totalMatches} match(es) em ${month.monthLabel}`}
            />
          </div>
          <span className="text-muted-foreground text-[10px]">
            {month.monthLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
