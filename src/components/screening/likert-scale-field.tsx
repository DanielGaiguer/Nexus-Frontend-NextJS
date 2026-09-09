"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LIKERT_LABELS } from "@/types/screening";

/**
 * Item do inventário comportamental, numa escala de 5 pontos.
 *
 * O valor que trafega é o ÍNDICE (0..4), reaproveitando
 * ScreeningAnswerSubmitDTO.selectedOptionIndex -- por isso a etapa comportamental não precisou de
 * nenhuma coluna nova pra resposta. Os rótulos são fixos e não vêm do servidor (a escala é a
 * mesma em todo item; ver LIKERT_LABELS, espelhado de ScreeningLikertScale no backend).
 */
export function LikertScaleField({
  questionId,
  value,
  onChange,
}: {
  questionId: number;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <RadioGroup
      value={value?.toString() ?? ""}
      onValueChange={(next) => onChange(Number(next))}
      // Empilhado no celular e em linha no desktop: a régua horizontal só é legível quando cabem
      // os cinco rótulos.
      className="grid gap-2 sm:grid-cols-5 sm:gap-1"
    >
      {LIKERT_LABELS.map((label, index) => (
        <label
          key={label}
          htmlFor={`likert-${questionId}-${index}`}
          className="hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors sm:flex-col sm:gap-1.5 sm:text-center sm:text-xs"
        >
          <RadioGroupItem
            id={`likert-${questionId}-${index}`}
            value={index.toString()}
          />
          <span>{label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
