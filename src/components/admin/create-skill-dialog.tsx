"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSkill } from "@/hooks/mutations/useAdminSkillActions";
import { ApiError } from "@/lib/api-client";
import { defaultSkillCategories } from "@/types/admin";

const NEW_CATEGORY = "__new__";

export function CreateSkillDialog({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const createSkill = useCreateSkill();

  const categories = Array.from(
    new Set([...defaultSkillCategories, ...existingCategories])
  ).sort();
  const usingNewCategory = category === NEW_CATEGORY;
  const finalCategory = usingNewCategory ? newCategory.trim() : category;
  const canSubmit = name.trim().length > 0 && finalCategory.length > 0;

  function handleOpenChange(next: boolean) {
    if (next) {
      setName("");
      setCategory("");
      setNewCategory("");
    }
    setOpen(next);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    createSkill.mutate(
      { name: name.trim(), category: finalCategory },
      {
        onSuccess: () => {
          toast.success("Skill criada com sucesso!");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível criar a skill."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nova skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="skillName">Nome da skill *</Label>
            <Input
              id="skillName"
              placeholder="Ex: Spring Boot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CATEGORY}>+ Nova categoria</SelectItem>
              </SelectContent>
            </Select>
            {usingNewCategory && (
              <Input
                className="mt-2"
                placeholder="Nome da nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canSubmit || createSkill.isPending}
            onClick={handleSubmit}
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
