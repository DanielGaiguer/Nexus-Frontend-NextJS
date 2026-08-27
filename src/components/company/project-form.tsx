"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AiExtractPanel } from "@/components/company/ai-extract-panel";
import { ProjectSkillPicker } from "@/components/company/project-skill-picker";
import {
  newScreeningStage,
  ScreeningStagesField,
} from "@/components/company/screening-stage-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProject,
  useUpdateProject,
} from "@/hooks/mutations/useProjectMutations";
import {
  useCreateScreeningQuestionnaire,
  useUpdateScreeningQuestionnaire,
} from "@/hooks/mutations/useScreeningQuestionnaireMutations";
import { ApiError } from "@/lib/api-client";
import {
  type ProjectFormValues,
  projectFormSchema,
  toNullable,
  toNumberOrNull,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { ProjectResponseDTO } from "@/types/project";
import type {
  ScreeningQuestionnaireRequestDTO,
  ScreeningQuestionnaireResponseDTO,
} from "@/types/screening";

const workModeOptions = [
  { value: "REMOTE", label: "Remoto" },
  { value: "ONSITE", label: "Presencial" },
  { value: "HYBRID", label: "Híbrido" },
];

const typeOptions = [
  { value: "FREELANCE", label: "Freelance" },
  { value: "FULL_TIME", label: "Tempo integral" },
  { value: "PART_TIME", label: "Meio período" },
];

const experienceLevelOptions = [
  { value: "UNSPECIFIED", label: "Não especificar" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const contractTypeOptions = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ (Pessoa Jurídica)" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TEMPORARY", label: "Temporário" },
  { value: "FREELANCER", label: "Freelancer" },
];

function toFormDefaults(
  project?: ProjectResponseDTO,
  existingScreening?: ScreeningQuestionnaireResponseDTO | null
): ProjectFormValues {
  return {
    opportunityType: project?.opportunityType ?? "PROJECT",
    title: project?.title ?? "",
    description: project?.description ?? "",
    workMode: project?.workMode ?? "",
    type: project?.type ?? "",
    experienceLevel: project?.experienceLevel ?? "",
    maxPositions: String(project?.maxPositions ?? 1),
    cep: "",
    skillIds: project?.requiredSkills.map((s) => s.id) ?? [],
    minimumBudget: project?.minimumBudget?.toString() ?? "",
    maximumBudget: project?.maximumBudget?.toString() ?? "",
    deadline: project?.deadline ?? "",
    contractType: project?.contractType ?? "",
    monthlySalaryMin: project?.monthlySalaryMin?.toString() ?? "",
    monthlySalaryMax: project?.monthlySalaryMax?.toString() ?? "",
    workloadHoursPerWeek: project?.workloadHoursPerWeek?.toString() ?? "",
    startDate: project?.startDate ?? "",
    benefits: project?.benefits ?? "",
    visibleToCompanies: project?.visibleToCompanies ?? true,
    salaryVisibleToProfessionals: project?.salaryVisibleToProfessionals ?? true,
    salaryVisibleToCompanies: project?.salaryVisibleToCompanies ?? true,
    acceptsProposals: project?.acceptsProposals ?? false,

    useScreening: !!existingScreening,
    screeningTitle: existingScreening?.title ?? "",
    screeningInstructions: existingScreening?.instructions ?? "",
    // Defesa extra além do filtro que o backend já aplica (ScreeningQuestionnaireService
    // .toResponseDTO) -- uma etapa removida (active=false) nunca deveria reaparecer aqui, senão
    // salvar o formulário de novo a reativaria (mergeStages marca active=true incondicional pra
    // toda etapa presente no request).
    screeningStages: (existingScreening?.stages ?? [])
      .filter((stage) => stage.active)
      .map((stage) => ({
        id: stage.id,
        title: stage.title,
        instructions: stage.instructions ?? "",
        responseDeadlineDays: stage.responseDeadlineDays.toString(),
        questions: stage.questions.map((q) => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options: q.options.map((value) => ({ value })),
          correctOptionIndex:
            q.correctOptionIndex != null ? q.correctOptionIndex.toString() : "",
        })),
      })),
  };
}

export function ProjectForm({
  editing,
  existingScreening,
}: {
  editing?: ProjectResponseDTO;
  existingScreening?: ScreeningQuestionnaireResponseDTO | null;
}) {
  const router = useRouter();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const createScreening = useCreateScreeningQuestionnaire();
  const updateScreening = useUpdateScreeningQuestionnaire();
  const isPending =
    createProject.isPending ||
    updateProject.isPending ||
    createScreening.isPending ||
    updateScreening.isPending;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    defaultValues: toFormDefaults(editing, existingScreening),
  });

  const useScreening = useWatch({
    control: form.control,
    name: "useScreening",
  });

  const opportunityType = useWatch({
    control: form.control,
    name: "opportunityType",
  });
  const isProject = opportunityType === "PROJECT";
  const visibleToCompanies = useWatch({
    control: form.control,
    name: "visibleToCompanies",
  });
  const visibilityWord = isProject ? "orçamento" : "salário";

  function onSubmit(values: ProjectFormValues) {
    const payload = {
      title: values.title,
      description: values.description,
      workMode: values.workMode as "REMOTE" | "ONSITE" | "HYBRID",
      type: values.type as "FREELANCE" | "FULL_TIME" | "PART_TIME",
      experienceLevel:
        values.experienceLevel === ""
          ? null
          : (values.experienceLevel as never),
      maxPositions: toNumberOrNull(values.maxPositions),
      opportunityType: values.opportunityType,
      skillIds: values.skillIds,
      cep: toNullable(values.cep),
      minimumBudget: isProject ? toNumberOrNull(values.minimumBudget) : null,
      maximumBudget: isProject ? toNumberOrNull(values.maximumBudget) : null,
      deadline: isProject ? toNullable(values.deadline) : null,
      monthlySalaryMin: !isProject
        ? toNumberOrNull(values.monthlySalaryMin)
        : null,
      monthlySalaryMax: !isProject
        ? toNumberOrNull(values.monthlySalaryMax)
        : null,
      contractType: !isProject
        ? (toNullable(values.contractType) as never)
        : null,
      benefits: !isProject ? toNullable(values.benefits) : null,
      startDate: !isProject ? toNullable(values.startDate) : null,
      workloadHoursPerWeek: !isProject
        ? toNumberOrNull(values.workloadHoursPerWeek)
        : null,
      visibleToCompanies: values.visibleToCompanies,
      salaryVisibleToProfessionals: values.salaryVisibleToProfessionals,
      salaryVisibleToCompanies: values.salaryVisibleToCompanies,
      acceptsProposals: isProject ? values.acceptsProposals : false,
    };

    // Etapas do processo seletivo são salvas depois da vaga em si (precisa do projectId) --
    // só quando useScreening está marcado; desmarcar não apaga um processo já existente, só
    // deixa de tocar nele (não há endpoint pra remover o questionário inteiro, só etapas
    // individuais dentro dele).
    function saveScreeningThenFinish(projectId: number) {
      if (!values.useScreening) {
        finish();
        return;
      }

      const screeningPayload: ScreeningQuestionnaireRequestDTO = {
        projectId,
        title: values.screeningTitle,
        instructions: toNullable(values.screeningInstructions),
        stages: values.screeningStages.map((stage) => ({
          id: stage.id,
          title: stage.title,
          instructions: toNullable(stage.instructions),
          responseDeadlineDays: Number(stage.responseDeadlineDays),
          questions: stage.questions.map((q) => ({
            id: q.id,
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
        })),
      };

      const onScreeningError = (error: unknown) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Vaga salva, mas não foi possível salvar o processo seletivo."
        );
        router.push("/company/projects");
      };

      if (existingScreening) {
        updateScreening.mutate(
          { id: existingScreening.id, ...screeningPayload },
          { onSuccess: finish, onError: onScreeningError }
        );
      } else {
        createScreening.mutate(screeningPayload, {
          onSuccess: finish,
          onError: onScreeningError,
        });
      }
    }

    function finish() {
      toast.success(
        editing ? "Oportunidade atualizada!" : "Oportunidade publicada!"
      );
      router.push("/company/projects");
    }

    const onError = (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar a oportunidade."
      );
    };

    if (editing) {
      updateProject.mutate(
        { id: editing.id, ...payload },
        { onSuccess: () => saveScreeningThenFinish(editing.id), onError }
      );
    } else {
      createProject.mutate(payload, {
        onSuccess: (data) => saveScreeningThenFinish(data.id),
        onError,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!editing && <AiExtractPanel form={form} />}
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="opportunityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de oportunidade</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("PROJECT")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-md border p-3 text-sm font-medium transition-colors",
                          field.value === "PROJECT"
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-accent"
                        )}
                      >
                        <Briefcase className="size-4" /> Projeto
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("JOB")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-md border p-3 text-sm font-medium transition-colors",
                          field.value === "JOB"
                            ? "border-success bg-success/10 text-success"
                            : "hover:bg-accent"
                        )}
                      >
                        <Building2 className="size-4" /> Vaga de Emprego
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {isProject
                        ? "Projeto: freelance, consultoria ou entrega pontual — remuneração por orçamento fechado."
                        : "Vaga: contratação recorrente — remuneração mensal com regime de contrato."}
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Desenvolvedor Backend Sênior"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Descreva a oportunidade, responsabilidades e entregas esperadas..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regime de trabalho</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typeOptions.map((o) => (
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
                    control={form.control}
                    name="workMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workModeOptions.map((o) => (
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
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de experiência</FormLabel>
                        <Select
                          value={field.value || "UNSPECIFIED"}
                          onValueChange={(v) =>
                            field.onChange(v === "UNSPECIFIED" ? "" : v)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {experienceLevelOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                          Opcional — se não informado, esse componente não entra
                          no score.
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxPositions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vagas disponíveis</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          Puramente informativo — não bloqueia novos matches.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP do local (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            maxLength={9}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          Deixe em branco para usar o CEP cadastrado do
                          contratante.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {isProject ? (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-primary text-xs font-semibold tracking-wide uppercase">
                    Dados do Projeto
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="minimumBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orçamento mínimo (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maximumBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orçamento máximo (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo de entrega</FormLabel>
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
                    name="acceptsProposals"
                    render={({ field }) => (
                      <FormItem>
                        <label className="flex items-center gap-2 text-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          Aceita propostas de profissionais?
                        </label>
                        <p className="text-muted-foreground text-xs">
                          Se marcado, profissionais podem enviar propostas com
                          valor, prazo e plano de execução — além de demonstrar
                          interesse pelo match normal.
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-success text-xs font-semibold tracking-wide uppercase">
                    Dados da Vaga de Emprego
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contractType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de contrato</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contractTypeOptions.map((o) => (
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
                      control={form.control}
                      name="workloadHoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carga horária semanal</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={60}
                              placeholder="40"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlySalaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salário mínimo (R$/mês)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlySalaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salário máximo (R$/mês)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de início prevista</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Benefícios</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Vale-refeição, Plano de saúde, Home office, PLR..."
                              {...field}
                            />
                          </FormControl>
                          <p className="text-muted-foreground text-xs">
                            Separe por vírgula. Exibido como chips para os
                            candidatos.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <FormField
                  control={form.control}
                  name="skillIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills exigidas</FormLabel>
                      <ProjectSkillPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="useScreening"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (
                                checked &&
                                form.getValues("screeningStages").length === 0
                              ) {
                                form.setValue("screeningStages", [
                                  newScreeningStage(),
                                ]);
                              } else if (!checked && !existingScreening) {
                                // Sem processo já salvo no servidor pra preservar -- limpa
                                // qualquer etapa nova/incompleta que tenha ficado pela metade,
                                // pra não travar a validação do formulário escondida (a seção
                                // some da tela, mas os dados ainda seriam validados).
                                form.setValue("screeningStages", []);
                              }
                            }}
                          />
                        </FormControl>
                        Dividir o processo seletivo em etapas, com triagem?
                      </label>
                      <p className="text-muted-foreground text-xs">
                        Cada etapa tem suas próprias perguntas. Quem demonstrar
                        interesse, aceitar um convite ou enviar proposta precisa
                        responder a etapa atual antes de continuar — você aprova
                        ou reprova o avanço etapa por etapa.
                        {existingScreening && !field.value && (
                          <>
                            {" "}
                            Desmarcar não apaga o processo já existente, só
                            deixa de editá-lo agora.
                          </>
                        )}
                      </p>
                    </FormItem>
                  )}
                />
                {useScreening && (
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <FormField
                        control={form.control}
                        name="screeningTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do processo seletivo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Processo seletivo — Dev Backend"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="screeningInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instruções gerais (opcional)</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <ScreeningStagesField control={form.control} />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-warning text-xs font-semibold tracking-wide uppercase">
                  Visibilidade
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="visibleToCompanies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visível para outros contratantes?</FormLabel>
                        <Select
                          value={field.value ? "true" : "false"}
                          onValueChange={(v) => field.onChange(v === "true")}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Sim</SelectItem>
                            <SelectItem value="false">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                          Se &quot;Não&quot;, esta oportunidade não aparece pra
                          outros contratantes no mapa nem nas Oportunidades.
                          Profissionais continuam vendo normalmente.
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryVisibleToProfessionals"
                    render={({ field }) => (
                      <FormItem className="pt-6">
                        <label className="flex items-center gap-2 text-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          O {visibilityWord} deve estar visível para os
                          profissionais?
                        </label>
                        <p className="text-muted-foreground text-xs">
                          Se desmarcado, aparece como &quot;A combinar&quot;
                          para os profissionais.
                        </p>
                      </FormItem>
                    )}
                  />
                  {visibleToCompanies && (
                    <FormField
                      control={form.control}
                      name="salaryVisibleToCompanies"
                      render={({ field }) => (
                        <FormItem>
                          <label className="flex items-center gap-2 text-sm">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            O {visibilityWord} deve ser visível para outros
                            contratantes?
                          </label>
                          <p className="text-muted-foreground text-xs">
                            Se desmarcado, aparece como &quot;A combinar&quot;
                            para outros contratantes.
                          </p>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/company/projects")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isPending}
                >
                  <Save className="size-4" />
                  {isPending
                    ? "Salvando…"
                    : editing
                      ? "Salvar alterações"
                      : "Publicar oportunidade"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
