"use client";

import { Check } from "lucide-react";
import { useState } from "react";
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
import { useApproveCustomPortalRequest } from "@/hooks/mutations/useAdminCustomPortalActions";
import { ApiError } from "@/lib/api-client";

export function ApproveCustomPortalRequestDialog({
  requestId,
  companyName,
}: {
  requestId: number;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SubscriptionFormState>(
    emptySubscriptionForm
  );
  const approve = useApproveCustomPortalRequest();

  function handleOpenChange(next: boolean) {
    if (next) setForm(emptySubscriptionForm());
    setOpen(next);
  }

  function handleSubmit() {
    if (!subscriptionFormValid(form)) return;
    approve.mutate(
      { requestId, ...subscriptionFormToInput(form) },
      {
        onSuccess: () => {
          toast.success(
            "Plataforma personalizada criada e assinatura ativada."
          );
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível aprovar a solicitação."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Check className="size-4" />
          Aprovar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovar plataforma personalizada</DialogTitle>
          <DialogDescription>
            Defina o subdomínio e a assinatura de <strong>{companyName}</strong>
            . Ao confirmar, a plataforma é criada e fica ativa.
          </DialogDescription>
        </DialogHeader>

        <CustomPortalSubscriptionFields value={form} onChange={setForm} />

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!subscriptionFormValid(form) || approve.isPending}
            onClick={handleSubmit}
          >
            <Check className="size-4" />
            {approve.isPending ? "Aprovando…" : "Aprovar e criar plataforma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
