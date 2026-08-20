import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReputationExplanationDTO } from "@/types/company";

const breakdownRows: { key: keyof ReputationExplanationDTO; label: string }[] =
  [
    { key: "technicalCompetence", label: "Competência técnica" },
    { key: "communication", label: "Comunicação" },
    { key: "reliability", label: "Confiabilidade" },
    { key: "punctuality", label: "Pontualidade" },
    { key: "professionalism", label: "Profissionalismo" },
  ];

export function ReputationCard({
  reputation,
}: {
  reputation: ReputationExplanationDTO | null;
}) {
  const hasReviews =
    reputation?.totalReviews != null && reputation.totalReviews > 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Análise de qualidade</CardTitle>
        {hasReviews && (
          <span className="text-muted-foreground text-xs">
            {reputation!.totalReviews} avaliação(ões)
          </span>
        )}
      </CardHeader>
      <CardContent>
        {!hasReviews ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma avaliação ainda.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">
                {Math.round(reputation!.overallScore ?? 0)} / 100
              </div>
            </div>

            {reputation!.confidencePercent != null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confiança</span>
                  <span className="text-primary font-semibold tabular-nums">
                    {Math.round(reputation!.confidencePercent)}%
                  </span>
                </div>
                <Progress
                  value={reputation!.confidencePercent}
                  className="h-1.5"
                />
              </div>
            )}

            <div className="space-y-3">
              {breakdownRows.map(({ key, label }) => {
                const value = reputation![key];
                if (value == null) return null;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="tabular-nums">
                        {(value / 20).toFixed(1)}
                      </span>
                    </div>
                    <Progress value={value} className="h-1" />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {reputation!.satisfactionAverage != null && (
                <div className="bg-primary/5 rounded-md border p-3">
                  <div className="text-muted-foreground text-[11px] uppercase">
                    Satisfação média
                  </div>
                  <div className="text-primary text-lg font-bold tabular-nums">
                    {(reputation!.satisfactionAverage * 20).toFixed(1)}
                    <span className="text-muted-foreground text-xs font-medium">
                      {" "}
                      / 100
                    </span>
                  </div>
                </div>
              )}
              {reputation!.recommendationRate != null && (
                <div className="bg-success/5 rounded-md border p-3">
                  <div className="text-muted-foreground text-[11px] uppercase">
                    Recomendam
                  </div>
                  <div className="text-success text-lg font-bold tabular-nums">
                    {reputation!.recommendationRate.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
