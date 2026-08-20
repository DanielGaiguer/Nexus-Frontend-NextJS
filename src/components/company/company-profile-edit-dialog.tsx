"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCompanyProfile } from "@/hooks/mutations/useUpdateCompanyProfile";
import { ApiError } from "@/lib/api-client";
import {
  type CompanyProfileEditFormValues,
  companyProfileEditSchema,
  toNullable,
} from "@/lib/validation";
import type { CompanyProfileDTO } from "@/types/company";

export function CompanyProfileEditDialog({
  profile,
}: {
  profile: CompanyProfileDTO;
}) {
  const [open, setOpen] = useState(false);
  const updateProfile = useUpdateCompanyProfile();

  const form = useForm<CompanyProfileEditFormValues>({
    resolver: zodResolver(companyProfileEditSchema),
    values: {
      companyName: profile.companyName,
      taxId: profile.taxId ?? "",
      phone: profile.phone ?? "",
      cep: "",
      description: profile.description ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
    },
  });

  function onSubmit(values: CompanyProfileEditFormValues) {
    updateProfile.mutate(
      {
        ...profile,
        companyName: values.companyName,
        // CNPJ não é editável nesta UI (mesmo comportamento do app antigo) —
        // sempre reenviado como veio, nunca o valor digitado.
        taxId: profile.taxId,
        phone: toNullable(values.phone),
        cep: toNullable(values.cep),
        description: toNullable(values.description),
        linkedinUrl: toNullable(values.linkedinUrl),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil className="size-4" />
          Editar perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da empresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel className="text-muted-foreground">
                CNPJ (não editável)
              </FormLabel>
              <Input value={profile.taxId ?? ""} disabled />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.linkedin.com/company/sua-empresa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
