"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  CustomPortalSubscriptionFields,
  emptySubscriptionForm,
  subscriptionFormToInput,
  subscriptionFormValid,
  type SubscriptionFormState,
} from "@/components/admin/custom-portal-subscription-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCustomPortal } from "@/hooks/mutations/useAdminCustomPortalActions";
import { useAdminCustomPortals } from "@/hooks/queries/useAdminCustomPortals";
import { useAdminAllCompanies } from "@/hooks/queries/useAdminCompanies";
import { ApiError } from "@/lib/api-client";

export function CreateCustomPortalDialog() {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [form, setForm] = useState<SubscriptionFormState>(
    emptySubscriptionForm
  );

  const companies = useAdminAllCompanies();
  const portals = useAdminCustomPortals();
  const create = useCreateCustomPortal();

  const eligible = useMemo(() => {
    const taken = new Set((portals.data ?? []).map((p) => p.companyId));
    return (companies.data ?? [])
      .filter((c) => c.status === "APPROVED" && !taken.has(c.id))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [companies.data, portals.data]);

  function handleOpenChange(next: boolean) {
    if (next) {
      setCompanyId("");
      setForm(emptySubscriptionForm());
    }
    setOpen(next);
  }

  const canSubmit = companyId !== "" && subscriptionFormValid(form);

  function handleSubmit() {
    if (!canSubmit) return;
    create.mutate(
      { companyId: Number(companyId), ...subscriptionFormToInput(form) },
      {
        onSuccess: () => {
          toast.success("Plataforma personalizada criada.");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível criar a plataforma."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Criar plataforma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar plataforma personalizada</DialogTitle>
          <DialogDescription>
            Para um contratante já aprovado, sem solicitação prévia (contato
            comercial feito por fora da plataforma).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Contratante *</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    companies.isLoading
                      ? "Carregando…"
                      : eligible.length === 0
                        ? "Nenhum contratante elegível"
                        : "Selecione…"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {eligible.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Só aparecem contratantes aprovados que ainda não têm uma
              plataforma.
            </p>
          </div>

          <CustomPortalSubscriptionFields value={form} onChange={setForm} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canSubmit || create.isPending}
            onClick={handleSubmit}
          >
            <Plus className="size-4" />
            {create.isPending ? "Criando…" : "Criar plataforma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
