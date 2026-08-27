"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
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
  credentialColorHex,
  credentialColorOptions,
} from "@/components/professional/credential-color";
import { useCredentials } from "@/hooks/queries/useCredentials";
import {
  useAddCredential,
  useDeleteCredential,
  useUpdateCredential,
} from "@/hooks/mutations/useCredentialMutations";
import { ApiError } from "@/lib/api-client";
import { type CredentialFormValues, credentialSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type {
  CredentialType,
  ProfessionalCredentialDTO,
} from "@/types/professional";

const typeConfig: Record<
  CredentialType,
  { title: string; editLabel: string; emptyLabel: string }
> = {
  CERTIFICATE: {
    title: "Certificados",
    editLabel: "Editar certificados",
    emptyLabel: "Nenhum certificado cadastrado.",
  },
  EVENT: {
    title: "Eventos",
    editLabel: "Editar eventos",
    emptyLabel: "Nenhum evento cadastrado.",
  },
};

export function CredentialsSection({ type }: { type: CredentialType }) {
  const { data: all } = useCredentials();
  const items = (all ?? []).filter((c) => c.type === type);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProfessionalCredentialDTO | null>(
    null
  );
  const [deleting, setDeleting] = useState<ProfessionalCredentialDTO | null>(
    null
  );

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(credential: ProfessionalCredentialDTO) {
    setEditing(credential);
    setDialogOpen(true);
  }

  const config = typeConfig[type];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{config.title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={openAdd}>
          <Pencil className="size-3.5" />
          {config.editLabel}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={config.emptyLabel}
            action={
              <Button variant="link" size="sm" onClick={openAdd}>
                Adicionar agora →
              </Button>
            }
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((credential) => (
              <div
                key={credential.id}
                className="group flex items-center gap-1"
              >
                <Badge
                  style={{
                    backgroundColor: `${credentialColorHex[credential.color]}22`,
                    color: credentialColorHex[credential.color],
                    borderColor: `${credentialColorHex[credential.color]}55`,
                  }}
                  variant="outline"
                >
                  {credential.name}
                </Badge>
                <button
                  type="button"
                  onClick={() => openEdit(credential)}
                  className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                  aria-label={`Editar ${credential.name}`}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(credential)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                  aria-label={`Remover ${credential.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CredentialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={type}
        editing={editing}
      />

      <AlertDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleting?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <DeleteCredentialAction
              id={deleting?.id}
              onDone={() => setDeleting(null)}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function DeleteCredentialAction({
  id,
  onDone,
}: {
  id: number | undefined;
  onDone: () => void;
}) {
  const deleteCredential = useDeleteCredential();
  return (
    <AlertDialogAction
      onClick={() => {
        if (id == null) return;
        deleteCredential.mutate(id, {
          onSuccess: () => {
            toast.success("Item removido.");
            onDone();
          },
          onError: (error) => {
            toast.error(
              error instanceof ApiError
                ? error.message
                : "Não foi possível remover."
            );
          },
        });
      }}
      disabled={deleteCredential.isPending}
    >
      {deleteCredential.isPending ? "Removendo…" : "Remover"}
    </AlertDialogAction>
  );
}

function CredentialFormDialog({
  open,
  onOpenChange,
  type,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CredentialType;
  editing: ProfessionalCredentialDTO | null;
}) {
  const addCredential = useAddCredential();
  const updateCredential = useUpdateCredential();

  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    values: { name: editing?.name ?? "", color: editing?.color ?? "NEXUS" },
    mode: "onChange",
  });

  function onSubmit(values: CredentialFormValues) {
    const onSettled = {
      onSuccess: () => {
        toast.success(editing ? "Item atualizado." : "Item adicionado.");
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof ApiError ? error.message : "Não foi possível salvar."
        );
      },
    };

    if (editing) {
      updateCredential.mutate({ id: editing.id, type, ...values }, onSettled);
    } else {
      addCredential.mutate({ type, ...values }, onSettled);
    }
  }

  const isPending = addCredential.isPending || updateCredential.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? "Editar item"
              : type === "CERTIFICATE"
                ? "Novo certificado"
                : "Novo evento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={150}
                      placeholder={
                        type === "CERTIFICATE"
                          ? "Ex: AWS Certified Cloud Practitioner"
                          : "Ex: Campus Party 2025"
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do badge</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {credentialColorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={cn(
                          "size-7 rounded-full border-2",
                          field.value === color
                            ? "border-foreground"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: credentialColorHex[color] }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending
                  ? "Salvando…"
                  : editing
                    ? "Salvar alterações"
                    : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
