"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
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
import {
  useAddPreviousProject,
  useUpdatePreviousProject,
} from "@/hooks/mutations/usePreviousProjectMutations";
import { ApiError } from "@/lib/api-client";
import {
  type PreviousProjectFormValues,
  previousProjectSchema,
} from "@/lib/validation";
import type { PreviousProjectDTO } from "@/types/previous-project";

export function PreviousProjectFormDialog({
  editing,
}: {
  editing?: PreviousProjectDTO;
}) {
  const [open, setOpen] = useState(false);
  const addProject = useAddPreviousProject();
  const updateProject = useUpdatePreviousProject();

  const form = useForm<PreviousProjectFormValues>({
    resolver: zodResolver(previousProjectSchema),
    values: {
      title: editing?.title ?? "",
      description: editing?.description ?? "",
      technologies: editing?.technologies.join(", ") ?? "",
      yearOfCompletion: editing?.yearOfCompletion?.toString() ?? "",
    },
  });

  function onSubmit(values: PreviousProjectFormValues) {
    const payload = {
      title: values.title,
      description: values.description || null,
      technologies: values.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      yearOfCompletion: values.yearOfCompletion
        ? Number(values.yearOfCompletion)
        : null,
    };

    const onSettled = {
      onSuccess: () => {
        toast.success(editing ? "Projeto atualizado!" : "Projeto adicionado!");
        setOpen(false);
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível salvar o projeto."
        );
      },
    };

    if (editing) {
      updateProject.mutate({ id: editing.id, ...payload }, onSettled);
    } else {
      addProject.mutate(payload, onSettled);
    }
  }

  const isPending = addProject.isPending || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="icon" aria-label="Editar projeto">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Adicionar projeto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar projeto" : "Novo projeto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: E-commerce para varejo de moda"
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tecnologias</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React, Node.js, PostgreSQL"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    Separe por vírgula.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearOfCompletion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de conclusão</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2024" {...field} />
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
              <Button type="submit" disabled={isPending}>
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
