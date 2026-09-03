"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Info, Link2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { LegalConsentFields } from "@/components/auth/legal-consent-fields";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterCompanyLinkedin } from "@/hooks/mutations/useRegisterCompanyLinkedin";
import { ApiError } from "@/lib/api-client";
import {
  type RegisterCompanyLinkedInFormValues,
  registerCompanyLinkedInSchema,
  toNullable,
} from "@/lib/validation";

export function RegisterCompanyLinkedinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket = searchParams.get("ticket") ?? "";
  const email = searchParams.get("email") ?? "";

  const registerCompanyLinkedin = useRegisterCompanyLinkedin();

  const form = useForm<RegisterCompanyLinkedInFormValues>({
    resolver: zodResolver(registerCompanyLinkedInSchema),
    defaultValues: {
      type: "LEGAL_ENTITY",
      companyName: "",
      taxId: "",
      phone: "",
      cep: "",
      description: "",
      acceptedTermsOfUse: false,
      acceptedMarketingCommunications: false,
      acceptedAlgorithmImprovement: false,
    },
    mode: "onChange",
  });

  const type = form.watch("type");
  const isIndividual = type === "INDIVIDUAL";

  function onSubmit(values: RegisterCompanyLinkedInFormValues) {
    if (!ticket) {
      toast.error(
        "Ticket do LinkedIn ausente ou expirado. Conecte-se novamente."
      );
      return;
    }
    registerCompanyLinkedin.mutate(
      {
        ticket,
        type: values.type,
        companyName: values.companyName,
        taxId: toNullable(values.taxId),
        phone: toNullable(values.phone),
        cep: toNullable(values.cep),
        description: toNullable(values.description),
        acceptedTermsOfUse: values.acceptedTermsOfUse,
        acceptedMarketingCommunications: values.acceptedMarketingCommunications,
        acceptedAlgorithmImprovement: values.acceptedAlgorithmImprovement,
      },
      {
        onSuccess: () => router.push("/register/success"),
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível concluir o cadastro. Tente novamente."
          );
        },
      }
    );
  }

  return (
    <AuthCard
      icon={Link2}
      eyebrow="Conectado com LinkedIn"
      eyebrowClassName="bg-nexus-accent/10 text-nexus-accent border-nexus-accent/20"
      title="Falta pouco!"
      description="O LinkedIn não informa todos os dados necessários — complete as informações abaixo para finalizar o cadastro."
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
      <div className="bg-primary/5 border-primary/15 text-foreground flex items-start gap-2 rounded-md border p-3 text-sm">
        <Info className="text-primary mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Prazo de aprovação</p>
          <p className="text-muted-foreground text-xs">
            Após o cadastro, sua conta passará por análise administrativa.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>E-mail (via LinkedIn)</Label>
        <Input value={email} readOnly disabled />
      </div>

      <Tabs
        value={type}
        onValueChange={(v) =>
          form.setValue("type", v as RegisterCompanyLinkedInFormValues["type"])
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value="INDIVIDUAL">
            <User className="size-4" />
            Pessoa Física
          </TabsTrigger>
          <TabsTrigger value="LEGAL_ENTITY">
            <Building2 className="size-4" />
            Empresa
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isIndividual ? "Nome completo" : "Razão Social"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isIndividual ? "Maria da Silva" : "Minha Empresa Ltda"
                      }
                      {...field}
                    />
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
                  <FormLabel>{isIndividual ? "CPF" : "CNPJ"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isIndividual ? "000.000.000-00" : "00.000.000/0001-00"
                      }
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
                  <FormLabel>Descrição do contratante</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Fale sobre você e os projetos que costuma contratar..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <LegalConsentFields />

          <Button
            type="submit"
            className="w-full"
            disabled={
              registerCompanyLinkedin.isPending || !form.formState.isValid
            }
          >
            <Link2 className="size-4" />
            {registerCompanyLinkedin.isPending
              ? "Enviando…"
              : "Concluir cadastro"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
