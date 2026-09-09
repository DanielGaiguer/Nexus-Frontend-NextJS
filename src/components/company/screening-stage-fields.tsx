"use client";

import { Brain, ListChecks, Plus, Trash2, Video } from "lucide-react";
import { type Control, useFieldArray, useWatch } from "react-hook-form";

import { ApplyTemplateButton } from "@/components/company/apply-template-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type {
  ProjectFormValues,
  ScreeningStageFormValues,
} from "@/lib/validation";
import {
  BEHAVIORAL_DISCLAIMER,
  type ScreeningStageKind,
  screeningStageKindLabels,
} from "@/types/screening";

const questionTypeOptions = [
  { value: "MULTIPLE_CHOICE" as const, label: "Múltipla escolha" },
  { value: "ESSAY" as const, label: "Dissertativa" },
];

const stageKindIcons: Record<ScreeningStageKind, typeof ListChecks> = {
  QUESTIONS: ListChecks,
  BEHAVIORAL: Brain,
  VIDEO: Video,
};

const stageKindDescriptions: Record<ScreeningStageKind, string> = {
  QUESTIONS: "Você escreve as perguntas (múltipla escolha ou dissertativa).",
  BEHAVIORAL:
    "Inventário Big Five pronto, igual para todos os candidatos — você não escreve nada.",
  VIDEO: "Você escreve a pergunta; o candidato responde gravando um vídeo.",
};

/**
 * Etapa nova. O `kind` é escolhido AQUI e não muda depois: o backend recusa trocar o tipo de uma
 * etapa já criada (trocaria o instrumento debaixo de quem está respondendo), então a UI nem
 * oferece o botão -- o tipo aparece como selo, não como campo.
 */
export function newScreeningStage(
  kind: ScreeningStageKind = "QUESTIONS"
): ScreeningStageFormValues {
  return {
    id: null,
    kind,
    sourceTemplateId: null,
    behavioralItemCount: null,
    title: "",
    instructions: "",
    responseDeadlineDays: "3",
    // Comportamental não tem questão nenhuma neste formulário: os itens vêm do banco fixo de
    // plataforma, montados no backend quando a etapa é criada.
    questions:
      kind === "BEHAVIORAL"
        ? []
        : [
            newScreeningQuestion(
              kind === "VIDEO" ? "VIDEO_RESPONSE" : "MULTIPLE_CHOICE"
            ),
          ],
  };
}

export function newScreeningQuestion(
  type: "MULTIPLE_CHOICE" | "ESSAY" | "VIDEO_RESPONSE" = "MULTIPLE_CHOICE"
) {
  return {
    id: null,
    type,
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
  stageKind,
  onRemove,
}: {
  control: Control<ProjectFormValues>;
  stageIndex: number;
  questionIndex: number;
  stageKind: ScreeningStageKind;
  onRemove: () => void;
}) {
  const type = useWatch({
    control,
    name: `screeningStages.${stageIndex}.questions.${questionIndex}.type`,
  });
  const isVideoStage = stageKind === "VIDEO";

  return (
    <div className="bg-muted/20 space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          {isVideoStage ? "Pergunta" : "Questão"} {questionIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={isVideoStage ? "Remover pergunta" : "Remover questão"}
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>

      {/* Numa etapa de vídeo o tipo é fixo -- não há escolha a oferecer, e o seletor só
          convidaria a montar uma combinação que o backend recusa. */}
      {!isVideoStage && (
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
      )}

      <FormField
        control={control}
        name={`screeningStages.${stageIndex}.questions.${questionIndex}.prompt`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isVideoStage
                ? "Pergunta a ser respondida em vídeo"
                : "Enunciado"}
            </FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder={
                  isVideoStage
                    ? "Ex: Conte em até 2 minutos sobre um projeto do qual você se orgulha."
                    : undefined
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isVideoStage ? (
        <p className="text-muted-foreground text-xs">
          O candidato grava a resposta pelo navegador, sem entrevista ao vivo.
          Você assiste ao decidir se ele avança de etapa.
        </p>
      ) : type === "MULTIPLE_CHOICE" ? (
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

/** Etapa comportamental: nenhum campo de conteúdo. O inventário é fixo e igual pra todo
 * candidato, e o aviso de "indicativo, não laudo" aparece já aqui -- quem monta a etapa precisa
 * saber o que está ligando ANTES de ver o primeiro resultado, não depois. */
function BehavioralStageNotice({ itemCount }: { itemCount: number | null }) {
  return (
    <div className="bg-muted/20 space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Inventário Big Five (IPIP)</p>
      <p className="text-muted-foreground text-sm">
        {itemCount != null
          ? `Esta etapa aplica os ${itemCount} itens do inventário da plataforma.`
          : "Esta etapa aplica o inventário de personalidade da plataforma: itens fixos, iguais para todos os candidatos, respondidos numa escala de 1 a 5."}{" "}
        Não há resposta certa e você não escreve as perguntas — o instrumento só
        se sustenta com um conjunto de itens fixo e conhecido.
      </p>
      <p className="text-muted-foreground text-sm">
        O resultado é um <strong>perfil de traços</strong>, não uma nota. Esta
        etapa é <strong>sempre informativa</strong>: nunca reprova o candidato
        nem bloqueia o avanço para a próxima etapa.
      </p>
      <p className="border-warning/40 bg-warning/10 text-foreground rounded-md border p-3 text-xs">
        {BEHAVIORAL_DISCLAIMER}
      </p>
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
  const kind =
    useWatch({ control, name: `screeningStages.${stageIndex}.kind` }) ??
    "QUESTIONS";
  const behavioralItemCount = useWatch({
    control,
    name: `screeningStages.${stageIndex}.behavioralItemCount`,
  });

  const KindIcon = stageKindIcons[kind];
  const isBehavioral = kind === "BEHAVIORAL";
  const isVideo = kind === "VIDEO";

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm font-semibold">
            Etapa {stageIndex + 1}
          </span>
          {/* Selo, não seletor: o tipo é definido na criação e o backend recusa trocá-lo
              depois (trocaria o instrumento debaixo de quem já está respondendo). */}
          <Badge variant="secondary" className="gap-1">
            <KindIcon className="size-3" />
            {screeningStageKindLabels[kind]}
          </Badge>
        </div>
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

      {isBehavioral ? (
        <BehavioralStageNotice itemCount={behavioralItemCount ?? null} />
      ) : (
        <div className="space-y-3">
          {questions.fields.map((field, questionIndex) => (
            <QuestionFields
              key={field.id}
              control={control}
              stageIndex={stageIndex}
              questionIndex={questionIndex}
              stageKind={kind}
              onRemove={() => questions.remove(questionIndex)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              questions.append(
                newScreeningQuestion(
                  isVideo ? "VIDEO_RESPONSE" : "MULTIPLE_CHOICE"
                )
              )
            }
          >
            <Plus className="size-4" />
            {isVideo ? "Adicionar pergunta" : "Adicionar questão"}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Construtor das etapas do processo seletivo, embutido no cadastro/edição da vaga --
 * useFieldArray aninhado em três níveis (etapas > questões > alternativas). Editar/remover é
 * sempre permitido, mesmo com candidatos já em andamento (ver
 * ScreeningQuestionnaireService.mergeStages -- sem efeito retroativo).
 *
 * O tipo de cada etapa (ScreeningStageKind) é escolhido no momento de adicioná-la e vira um selo
 * fixo -- ver newScreeningStage. */
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

      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="size-4" />
              Adicionar etapa
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            {(
              Object.keys(screeningStageKindLabels) as ScreeningStageKind[]
            ).map((kind) => {
              const Icon = stageKindIcons[kind];
              return (
                <DropdownMenuItem
                  key={kind}
                  onSelect={() => stages.append(newScreeningStage(kind))}
                  className="items-start gap-2"
                >
                  <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {screeningStageKindLabels[kind]}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {stageKindDescriptions[kind]}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Alternativa a montar do zero: copia um teste da biblioteca da empresa para dentro
            deste formulário. Cópia local -- só vira etapa de verdade quando a vaga for salva. */}
        <ApplyTemplateButton onApply={(stage) => stages.append(stage)} />
      </div>
    </div>
  );
}
