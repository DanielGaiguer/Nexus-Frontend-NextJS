"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Combobox multi-seleção genérico (usado nos filtros de "Experiência" e
 * "Skills" de pro/opportunities, e nos mesmos filtros nos mapas e em
 * admin/projects — todos espelham os `<select multiple>` do app antigo).
 */
export function MultiSelectPopover({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal"
        >
          <span className="truncate">
            {value.length > 0 ? `${label} (${value.length})` : label}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Check
                      className={
                        isSelected
                          ? "mr-2 size-4 opacity-100"
                          : "mr-2 size-4 opacity-0"
                      }
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t p-2">
            {value.map((v) => (
              <Badge key={v} variant="secondary" className="text-[11px]">
                {options.find((o) => o.value === v)?.label ?? v}
              </Badge>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
