"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ProjectSkillPicker } from "@/components/company/project-skill-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteProposalAttachment,
  useSubmitProposal,
  useUpdateProposal,
  useUploadProposalAttachments,
} from "@/hooks/mutations/useProposalMutations";
import { ApiError } from "@/lib/api-client";
import {
  type ProposalFormValues,
  proposalFormSchema,
  toNullable,
  toNumberOrNull,
} from "@/lib/validation";
import type { ProjectResponseDTO } from "@/types/project";
import type { ProposalResponseDTO } from "@/types/proposal";

function toFormDefaults(
  project: ProjectResponseDTO,
  editing?: ProposalResponseDTO
): ProposalFormValues {
  return {
    proposedValue: editing?.proposedValue?.toString() ?? "",
    estimatedDays: editing?.estimatedDays?.toString() ?? "",
    proposedStartDate: editing?.proposedStartDate ?? "",
    proposedDeliveryDate: editing?.proposedDeliveryDate ?? "",
    description: editing?.description ?? "",
    relevantExperience: editing?.relevantExperience ?? "",
    skillIds:
      editing?.skills.map((s) => s.id) ??
      project.requiredSkills.map((s) => s.id),
    deliverables: editing?.deliverables ?? "",
    executionSteps: (editing?.executionSteps ?? []).map((value) => ({ value })),
    paymentTerms: editing?.paymentTerms ?? "",
    validityDays: editing?.validityDays?.toString() ?? "15",
    questionsForCompany: editing?.questionsForCompany ?? "",
  };
}

export function ProposalForm({
  project,
  editing,
}: {
  project: ProjectResponseDTO;
  editing?: ProposalResponseDTO;
}) {
  const router = useRouter();
  const submitProposal = useSubmitProposal();
  const updateProposal = useUpdateProposal();
  const uploadAttachments = useUploadProposalAttachments();
  const deleteAttachment = useDeleteProposalAttachment();
  const isPending =
    submitProposal.isPending ||
    updateProposal.isPending ||
    uploadAttachments.isPending;

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: toFormDefaults(project, editing),
  });

  const steps = useFieldArray({
    control: form.control,
    name: "executionSteps",
  });

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setPendingFiles((current) => [...current, ...files]);
  }

  function removePendingFile(index: number) {
    setPendingFiles((current) => current.filter((_, i) => i !== index));
  }

  function handleDeleteExistingAttachment(attachmentId: number) {
    if (!editing) return;
    deleteAttachment.mutate(
      { proposalId: editing.id, attachmentId },
      {
        onSuccess: () => toast.success("Anexo removido."),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível remover o anexo."
          ),
      }
    );
  }

  function onSubmit(values: ProposalFormValues) {
    const payload = {
      projectId: project.id,
      proposedValue: toNumberOrNull(values.proposedValue) ?? 0,
      estimatedDays: toNumberOrNull(values.estimatedDays) ?? 0,
      proposedStartDate: toNullable(values.proposedStartDate),
      proposedDeliveryDate: toNullable(values.proposedDeliveryDate),
      description: values.description,
      relevantExperience: toNullable(values.relevantExperience),
      skillIds: values.skillIds,
      deliverables: toNullable(values.deliverables),
      executionSteps: values.executionSteps
        .map((s) => s.value.trim())
        .filter((s) => s !== ""),
      paymentTerms: toNullable(values.paymentTerms),
      validityDays: toNumberOrNull(values.validityDays) ?? 0,
      questionsForCompany: toNullable(values.questionsForCompany),
    };

    function afterSave(proposalId: number) {
      if (pendingFiles.length === 0) {
        toast.success(editing ? "Proposta atualizada!" : "Proposta enviada!");
        router.push("/pro/opportunities");
        return;
      }
      uploadAttachments.mutate(
        { proposalId, files: pendingFiles },
        {
          onSuccess: () => {
            toast.success(
              editing ? "Proposta atualizada!" : "Proposta enviada!"
            );
            router.push("/pro/opportunities");
          },
          onError: (error) => {
            toast.error(
              error instanceof ApiError
                ? error.message
                : "Proposta salva, mas não foi possível enviar os anexos."
            );
            router.push("/pro/opportunities");
          },
        }
      );
    }

    if (editing) {
      updateProposal.mutate(
        { proposalId: editing.id, ...payload },
        {
          onSuccess: (data) => afterSave(data.id),
          onError: (error) =>
            toast.error(
              error instanceof ApiError
                ? error.message
                : "Não foi possível salvar a proposta."
            ),
        }
      );
    } else {
      submitProposal.mutate(payload, {
        onSuccess: (data) => afterSave(data.id),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível enviar a proposta."
          ),
      });
    }
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="proposedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor proposto (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo estimado (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validityDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade da proposta (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      Depois disso, a proposta expira automaticamente.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proposedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início proposta</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proposedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de entrega proposta</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Como pretende resolver</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Descreva sua abordagem para executar este projeto..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relevantExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiência relevante</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Projetos ou experiências parecidas que você já entregou..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skillIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tecnologias</FormLabel>
                  <ProjectSkillPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliverables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entregáveis</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ex: código-fonte, documentação, deploy em produção..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Etapas de execução</FormLabel>
              <div className="space-y-2">
                {steps.fields.map((stepField, index) => (
                  <div key={stepField.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-6 text-sm">
                      {index + 1}.
                    </span>
                    <FormField
                      control={form.control}
                      name={`executionSteps.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Etapa ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => steps.remove(index)}
                      aria-label="Remover etapa"
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => steps.append({ value: "" })}
              >
                <Plus className="size-4" />
                Adicionar etapa
              </Button>
            </div>

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições de pagamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 30% início, 70% entrega"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionsForCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perguntas ao contratante (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border-t pt-4">
              <FormLabel>Anexos / portfólio</FormLabel>

              {editing != null && editing.attachments.length > 0 && (
                <div className="flex flex-col gap-1">
                  {editing.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-2 truncate hover:underline"
                      >
                        <Paperclip className="size-3.5 shrink-0" />
                        <span className="truncate">{attachment.fileName}</span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteExistingAttachment(attachment.id)
                        }
                        disabled={deleteAttachment.isPending}
                        aria-label="Remover anexo"
                      >
                        <X className="text-destructive size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {pendingFiles.length > 0 && (
                <div className="flex flex-col gap-1">
                  {pendingFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="bg-muted/40 flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Paperclip className="size-3.5 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePendingFile(index)}
                        aria-label="Remover arquivo"
                      >
                        <X className="text-destructive size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Adicionar anexo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp,application/zip"
                className="hidden"
                onChange={handleFilesSelected}
              />
              <p className="text-muted-foreground text-xs">
                PDF, imagens ou ZIP, até 15MB por arquivo.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/pro/opportunities")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                <Save className="size-4" />
                {isPending
                  ? "Salvando…"
                  : editing
                    ? "Salvar alterações"
                    : "Enviar proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
