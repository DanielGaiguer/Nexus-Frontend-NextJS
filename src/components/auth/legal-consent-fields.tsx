"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Os 3 checkboxes de consentimento LGPD do cadastro. Compartilhado pelos 3
 * formulários (profissional, empresa, empresa via LinkedIn) — os schemas de
 * validação espalham `legalConsentShape`, então os nomes dos campos
 * (`acceptedTermsOfUse`, `acceptedMarketingCommunications`,
 * `acceptedAlgorithmImprovement`) existem em todos. Usa o contexto do
 * `<Form>` (FormProvider), então não precisa receber `control` por prop.
 *
 * `acceptedTermsOfUse` é obrigatório: o schema trava o submit se desmarcado e
 * o backend rejeita com 400.
 */
export function LegalConsentFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="acceptedTermsOfUse"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="font-normal">
                Li e aceito os{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  Política de Privacidade
                </Link>
                . <span className="text-destructive">*</span>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="acceptedMarketingCommunications"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-muted-foreground font-normal">
                Aceito receber comunicações de marketing do Nexus (novidades,
                dicas e conteúdos). Opcional.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="acceptedAlgorithmImprovement"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-muted-foreground font-normal">
                Autorizo o uso de dados para melhoria do algoritmo de
                compatibilidade. Opcional — não afeta o cálculo do seu próprio
                score.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
