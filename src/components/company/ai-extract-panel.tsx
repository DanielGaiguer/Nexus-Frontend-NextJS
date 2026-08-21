"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiExtractProject } from "@/hooks/mutations/useProjectMutations";
import { ApiError } from "@/lib/api-client";
import type { ProjectFormValues } from "@/lib/validation";
import type { AiSkillSuggestionDTO } from "@/types/project";

/**
 * company-project-form.html :: "Preencher com IA (opcional)" — cola texto
 * livre (briefing, post de LinkedIn, ...) e a IA tenta pré-preencher o
 * formulário abaixo. Nada é publicado automaticamente; a empresa revisa e
 * edita livremente antes de enviar. Só aparece na criação (não na edição),
 * igual ao original.
 */
export function AiExtractPanel({
  form,
}: {
  form: UseFormReturn<ProjectFormValues>;
}) {
  const [rawText, setRawText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [unmatchedSkills, setUnmatchedSkills] = useState<string[]>([]);
  const [typeAmbiguous, setTypeAmbiguous] = useState(false);
  const aiExtract = useAiExtractProject();

  function handleExtract() {
    setInputError(null);
    setUnmatchedSkills([]);
    setTypeAmbiguous(false);

    if (rawText.trim().length < 20) {
      setInputError(
        "Cole um texto mais completo (pelo menos 20 caracteres) para a IA analisar."
      );
      return;
    }

    aiExtract.mutate(rawText.trim(), {
      onSuccess: ({ suggestion: s }) => {
        if (s.opportunityType === "PROJECT" || s.opportunityType === "JOB") {
          form.setValue("opportunityType", s.opportunityType);
        } else {
          setTypeAmbiguous(true);
        }

        setIfPresent(form, "title", s.title);
        setIfPresent(form, "description", s.description);
        setIfPresent(form, "type", s.type);
        setIfPresent(form, "workMode", s.workMode);
        setIfPresent(form, "experienceLevel", s.experienceLevel);
        setIfPresent(form, "maxPositions", s.maxPositions?.toString());
        setIfPresent(form, "cep", s.cep);

        if (s.opportunityType === "PROJECT") {
          setIfPresent(form, "minimumBudget", s.minimumBudget?.toString());
          setIfPresent(form, "maximumBudget", s.maximumBudget?.toString());
          setIfPresent(form, "deadline", s.deadline);
        } else if (s.opportunityType === "JOB") {
          setIfPresent(form, "contractType", s.contractType);
          setIfPresent(
            form,
            "workloadHoursPerWeek",
            s.workloadHoursPerWeek?.toString()
          );
          setIfPresent(
            form,
            "monthlySalaryMin",
            s.monthlySalaryMin?.toString()
          );
          setIfPresent(
            form,
            "monthlySalaryMax",
            s.monthlySalaryMax?.toString()
          );
          setIfPresent(form, "startDate", s.startDate);
          if (s.benefits && s.benefits.length > 0) {
            form.setValue("benefits", s.benefits.join(", "));
          }
        }

        const suggested = [
          ...(s.requiredSkills ?? []),
          ...(s.niceToHaveSkills ?? []),
        ];
        applySkillSuggestions(form, suggested, setUnmatchedSkills);
      },
      onError: (error) => {
        setInputError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível processar o texto agora. Preencha manualmente ou tente novamente."
        );
      },
    });
  }

  return (
    <div className="bg-accent/30 space-y-2 rounded-lg border p-4">
      <label className="flex items-center gap-1.5 text-sm font-medium">
        <Sparkles className="text-primary size-4" />
        Preencher com IA (opcional)
      </label>
      <Textarea
        className="min-h-24"
        placeholder="Cole aqui a descrição da vaga/projeto como você já tem escrita (ex: um texto informal, um post de LinkedIn, um briefing) — a IA tenta pré-preencher os campos abaixo para você revisar."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground max-w-md text-xs">
          Nada é publicado automaticamente. Revise e edite livremente antes de
          publicar.
        </p>
        <Button
          type="button"
          size="sm"
          disabled={aiExtract.isPending}
          onClick={handleExtract}
        >
          <Sparkles className="size-4" />
          {aiExtract.isPending ? "Analisando…" : "Preencher com IA"}
        </Button>
      </div>

      {inputError && <p className="text-destructive text-sm">{inputError}</p>}
      {typeAmbiguous && (
        <p className="text-warning text-sm">
          Não identificamos com segurança se é Projeto ou Vaga de emprego —
          selecione manualmente antes de continuar preenchendo.
        </p>
      )}
      {unmatchedSkills.length > 0 && (
        <p className="text-warning flex items-start gap-1.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            A IA mencionou estas skills, mas elas não estão no catálogo:{" "}
            {unmatchedSkills.map((name, i) => (
              <span key={name}>
                <strong>{name}</strong>
                {i < unmatchedSkills.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        </p>
      )}
    </div>
  );
}

// react-hook-form tipa `setValue` por path literal — como aqui os nomes de
// campo vêm de uma lista dinâmica de sugestões da IA, o cast é inevitável
// (os nomes em si são sempre chaves reais de ProjectFormValues, checados
// nos call sites abaixo).
function setIfPresent(
  form: UseFormReturn<ProjectFormValues>,
  name: keyof ProjectFormValues,
  value: string | null | undefined
) {
  if (value === null || value === undefined || value === "") return;
  form.setValue(
    name as never,
    value as never,
    { shouldValidate: false } as never
  );
}

function applySkillSuggestions(
  form: UseFormReturn<ProjectFormValues>,
  suggestions: AiSkillSuggestionDTO[],
  setUnmatched: (names: string[]) => void
) {
  const unmatched: string[] = [];
  const matchedIds: number[] = [];

  for (const sk of suggestions) {
    if (sk.foundInCatalog && sk.matchedSkillId != null) {
      matchedIds.push(sk.matchedSkillId);
    } else if (sk.extractedName) {
      unmatched.push(sk.extractedName);
    }
  }

  if (matchedIds.length > 0) {
    const current = form.getValues("skillIds");
    const merged = Array.from(new Set([...current, ...matchedIds])).slice(
      0,
      15
    );
    form.setValue("skillIds", merged);
  }
  setUnmatched(unmatched);
}
