import { Progress } from "@/components/ui/progress";
import type { CompanyAcceptanceRateDTO } from "@/types/analytics";

export function AcceptanceRateList({
  data,
}: {
  data: CompanyAcceptanceRateDTO[];
}) {
  const top = [...data]
    .sort((a, b) => b.totalMatches - a.totalMatches)
    .slice(0, 6);

  return (
    <div className="space-y-3">
      {top.map((item) => (
        <div key={item.companyId} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="truncate font-medium">{item.companyName}</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {item.confirmedMatches}/{item.totalMatches} ·{" "}
              {item.acceptanceRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={item.acceptanceRate} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}
