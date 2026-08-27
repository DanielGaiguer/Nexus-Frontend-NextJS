"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customPortalPaymentStatusLabel,
  type CustomPortalPaymentStatus,
  type SubscriptionInput,
} from "@/types/custom-portal";

/** Estado do formulário de assinatura (strings — convertidas no submit). */
export interface SubscriptionFormState {
  subdomain: string;
  planName: string;
  planPrice: string;
  subscriptionStartDate: string;
  nextDueDate: string;
  paymentStatus: CustomPortalPaymentStatus;
}

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])$/;

export function emptySubscriptionForm(): SubscriptionFormState {
  return {
    subdomain: "",
    planName: "",
    planPrice: "",
    subscriptionStartDate: new Date().toISOString().slice(0, 10),
    nextDueDate: "",
    paymentStatus: "UP_TO_DATE",
  };
}

export function subscriptionFormValid(
  s: SubscriptionFormState,
  opts: { requireSubdomain?: boolean; requireStartDate?: boolean } = {}
): boolean {
  const { requireSubdomain = true, requireStartDate = true } = opts;
  const priceOk =
    s.planPrice.trim() !== "" &&
    !Number.isNaN(Number(s.planPrice)) &&
    Number(s.planPrice) >= 0;
  const subdomainOk =
    !requireSubdomain || SUBDOMAIN_RE.test(s.subdomain.trim().toLowerCase());
  const startOk = !requireStartDate || !!s.subscriptionStartDate;
  const orderOk =
    !s.subscriptionStartDate ||
    !s.nextDueDate ||
    s.nextDueDate >= s.subscriptionStartDate;
  return (
    subdomainOk &&
    s.planName.trim().length > 0 &&
    priceOk &&
    startOk &&
    !!s.nextDueDate &&
    orderOk
  );
}

export function subscriptionFormToInput(
  s: SubscriptionFormState
): SubscriptionInput {
  return {
    subdomain: s.subdomain.trim().toLowerCase(),
    planName: s.planName.trim(),
    planPrice: Number(s.planPrice),
    subscriptionStartDate: s.subscriptionStartDate,
    nextDueDate: s.nextDueDate,
    paymentStatus: s.paymentStatus,
  };
}

export function CustomPortalSubscriptionFields({
  value,
  onChange,
  showSubdomain = true,
  showStartDate = true,
}: {
  value: SubscriptionFormState;
  onChange: (next: SubscriptionFormState) => void;
  showSubdomain?: boolean;
  showStartDate?: boolean;
}) {
  const set = <K extends keyof SubscriptionFormState>(
    key: K,
    v: SubscriptionFormState[K]
  ) => onChange({ ...value, [key]: v });

  const subdomainInvalid =
    showSubdomain &&
    value.subdomain.trim() !== "" &&
    !SUBDOMAIN_RE.test(value.subdomain.trim().toLowerCase());

  return (
    <div className="space-y-4">
      {showSubdomain && (
        <div className="space-y-1.5">
          <Label htmlFor="cp-subdomain">Subdomínio *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cp-subdomain"
              placeholder="acme"
              autoCapitalize="none"
              value={value.subdomain}
              onChange={(e) => set("subdomain", e.target.value.toLowerCase())}
              aria-invalid={subdomainInvalid}
            />
            <span className="text-muted-foreground shrink-0 text-sm">
              .nexus.com.br
            </span>
          </div>
          <p
            className={
              subdomainInvalid
                ? "text-destructive text-xs"
                : "text-muted-foreground text-xs"
            }
          >
            3 a 63 caracteres: letras minúsculas, números ou hífen, sem hífen no
            começo ou no fim.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cp-plan-name">Plano *</Label>
          <Input
            id="cp-plan-name"
            placeholder="Ex.: Plano Pro"
            value={value.planName}
            onChange={(e) => set("planName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-plan-price">Valor mensal (R$) *</Label>
          <Input
            id="cp-plan-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="199.90"
            value={value.planPrice}
            onChange={(e) => set("planPrice", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {showStartDate && (
          <div className="space-y-1.5">
            <Label htmlFor="cp-start">Início da assinatura *</Label>
            <Input
              id="cp-start"
              type="date"
              value={value.subscriptionStartDate}
              onChange={(e) => set("subscriptionStartDate", e.target.value)}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="cp-due">Próximo vencimento *</Label>
          <Input
            id="cp-due"
            type="date"
            value={value.nextDueDate}
            min={value.subscriptionStartDate || undefined}
            onChange={(e) => set("nextDueDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Situação de pagamento</Label>
        <Select
          value={value.paymentStatus}
          onValueChange={(v) =>
            set("paymentStatus", v as CustomPortalPaymentStatus)
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
  );
}
