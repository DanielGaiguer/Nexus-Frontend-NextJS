"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCustomPortalSubscription } from "@/hooks/mutations/useAdminCustomPortalActions";
import { ApiError } from "@/lib/api-client";
import {
  customPortalPaymentStatusLabel,
  type CustomPortalDTO,
  type CustomPortalPaymentStatus,
} from "@/types/custom-portal";

export function CustomPortalSubscriptionDialog({
  portal,
}: {
  portal: CustomPortalDTO;
}) {
  const [open, setOpen] = useState(false);
  const [planName, setPlanName] = useState(portal.planName);
  const [planPrice, setPlanPrice] = useState(String(portal.planPrice));
  const [nextDueDate, setNextDueDate] = useState(portal.nextDueDate);
  const [paymentStatus, setPaymentStatus] = useState<CustomPortalPaymentStatus>(
    portal.paymentStatus
  );
  const update = useUpdateCustomPortalSubscription();

  function handleOpenChange(next: boolean) {
    if (next) {
      setPlanName(portal.planName);
      setPlanPrice(String(portal.planPrice));
      setNextDueDate(portal.nextDueDate);
      setPaymentStatus(portal.paymentStatus);
    }
    setOpen(next);
  }

  const priceValid =
    planPrice.trim() !== "" &&
    !Number.isNaN(Number(planPrice)) &&
    Number(planPrice) >= 0;
  const canSubmit = planName.trim() !== "" && priceValid && !!nextDueDate;

  function handleSubmit() {
    if (!canSubmit) return;
    update.mutate(
      {
        portalId: portal.id,
        planName: planName.trim(),
        planPrice: Number(planPrice),
        nextDueDate,
        paymentStatus,
      },
      {
        onSuccess: () => {
          toast.success("Assinatura atualizada.");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível atualizar a assinatura."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar assinatura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar assinatura</DialogTitle>
          <DialogDescription>
            {portal.companyName} — {portal.subdomain}.nexus.com.br
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cp-edit-plan">Plano *</Label>
              <Input
                id="cp-edit-plan"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-edit-price">Valor mensal (R$) *</Label>
              <Input
                id="cp-edit-price"
                type="number"
                min="0"
                step="0.01"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-edit-due">Próximo vencimento *</Label>
            <Input
              id="cp-edit-due"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Situação de pagamento</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) =>
                setPaymentStatus(v as CustomPortalPaymentStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    customPortalPaymentStatusLabel
                  ) as CustomPortalPaymentStatus[]
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {customPortalPaymentStatusLabel[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canSubmit || update.isPending}
            onClick={handleSubmit}
          >
            {update.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
