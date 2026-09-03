"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Info, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { LinkedInIcon } from "@/components/auth/brand-icons";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      type: "LEGAL_ENTITY",
      companyName: "",
      taxId: "",
      email: "",
      password: "",
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

  function onSubmit(values: RegisterCompanyFormValues) {
    registerCompany.mutate(
      {
        type: values.type,
        companyName: values.companyName,
        email: values.email,
        password: values.password,
        taxId: toNullable(values.taxId),
        phone: toNullable(values.phone),
        cep: toNullable(values.cep),
        description: toNullable(values.description),
        acceptedTermsOfUse: values.acceptedTermsOfUse,
        acceptedMarketingCommunications: values.acceptedMarketingCommunications,
        acceptedAlgorithmImprovement: values.acceptedAlgorithmImprovement,
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
      icon={isIndividual ? User : Building2}
      eyebrow="Sou Contratante"
      eyebrowClassName="bg-nexus-accent/10 text-nexus-accent border-nexus-accent/20"
      title="Cadastre-se como contratante"
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
      <div className="bg-primary/5 border-primary/15 text-foreground flex items-start gap-2 rounded-md border p-3 text-sm">
        <Info className="text-primary mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Prazo de aprovação</p>
          <p className="text-muted-foreground text-xs">
            Após o cadastro, sua conta passará por análise administrativa.
          </p>
        </div>
      </div>

      <Tabs
        value={type}
        onValueChange={(v) =>
          form.setValue("type", v as RegisterCompanyFormValues["type"])
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={
                        isIndividual ? "voce@email.com" : "contato@empresa.com"
                      }
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
            disabled={registerCompany.isPending || !form.formState.isValid}
          >
            {isIndividual ? (
              <User className="size-4" />
            ) : (
              <Building2 className="size-4" />
            )}
            {registerCompany.isPending ? "Enviando…" : "Solicitar cadastro"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-2">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">ou</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <Button
        asChild
        className="w-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
      >
        <a href="/api/auth/linkedin/register?role=COMPANY">
          <LinkedInIcon className="size-4" />
          Cadastre-se com LinkedIn
        </a>
      </Button>
    </AuthCard>
  );
}
