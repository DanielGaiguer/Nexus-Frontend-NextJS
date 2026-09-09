"use client";

import { Archive, ArchiveRestore, Library, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AssessmentTemplateForm } from "@/components/company/assessment-template-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSetAssessmentTemplateActive } from "@/hooks/mutations/useAssessmentTemplateMutations";
import { useAssessmentTemplates } from "@/hooks/queries/useAssessmentTemplates";
import { ApiError } from "@/lib/api-client";
import type { AssessmentTemplateResponseDTO } from "@/types/assessment-template";

function questionCountLabel(count: number) {
  return `${count} ${count === 1 ? "questão" : "questões"}`;
}

export function AssessmentTemplateLibrary() {
  const templates = useAssessmentTemplates(false);
  const setActive = useSetAssessmentTemplateActive();

  // `null` = criar do zero; um molde = editar aquele. `undefined` = diálogo fechado.
  const [editing, setEditing] = useState<
    AssessmentTemplateResponseDTO | null | undefined
  >(undefined);

  function toggleActive(template: AssessmentTemplateResponseDTO) {
    setActive.mutate(
      { id: template.id, active: !template.active },
      {
        onSuccess: () =>
          toast.success(
            template.active
              ? "Teste aposentado. Vagas que já o aplicaram continuam intactas."
              : "Teste reativado."
          ),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível alterar o teste."
          ),
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Testes reutilizáveis</CardTitle>
            <p className="text-muted-foreground text-sm">
              Provas que não pertencem a uma vaga só — lógica, português,
              inglês, o que fizer sentido para o seu processo. Monte uma vez e
              aplique em quantas vagas quiser.
            </p>
          </div>
          <Button type="button" onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            Novo teste
          </Button>
        </CardHeader>
        <CardContent>
          {/* A regra que mais confunde na primeira vez: aplicar é duplicar, não linkar. */}
          <p className="text-muted-foreground border-l-2 pl-3 text-sm">
            Ao aplicar um teste a uma vaga, as perguntas são{" "}
            <strong>copiadas</strong> para lá. Editar o teste aqui depois{" "}
            <strong>não altera</strong> as vagas que já o aplicaram — nem a
            prova de quem já está respondendo.
          </p>
        </CardContent>
      </Card>

      {templates.isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {templates.isError && (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-sm">
            Não foi possível carregar seus testes reutilizáveis.
          </CardContent>
        </Card>
      )}

      {templates.data?.length === 0 && (
        <EmptyState
          icon={Library}
          title="Nenhum teste reutilizável ainda"
          description="Crie um teste aqui para reaproveitá-lo entre vagas, em vez de redigitar as mesmas perguntas em cada processo seletivo."
        />
      )}

      {templates.data?.map((template) => (
        <Card
          key={template.id}
          className={template.active ? undefined : "opacity-70"}
        >
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {template.title}
                {!template.active && (
                  <Badge variant="outline">Aposentado</Badge>
                )}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {questionCountLabel(template.questions.length)} · prazo padrão
                de {template.responseDeadlineDays}{" "}
                {template.responseDeadlineDays === 1 ? "dia" : "dias"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(template)}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={setActive.isPending}
                onClick={() => toggleActive(template)}
              >
                {template.active ? (
                  <>
                    <Archive className="size-4" />
                    Aposentar
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="size-4" />
                    Reativar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {template.instructions && (
            <CardContent className="text-muted-foreground text-sm">
              {template.instructions}
            </CardContent>
          )}
        </Card>
      ))}

      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar teste" : "Novo teste reutilizável"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "As vagas que já aplicaram este teste não mudam — elas ficaram com uma cópia própria das perguntas."
                : "Monte a prova uma vez. Depois é só aplicá-la ao montar o processo seletivo de qualquer vaga."}
            </DialogDescription>
          </DialogHeader>
          {/* key remonta o formulário ao trocar de molde -- sem isso o react-hook-form
              manteria os defaultValues do anterior. */}
          <AssessmentTemplateForm
            key={editing?.id ?? "new"}
            template={editing ?? undefined}
            onSaved={() => setEditing(undefined)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
