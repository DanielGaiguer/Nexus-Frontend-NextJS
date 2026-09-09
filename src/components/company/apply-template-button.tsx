"use client";

import { Library } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessmentTemplates } from "@/hooks/queries/useAssessmentTemplates";
import type { AssessmentTemplateResponseDTO } from "@/types/assessment-template";
import type { ScreeningStageFormValues } from "@/lib/validation";

/**
 * "Aplicar molde existente" DENTRO do formulário da vaga -- alternativa a montar a etapa do zero.
 *
 * A cópia acontece AQUI, no client: o molde vira uma etapa nova no estado do formulário, e só
 * vira etapa de verdade quando a vaga for salva. O endpoint /apply do backend existe e funciona,
 * mas chamá-lo daqui criaria a etapa no banco enquanto o formulário ainda segura o estado
 * anterior -- e o próximo save, sem ela na lista de etapas, a desativaria. Mesmo resultado, sem
 * a janela de inconsistência; e funciona também numa vaga que ainda nem foi criada.
 *
 * `sourceTemplateId` viaja junto e o backend só o lê em etapa nova, preservando a procedência
 * sem deixar uma edição futura reescrevê-la.
 */
export function ApplyTemplateButton({
  onApply,
}: {
  onApply: (stage: ScreeningStageFormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const templates = useAssessmentTemplates(true);

  function apply(template: AssessmentTemplateResponseDTO) {
    onApply({
      id: null,
      kind: "QUESTIONS",
      sourceTemplateId: template.id,
      behavioralItemCount: null,
      title: template.title,
      instructions: template.instructions ?? "",
      responseDeadlineDays: template.responseDeadlineDays.toString(),
      questions: template.questions.map((question) => ({
        id: null,
        type: question.type,
        prompt: question.prompt,
        // Um molde nunca tem menos de 2 alternativas numa múltipla escolha (o backend valida),
        // mas o editor de alternativas assume ao menos duas linhas -- completa se preciso, em
        // vez de renderizar uma questão que o usuário não consegue corrigir.
        options:
          question.type === "MULTIPLE_CHOICE"
            ? padOptions(question.options)
            : [{ value: "" }, { value: "" }],
        correctOptionIndex:
          question.correctOptionIndex != null
            ? question.correctOptionIndex.toString()
            : "",
      })),
    });
    setOpen(false);
    toast.success(
      `"${template.title}" copiado para esta vaga. Edite à vontade — o molde original não muda.`
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Library className="size-4" />
        Aplicar teste da biblioteca
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aplicar teste da biblioteca</DialogTitle>
            <DialogDescription>
              As perguntas são <strong>copiadas</strong> para esta vaga. Editar
              o teste na biblioteca depois não altera esta etapa, e editar esta
              etapa não altera o teste.
            </DialogDescription>
          </DialogHeader>

          {templates.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          )}

          {templates.isError && (
            <p className="text-muted-foreground text-sm">
              Não foi possível carregar seus testes reutilizáveis.
            </p>
          )}

          {templates.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Você ainda não tem nenhum teste reutilizável. Crie um em{" "}
              <strong>Testes reutilizáveis</strong>, no menu lateral, para
              reaproveitá-lo entre vagas.
            </p>
          )}

          <div className="space-y-2">
            {templates.data?.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => apply(template)}
                className="hover:bg-accent focus-visible:ring-ring w-full rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="block text-sm font-medium">
                  {template.title}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {template.questions.length}{" "}
                  {template.questions.length === 1 ? "questão" : "questões"} ·
                  prazo padrão de {template.responseDeadlineDays}{" "}
                  {template.responseDeadlineDays === 1 ? "dia" : "dias"}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function padOptions(options: string[]) {
  const mapped = options.map((value) => ({ value }));
  while (mapped.length < 2) mapped.push({ value: "" });
  return mapped;
}
