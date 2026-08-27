"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  type Control,
  useFieldArray,
  useWatch,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormValues } from "@/lib/validation";

const questionTypeOptions = [
  { value: "MULTIPLE_CHOICE" as const, label: "Múltipla escolha" },
  { value: "ESSAY" as const, label: "Dissertativa" },
];

export function newScreeningStage() {
  return {
    id: null,
    title: "",
    instructions: "",
    responseDeadlineDays: "3",
    questions: [newScreeningQuestion()],
  };
}

export function newScreeningQuestion() {
  return {
    id: null,
    type: "MULTIPLE_CHOICE" as const,
    prompt: "",
    options: [{ value: "" }, { value: "" }],
    correctOptionIndex: "",
  };
}

function QuestionOptionsField({
  control,
  stageIndex,
  questionIndex,
}: {
  control: Control<ProjectFormValues>;
  stageIndex: number;
  questionIndex: number;
}) {
  const options = useFieldArray({
    control,
    name: `screeningStages.${stageIndex}.questions.${questionIndex}.options`,
  });

  return (
    <FormField
      control={control}
      name={`screeningStages.${stageIndex}.questions.${questionIndex}.correctOptionIndex`}
      render={({ field: correctField }) => (
        <FormItem>
          <FormLabel>Alternativas — selecione a correta</FormLabel>
          <RadioGroup
            value={correctField.value}
            onValueChange={correctField.onChange}
            className="space-y-2"
          >
            {options.fields.map((optionField, optionIndex) => (
              <div key={optionField.id} className="flex items-center gap-2">
                <RadioGroupItem
                  value={optionIndex.toString()}
                  aria-label={`Marcar alternativa ${optionIndex + 1} como correta`}
                />
                <FormField
                  control={control}
                  name={`screeningStages.${stageIndex}.questions.${questionIndex}.options.${optionIndex}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Alternativa ${optionIndex + 1}`}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    options.remove(optionIndex);
                    if (correctField.value === optionIndex.toString()) {
                      correctField.onChange("");
                    }
                  }}
                  aria-label="Remover alternativa"
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            ))}
          </RadioGroup>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => options.append({ value: "" })}
          >
            <Plus className="size-4" />
            Adicionar alternativa
          </Button>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function QuestionFields({
  control,
  stageIndex,
  questionIndex,
  onRemove,
}: {
  control: Control<ProjectFormValues>;
  stageIndex: number;
  questionIndex: number;
  onRemove: () => void;
}) {
  const type = useWatch({
    control,
    name: `screeningStages.${stageIndex}.questions.${questionIndex}.type`,
  });

  return (
    <div className="bg-muted/20 space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Questão {questionIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remover questão"
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>

      <FormField
        control={control}
        name={`screeningStages.${stageIndex}.questions.${questionIndex}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {questionTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`screeningStages.${stageIndex}.questions.${questionIndex}.prompt`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enunciado</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {type === "MULTIPLE_CHOICE" ? (
        <QuestionOptionsField
          control={control}
          stageIndex={stageIndex}
          questionIndex={questionIndex}
        />
      ) : (
        <p className="text-muted-foreground text-xs">
          Questão dissertativa — a empresa lê a resposta ao decidir se o
          candidato avança de etapa.
        </p>
      )}
    </div>
  );
}

function StageFields({
  control,
  stageIndex,
  onRemove,
}: {
  control: Control<ProjectFormValues>;
  stageIndex: number;
  onRemove: () => void;
}) {
  const questions = useFieldArray({
    control,
    name: `screeningStages.${stageIndex}.questions`,
  });

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-primary text-sm font-semibold">
          Etapa {stageIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remover etapa"
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <FormField
          control={control}
          name={`screeningStages.${stageIndex}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da etapa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Triagem inicial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`screeningStages.${stageIndex}.responseDeadlineDays`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo (dias)</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`screeningStages.${stageIndex}.instructions`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instruções da etapa (opcional)</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        {questions.fields.map((field, questionIndex) => (
          <QuestionFields
            key={field.id}
            control={control}
            stageIndex={stageIndex}
            questionIndex={questionIndex}
            onRemove={() => questions.remove(questionIndex)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => questions.append(newScreeningQuestion())}
        >
          <Plus className="size-4" />
          Adicionar questão
        </Button>
      </div>
    </div>
  );
}

/** Construtor das etapas do processo seletivo, embutido no cadastro/edição da vaga --
 * useFieldArray aninhado em três níveis (etapas > questões > alternativas). Editar/remover é
 * sempre permitido, mesmo com candidatos já em andamento (ver
 * ScreeningQuestionnaireService.mergeStages -- sem efeito retroativo). */
export function ScreeningStagesField({
  control,
}: {
  control: Control<ProjectFormValues>;
}) {
  const stages = useFieldArray({ control, name: "screeningStages" });

  return (
    <div className="space-y-4">
      {stages.fields.map((field, stageIndex) => (
        <StageFields
          key={field.id}
          control={control}
          stageIndex={stageIndex}
          onRemove={() => stages.remove(stageIndex)}
        />
      ))}
      {stages.fields.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Adicione ao menos uma etapa para habilitar o processo seletivo.
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => stages.append(newScreeningStage())}
      >
        <Plus className="size-4" />
        Adicionar etapa
      </Button>
    </div>
  );
}
