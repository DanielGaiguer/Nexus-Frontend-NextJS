"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ScoreSimulatorCard } from "@/components/professional/score-simulator-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { usePreviousProjects } from "@/hooks/queries/usePreviousProjects";
import { useUpdateProfessionalProfile } from "@/hooks/mutations/useUpdateProfessionalProfile";
import { ApiError } from "@/lib/api-client";
import {
  type ProfessionalProfileEditFormValues,
  professionalProfileEditSchema,
  toNullable,
  toNumberOrNull,
} from "@/lib/validation";
import type { ProfessionalProfileDTO } from "@/types/professional";

const experienceLevelOptions: {
  value: ProfessionalProfileEditFormValues["experienceLevel"];
  label: string;
}[] = [
  { value: "", label: "Não informar" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const preferredTypeOptions: {
  value: ProfessionalProfileEditFormValues["preferredTypes"][number];
  label: string;
}[] = [
  { value: "FREELANCE", label: "Freelance" },
  { value: "FULL_TIME", label: "Tempo integral" },
  { value: "PART_TIME", label: "Meio período" },
];

const opportunityTypeOptions: {
  value: ProfessionalProfileEditFormValues["preferredOpportunityTypes"][number];
  label: string;
}[] = [
  { value: "JOB", label: "Vaga (CLT/PJ)" },
  { value: "PROJECT", label: "Projeto (freelance)" },
];

export function ProfileEditDialog({
  profile,
}: {
  profile: ProfessionalProfileDTO;
}) {
  const [open, setOpen] = useState(false);
  const updateProfile = useUpdateProfessionalProfile();
  const { data: previousProjects } = usePreviousProjects();

  const form = useForm<ProfessionalProfileEditFormValues>({
    resolver: zodResolver(professionalProfileEditSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      cep: "",
      experienceLevel: profile.experienceLevel ?? "",
      preferredTypes: profile.preferredTypes,
      preferredOpportunityTypes: profile.preferredOpportunityTypes,
      expectedSalaryCLT: profile.expectedSalaryCLT?.toString() ?? "",
      expectedSalaryPJ: profile.expectedSalaryPJ?.toString() ?? "",
      freelanceMinExpectation:
        profile.freelanceMinExpectation?.toString() ?? "",
      freelanceMaxExpectation:
        profile.freelanceMaxExpectation?.toString() ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
    },
  });

  const watched = useWatch({ control: form.control });

  function onSubmit(values: ProfessionalProfileEditFormValues) {
    updateProfile.mutate(
      {
        ...profile,
        name: values.name,
        phone: toNullable(values.phone),
        // cep sempre vem null do GET (o backend não devolve o valor bruto,
        // só a cidade/UF resolvidas) — só entra no PUT quando o usuário
        // digita um novo, disparando a resolução de endereço no backend.
        cep: toNullable(values.cep),
        experienceLevel: values.experienceLevel || null,
        preferredTypes: values.preferredTypes,
        preferredOpportunityTypes: values.preferredOpportunityTypes,
        expectedSalaryCLT: toNumberOrNull(values.expectedSalaryCLT),
        expectedSalaryPJ: toNumberOrNull(values.expectedSalaryPJ),
        freelanceMinExpectation: toNumberOrNull(values.freelanceMinExpectation),
        freelanceMaxExpectation: toNumberOrNull(values.freelanceMaxExpectation),
        linkedinUrl: toNullable(values.linkedinUrl),
        githubUrl: toNullable(values.githubUrl),
      },
      {
        onSuccess: () => {
          toast.success("Perfil atualizado com sucesso!");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar o perfil."
          );
        },
      }
    );
  }

  function toggleArrayValue<T extends string>(current: T[], value: T): T[] {
    return current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil className="size-4" />
          Editar perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" maxLength={9} {...field} />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      Cidade e estado são preenchidos automaticamente. Deixe em
                      branco pra manter o endereço atual
                      {profile.city
                        ? ` (${profile.city}${profile.state ? `, ${profile.state}` : ""})`
                        : ""}
                      .
                    </p>
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
                    {/* Radix não aceita value="" num SelectItem — usa um sentinel só na UI. */}
                    <Select
                      value={field.value || "UNSPECIFIED"}
                      onValueChange={(value) =>
                        field.onChange(value === "UNSPECIFIED" ? "" : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevelOptions.map(({ value, label }) => (
                          <SelectItem
                            key={value || "UNSPECIFIED"}
                            value={value || "UNSPECIFIED"}
                          >
                            {label}
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
                name="preferredTypes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Tipos de oportunidade aceitos</FormLabel>
                    <div className="flex flex-wrap gap-4">
                      {preferredTypeOptions.map(({ value, label }) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={field.value.includes(value)}
                            onCheckedChange={() =>
                              field.onChange(
                                toggleArrayValue(field.value, value)
                              )
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredOpportunityTypes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Quero receber oportunidades de</FormLabel>
                    <div className="flex flex-wrap gap-4">
                      {opportunityTypeOptions.map(({ value, label }) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={field.value.includes(value)}
                            onCheckedChange={() =>
                              field.onChange(
                                toggleArrayValue(field.value, value)
                              )
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedSalaryCLT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pretensão CLT (R$/mês)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedSalaryPJ"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pretensão PJ (R$/mês)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freelanceMinExpectation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Por projeto — mín. (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freelanceMaxExpectation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Por projeto — máx. (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.linkedin.com/in/seu-usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/seu-usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ScoreSimulatorCard
              skillsCount={profile.skills.length}
              minSalary={Number(watched.freelanceMinExpectation) || 0}
              maxSalary={Number(watched.freelanceMaxExpectation) || 0}
              historyCount={previousProjects?.length ?? 0}
              reputation={profile.reputation ?? 0}
              available={profile.available ?? true}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Salvando…" : "Salvar perfil"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
