"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Control,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
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
import {
  useCreateAssessmentTemplate,
  useUpdateAssessmentTemplate,
} from "@/hooks/mutations/useAssessmentTemplateMutations";
import { ApiError } from "@/lib/api-client";
import {
  assessmentTemplateFormSchema,
  type AssessmentTemplateFormValues,
} from "@/lib/validation";
import type { AssessmentTemplateResponseDTO } from "@/types/assessment-template";

const questionTypeOptions = [
  { value: "MULTIPLE_CHOICE" as const, label: "Múltipla escolha" },
  { value: "ESSAY" as const, label: "Dissertativa" },
];

function newTemplateQuestion() {
  return {
    type: "MULTIPLE_CHOICE" as const,
    prompt: "",
    options: [{ value: "" }, { value: "" }],
    correctOptionIndex: "",
  };
}

function toFormValues(
  template?: AssessmentTemplateResponseDTO
): AssessmentTemplateFormValues {
  if (!template) {
    return {
      title: "",
      instructions: "",
      responseDeadlineDays: "3",
      questions: [newTemplateQuestion()],
    };
  }
  return {
    title: template.title,
    instructions: template.instructions ?? "",
    responseDeadlineDays: template.responseDeadlineDays.toString(),
    questions: template.questions.map((q) => ({
      type: q.type,
      prompt: q.prompt,
      // O editor de alternativas assume ao menos duas linhas; uma dissertativa não tem
      // alternativa nenhuma, então nasce com o par vazio (que a validação ignora fora de
      // MULTIPLE_CHOICE, ver assessmentTemplateQuestionSchema).
      options:
        q.options.length >= 2
          ? q.options.map((value) => ({ value }))
          : [{ value: "" }, { value: "" }],
      correctOptionIndex:
        q.correctOptionIndex != null ? q.correctOptionIndex.toString() : "",
    })),
  };
}

function OptionsField({
  control,
  questionIndex,
}: {
  control: Control<AssessmentTemplateFormValues>;
  questionIndex: number;
}) {
  const options = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <FormField
      control={control}
      name={`questions.${questionIndex}.correctOptionIndex`}
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
                  name={`questions.${questionIndex}.options.${optionIndex}.value`}
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

function QuestionCard({
  control,
  questionIndex,
  onRemove,
}: {
  control: Control<AssessmentTemplateFormValues>;
  questionIndex: number;
  onRemove: () => void;
}) {
  const type = useWatch({ control, name: `questions.${questionIndex}.type` });

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
        name={`questions.${questionIndex}.type`}
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
        name={`questions.${questionIndex}.prompt`}
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
        <OptionsField control={control} questionIndex={questionIndex} />
      ) : (
        <p className="text-muted-foreground text-xs">
          Questão dissertativa — a empresa lê a resposta ao decidir se o
          candidato avança de etapa.
        </p>
      )}
    </div>
  );
}

/**
 * Editor de um molde. Mesmo formato do editor de etapas da vaga, de propósito: quem já montou um
 * processo seletivo não precisa reaprender nada aqui.
 *
 * `kind` não é campo: o backend só aceita QUESTIONS num molde (comportamental é banco fixo de
 * plataforma, vídeo é pergunta sobre uma vaga concreta), então oferecer a escolha só produziria
 * um 400.
 */
export function AssessmentTemplateForm({
  template,
  onSaved,
}: {
  template?: AssessmentTemplateResponseDTO;
  onSaved: () => void;
}) {
  const createTemplate = useCreateAssessmentTemplate();
  const updateTemplate = useUpdateAssessmentTemplate();
  const isPending = createTemplate.isPending || updateTemplate.isPending;

  const form = useForm<AssessmentTemplateFormValues>({
    resolver: zodResolver(assessmentTemplateFormSchema),
    defaultValues: toFormValues(template),
  });
  const questions = useFieldArray({ control: form.control, name: "questions" });

  function onSubmit(values: AssessmentTemplateFormValues) {
    const body = {
      title: values.title,
      kind: "QUESTIONS" as const,
      instructions: values.instructions.trim() || null,
      responseDeadlineDays: Number(values.responseDeadlineDays),
      questions: values.questions.map((q) => ({
        type: q.type,
        prompt: q.prompt,
        options:
          q.type === "MULTIPLE_CHOICE"
            ? q.options.map((o) => o.value.trim()).filter((v) => v !== "")
            : [],
        correctOptionIndex:
          q.type === "MULTIPLE_CHOICE" && q.correctOptionIndex !== ""
            ? Number(q.correctOptionIndex)
            : null,
      })),
    };

    const onError = (error: unknown) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o teste."
      );

    const onSuccess = () => {
      toast.success(
        template
          ? "Teste atualizado. Vagas que já aplicaram este teste não mudam."
          : "Teste criado."
      );
      onSaved();
    };

    if (template) {
      updateTemplate.mutate(
        { id: template.id, ...body },
        { onSuccess, onError }
      );
    } else {
      createTemplate.mutate(body, { onSuccess, onError });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do teste</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Lógica — nível básico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responseDeadlineDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo padrão (dias)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          {questions.fields.map((field, index) => (
            <QuestionCard
              key={field.id}
              control={form.control}
              questionIndex={index}
              onRemove={() => questions.remove(index)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => questions.append(newTemplateQuestion())}
          >
            <Plus className="size-4" />
            Adicionar questão
          </Button>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar teste"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
