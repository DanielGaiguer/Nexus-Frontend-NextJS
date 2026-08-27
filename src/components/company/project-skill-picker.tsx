"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import { cn } from "@/lib/utils";

/**
 * Combobox multi-seleção de skills exigidas — mesma técnica de SkillsEditorDialog.
 * Usa `useSkillCatalog` (GET /api/skills, permitAll) em vez de `useProjectSkillCatalog`
 * (GET /api/projects/skills, só COMPANY) porque este componente também é usado em
 * ProposalForm, do lado do profissional — lá, o endpoint só-COMPANY devolvia 403 e o
 * catálogo ficava sempre vazio.
 */
export function ProjectSkillPicker({
  value,
  onChange,
  max = 15,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const { data: catalog } = useSkillCatalog();
  const selected = (catalog ?? []).filter((skill) => value.includes(skill.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
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
                  const isSelected = value.includes(skill.id);
                  return (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => {
                        if (isSelected) {
                          onChange(value.filter((id) => id !== skill.id));
                        } else if (value.length < max) {
                          onChange([...value, skill.id]);
                        }
                      }}
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
        {selected.length === 0 && (
          <span className="text-muted-foreground text-sm">
            Nenhuma skill selecionada.
          </span>
        )}
        {selected.map((skill) => (
          <Badge key={skill.id} variant="secondary" className="gap-1">
            {skill.name}
            <button
              type="button"
              onClick={() => onChange(value.filter((id) => id !== skill.id))}
              aria-label={`Remover ${skill.name}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        Digite para filtrar o catálogo e clique para adicionar. Selecione ao
        menos uma (máx. {max}).
      </p>
    </div>
  );
}
