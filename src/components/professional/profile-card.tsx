import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const preferredTypeLabels: Record<string, string> = {
  FREELANCE: "Freelance",
  FULL_TIME: "CLT",
  PART_TIME: "Meio período",
};

const opportunityTypeLabels: Record<string, string> = {
  JOB: "Vagas (CLT/PJ)",
  PROJECT: "Projetos (freelance)",
};

function money(value: number | null | undefined) {
  return value != null
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : null;
}

/**
 * Duas fontes de pretensão salarial coexistem no backend: o perfil visto
 * pelo próprio profissional/admin tem a quebra por regime (CLT/PJ/projeto,
 * `ProfessionalProfileDTO`); o perfil público (empresa, outro profissional)
 * só tem uma faixa agregada (`PublicProfessionalDTO.minimumSalary/
 * maximumSalary`) -- por isso o formato aceita os dois jeitos.
 */
export type SalarySummary =
  | {
      kind: "breakdown";
      clt: number | null;
      pj: number | null;
      freelanceMin: number | null;
      freelanceMax: number | null;
    }
  | { kind: "range"; min: number | null; max: number | null };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
      {children}
    </div>
  );
}

function SalaryValue({ salary }: { salary: SalarySummary }) {
  if (salary.kind === "range") {
    if (salary.min == null && salary.max == null) {
      return (
        <p className="text-muted-foreground text-sm">
          Nenhuma pretensão salarial informada.
        </p>
      );
    }
    return (
      <div className="font-medium">
        {money(salary.min) ?? "—"} – {money(salary.max) ?? "—"}
      </div>
    );
  }

  const { clt, pj, freelanceMin, freelanceMax } = salary;
  if (
    clt == null &&
    pj == null &&
    freelanceMin == null &&
    freelanceMax == null
  ) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma pretensão salarial informada.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {clt != null && (
        <div>
          <div className="text-muted-foreground text-[11px] uppercase">CLT</div>
          <div className="text-primary font-semibold tabular-nums">
            {money(clt)}/mês
          </div>
        </div>
      )}
      {pj != null && (
        <div>
          <div className="text-muted-foreground text-[11px] uppercase">PJ</div>
          <div className="text-primary font-semibold tabular-nums">
            {money(pj)}/mês
          </div>
        </div>
      )}
      {(freelanceMin != null || freelanceMax != null) && (
        <div>
          <div className="text-muted-foreground text-[11px] uppercase">
            Por projeto
          </div>
          <div className="text-primary font-semibold tabular-nums">
            {money(freelanceMin) ?? "—"} – {money(freelanceMax) ?? "—"}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Card único reunindo pretensão salarial + regime de interesse do
 * profissional (antes eram dois cards separados, repetidos em cada tela que
 * mostra um perfil de profissional). Sempre logo abaixo do card "Contato".
 * `projectBudget` é opcional -- só faz sentido nas telas onde o profissional
 * está sendo visto no contexto de um projeto/vaga específico.
 */
export function ProfileCard({
  salary,
  preferredTypes,
  preferredOpportunityTypes,
  projectBudget,
}: {
  salary: SalarySummary;
  preferredTypes?: string[];
  preferredOpportunityTypes?: string[];
  projectBudget?: { label: string; min: number | null; max: number | null };
}) {
  const hasRegime =
    (preferredTypes && preferredTypes.length > 0) ||
    (preferredOpportunityTypes && preferredOpportunityTypes.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <FieldLabel>Pretensão salarial</FieldLabel>
          <SalaryValue salary={salary} />
        </div>

        <div>
          <FieldLabel>Regime de interesse</FieldLabel>
          {hasRegime ? (
            <div className="flex flex-wrap gap-1.5">
              {preferredTypes?.map((type) => (
                <Badge key={type} variant="secondary">
                  {preferredTypeLabels[type] ?? type}
                </Badge>
              ))}
              {preferredOpportunityTypes?.map((type) => (
                <Badge key={type} variant="outline">
                  {opportunityTypeLabels[type] ?? type}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhum regime informado.
            </p>
          )}
        </div>

        {projectBudget &&
          (projectBudget.min != null || projectBudget.max != null) && (
            <div>
              <FieldLabel>{projectBudget.label}</FieldLabel>
              <div className="font-medium">
                {money(projectBudget.min) ?? "—"} –{" "}
                {money(projectBudget.max) ?? "—"}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
