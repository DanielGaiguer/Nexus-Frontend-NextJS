import { Building2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompanyType } from "@/types/company";

/**
 * Selo visual do subtipo de contratante (Pessoa Física/CPF ou Empresa/CNPJ).
 * Diferenciação puramente visual — nenhuma regra de negócio depende dele.
 */
export function CompanyTypeBadge({
  type,
  className,
}: {
  type: CompanyType | null | undefined;
  className?: string;
}) {
  if (!type) return null;
  const isIndividual = type === "INDIVIDUAL";
  const Icon = isIndividual ? User : Building2;

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon className="size-3" />
      {isIndividual ? "Pessoa Física" : "Empresa"}
    </Badge>
  );
}
