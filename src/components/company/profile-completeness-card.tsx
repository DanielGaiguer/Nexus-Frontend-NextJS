import { CircleDashed } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CompanyProfileDTO } from "@/types/company";

/** Espelha nexus-profile-completeness.js :: CRITERIA_CO (nexus-frontend antigo) — mesmos campos e pesos. */
const criteria: {
  key: keyof CompanyProfileDTO;
  label: string;
  weight: number;
}[] = [
  { key: "companyName", label: "Nome da empresa", weight: 10 },
  { key: "phone", label: "Telefone", weight: 8 },
  { key: "cep", label: "Localização (CEP)", weight: 10 },
  { key: "profilePhotoUrl", label: "Logo/foto da empresa", weight: 15 },
  { key: "description", label: "Descrição da empresa", weight: 20 },
  { key: "taxId", label: "CNPJ", weight: 12 },
  { key: "email", label: "E-mail de contato", weight: 10 },
  { key: "city", label: "Cidade e estado", weight: 15 },
  { key: "linkedinUrl", label: "LinkedIn", weight: 8 },
];

function isFilled(value: unknown) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/** Mesmos limiares de cor/rótulo do widget original. */
function tierFor(percent: number) {
  if (percent >= 90)
    return {
      text: "text-success",
      bar: "bg-success",
      label: "Perfil completo",
    };
  if (percent >= 70)
    return { text: "text-primary", bar: "bg-primary", label: "Quase lá" };
  if (percent >= 50)
    return { text: "text-warning", bar: "bg-warning", label: "Em andamento" };
  return {
    text: "text-destructive",
    bar: "bg-destructive",
    label: "Perfil incompleto",
  };
}

export function ProfileCompletenessCard({
  profile,
}: {
  profile: CompanyProfileDTO;
}) {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const missing = criteria.filter((c) => !isFilled(profile[c.key]));
  const earnedWeight =
    totalWeight - missing.reduce((sum, c) => sum + c.weight, 0);
  const percent = Math.round((earnedWeight / totalWeight) * 100);
  const tier = tierFor(percent);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Completude do perfil</CardTitle>
        <span className={cn("text-sm font-bold tabular-nums", tier.text)}>
          {percent}%
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress
          value={percent}
          className="h-1.5"
          indicatorClassName={tier.bar}
        />
        <p className={cn("text-xs font-medium", tier.text)}>{tier.label}</p>

        {missing.length > 0 && (
          <div className="pt-2">
            <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
              O que está faltando
            </p>
            <div className="flex flex-col gap-1">
              {missing.map((c) => (
                <div
                  key={c.key}
                  className="text-muted-foreground flex items-center gap-1.5 text-xs"
                >
                  <CircleDashed className="size-3" />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
