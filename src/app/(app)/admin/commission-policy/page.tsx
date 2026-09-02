"use client";

import { Percent } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateCommissionPolicy } from "@/hooks/mutations/useCommissionPolicyActions";
import { useCommissionPolicy } from "@/hooks/queries/useCommissionPolicy";
import { ApiError } from "@/lib/api-client";

// Aceita vírgula ou ponto; devolve null quando fora de 0–100 ou não numérico.
function parsePercent(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

export default function AdminCommissionPolicyPage() {
  const { data: policy, isLoading } = useCommissionPolicy();
  const updatePolicy = useUpdateCommissionPolicy();
  const [value, setValue] = useState("");
  const seededRef = useRef(false);

  // Semeia o campo com o valor atual só na primeira vez que ele chega — um
  // refetch em segundo plano não deve sobrescrever o que o admin está digitando.
  useEffect(() => {
    if (policy && !seededRef.current) {
      setValue(String(policy.percentage));
      seededRef.current = true;
    }
  }, [policy]);

  const parsed = parsePercent(value);
  const invalid = value.trim() !== "" && parsed === null;
  const dirty =
    policy != null && parsed !== null && parsed !== policy.percentage;

  function handleSave() {
    if (parsed === null) {
      toast.error("Informe um percentual entre 0 e 100.");
      return;
    }
    updatePolicy.mutate(
      { percentage: parsed },
      {
        onSuccess: (saved) => {
          setValue(String(saved.percentage));
          toast.success("Percentual de comissão atualizado!");
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar o percentual."
          ),
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Política de comissão
        </h1>
        <p className="text-muted-foreground text-sm">
          Percentual que o Nexus cobra sobre contratações fechadas com sucesso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Percent className="text-primary size-4" />
            Percentual único
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="commission-percent">Comissão (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commission-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      inputMode="decimal"
                      className="w-32"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      aria-invalid={invalid}
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={!dirty || updatePolicy.isPending}
                  onClick={handleSave}
                >
                  {updatePolicy.isPending ? "Salvando…" : "Salvar"}
                </Button>
              </div>

              {invalid && (
                <p className="text-destructive text-xs">
                  Informe um número entre 0 e 100.
                </p>
              )}

              {policy?.updatedAt && (
                <p className="text-muted-foreground text-xs">
                  Última alteração em{" "}
                  {new Date(policy.updatedAt).toLocaleString("pt-BR")}
                  {policy.updatedByAdminEmail
                    ? ` por ${policy.updatedByAdminEmail}`
                    : ""}
                  .
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-muted-foreground space-y-2 text-sm">
        <p>
          As{" "}
          <strong className="text-foreground">
            3 primeiras contratações fechadas com sucesso
          </strong>{" "}
          de cada contratante são isentas de comissão. A partir da 4ª, o
          percentual acima passa a valer.
        </p>
        <p>
          Publicar oportunidade continua sempre gratuito. A cobrança ainda não
          está ativa — esta tela apenas define a configuração.
        </p>
      </div>
    </div>
  );
}
