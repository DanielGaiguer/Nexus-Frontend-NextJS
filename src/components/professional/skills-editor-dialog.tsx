"use client";

import { Check, ChevronsUpDown, Pencil, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import { useUpdateProfessionalSkills } from "@/hooks/mutations/useUpdateProfessionalSkills";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function SkillsEditorDialog({
  currentSkillNames,
  trigger,
}: {
  currentSkillNames: string[];
  /** Sobrescreve o botão padrão — usado no estado vazio ("Adicionar agora →"). */
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const { data: catalog } = useSkillCatalog();
  const updateSkills = useUpdateProfessionalSkills();

  // Mesma técnica do controller antigo: o perfil só carrega nomes, então
  // cruzamos com o catálogo (que tem id) pra saber o que já está selecionado.
  const initialSelectedIds = useMemo(
    () =>
      (catalog ?? [])
        .filter((skill) => currentSkillNames.includes(skill.name))
        .map((skill) => skill.id),
    [catalog, currentSkillNames]
  );

  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);

  function handleOpenChange(next: boolean) {
    if (next) setSelectedIds(initialSelectedIds);
    setOpen(next);
  }

  const selectedSkills = (catalog ?? []).filter((skill) =>
    selectedIds.includes(skill.id)
  );

  function handleSave() {
    updateSkills.mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Skills atualizadas!");
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível salvar as skills."
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-3.5" />
            Editar skills
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar skills</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Selecione as skills que você domina. Elas impactam diretamente o
          componente de Skills no score de compatibilidade.
        </p>

        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboOpen}
              className="w-full justify-between font-normal"
            >
              Buscar skill...
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <CommandInput placeholder="Buscar skill..." />
              <CommandList>
                <CommandEmpty>Nenhuma skill encontrada.</CommandEmpty>
                <CommandGroup>
                  {(catalog ?? []).map((skill) => {
                    const isSelected = selectedIds.includes(skill.id);
                    return (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() =>
                          setSelectedIds((ids) =>
                            isSelected
                              ? ids.filter((id) => id !== skill.id)
                              : [...ids, skill.id]
                          )
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {skill.name}
                        {skill.category && (
                          <span className="text-muted-foreground ml-auto text-xs">
                            {skill.category}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex min-h-16 flex-wrap gap-2 rounded-md border p-3">
          {selectedSkills.length === 0 && (
            <span className="text-muted-foreground text-sm">
              Nenhuma skill selecionada.
            </span>
          )}
          {selectedSkills.map((skill) => (
            <Badge key={skill.id} variant="secondary" className="gap-1">
              {skill.name}
              <button
                type="button"
                onClick={() =>
                  setSelectedIds((ids) => ids.filter((id) => id !== skill.id))
                }
                aria-label={`Remover ${skill.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateSkills.isPending}
          >
            {updateSkills.isPending ? "Salvando…" : "Salvar skills"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
