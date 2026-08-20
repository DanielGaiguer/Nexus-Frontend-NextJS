"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRegisterProfessional } from "@/hooks/mutations/useRegisterProfessional";
import { ApiError } from "@/lib/api-client";
import {
  type RegisterProfessionalFormValues,
  registerProfessionalSchema,
  toNullable,
  toNumberOrNull,
} from "@/lib/validation";

export function RegisterProfessionalForm() {
  const router = useRouter();
  const registerProfessional = useRegisterProfessional();

  const form = useForm<RegisterProfessionalFormValues>({
    resolver: zodResolver(registerProfessionalSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      cep: "",
      expectedSalaryCLT: "",
      expectedSalaryPJ: "",
      freelanceMinExpectation: "",
      freelanceMaxExpectation: "",
    },
  });

  function onSubmit(values: RegisterProfessionalFormValues) {
    registerProfessional.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: toNullable(values.phone),
        cep: toNullable(values.cep),
        preferredOpportunityTypes: null,
        expectedSalaryCLT: toNumberOrNull(values.expectedSalaryCLT),
        expectedSalaryPJ: toNumberOrNull(values.expectedSalaryPJ),
        freelanceMinExpectation: toNumberOrNull(values.freelanceMinExpectation),
        freelanceMaxExpectation: toNumberOrNull(values.freelanceMaxExpectation),
      },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso! Faça login para começar.");
          router.push("/login");
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível criar a conta. Tente novamente."
          );
        },
      }
    );
  }

  return (
    <AuthCard
      icon={UserPlus}
      eyebrow="Sou profissional"
      title="Crie seu perfil"
      description="Preencha seus dados para começar a receber oportunidades."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Faça login
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Dados pessoais
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Expectativas
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Opcional agora — você pode completar ou alterar depois, no seu
                perfil.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="expectedSalaryCLT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pretensão CLT (R$/mês)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.000"
                        {...field}
                      />
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="7.000"
                        {...field}
                      />
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
                    <FormLabel>Pretensão por projeto — mín. (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.000"
                        {...field}
                      />
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
                    <FormLabel>Pretensão por projeto — máx. (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10.000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerProfessional.isPending}
          >
            <UserPlus className="size-4" />
            {registerProfessional.isPending ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
