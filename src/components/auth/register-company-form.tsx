"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useRegisterCompany } from "@/hooks/mutations/useRegisterCompany";
import { ApiError } from "@/lib/api-client";
import {
  type RegisterCompanyFormValues,
  registerCompanySchema,
  toNullable,
} from "@/lib/validation";

export function RegisterCompanyForm() {
  const router = useRouter();
  const registerCompany = useRegisterCompany();

  const form = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: "",
      taxId: "",
      email: "",
      password: "",
      phone: "",
      cep: "",
      description: "",
      allowCepUsage: false,
    },
  });

  function onSubmit(values: RegisterCompanyFormValues) {
    registerCompany.mutate(
      {
        companyName: values.companyName,
        email: values.email,
        password: values.password,
        taxId: toNullable(values.taxId),
        phone: toNullable(values.phone),
        cep: toNullable(values.cep),
        description: toNullable(values.description),
      },
      {
        onSuccess: () => {
          router.push("/register/success");
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível enviar o cadastro. Tente novamente."
          );
        },
      }
    );
  }

  return (
    <AuthCard
      icon={Building2}
      eyebrow="Sou Empresa"
      title="Cadastre sua empresa"
      description="Encontre os melhores profissionais para seus projetos de TI."
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
      <div className="bg-info/10 text-foreground flex items-start gap-2 rounded-md p-3 text-sm">
        <Info className="text-info mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Prazo de aprovação</p>
          <p className="text-muted-foreground text-xs">
            Após o cadastro, sua conta passará por análise administrativa.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha Empresa Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0001-00" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com"
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Descrição da empresa</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Fale sobre sua empresa e os projetos que costuma contratar..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="allowCepUsage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-muted-foreground font-normal">
                    Permitir o uso da minha localização para encontrar
                    oportunidades mais próximas e melhorar a relevância dos
                    resultados.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={registerCompany.isPending}
          >
            <Building2 className="size-4" />
            {registerCompany.isPending ? "Enviando…" : "Solicitar cadastro"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
