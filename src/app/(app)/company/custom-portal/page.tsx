"use client";

import { CheckCircle2, Clock, Palette, Store, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrandingEditor } from "@/components/custom-portal/branding-editor";
import { PortalAnalyticsView } from "@/components/custom-portal/portal-analytics-view";
import { SubscriptionBillingCard } from "@/components/custom-portal/subscription-billing-card";
import { PortalPreviewDialog } from "@/components/custom-portal/portal-preview-dialog";
import { PortalUrlBox } from "@/components/custom-portal/portal-url-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteCustomPortalImage,
  useUpdateCustomPortalBranding,
  useUploadCustomPortalImage,
} from "@/hooks/mutations/useCustomPortalBranding";
import { useRequestCustomPortal } from "@/hooks/mutations/useCustomPortalRequest";
import { useMyCustomPortal } from "@/hooks/queries/useCustomPortal";
import {
  useCustomPortalAnalytics,
  type AnalyticsRange,
} from "@/hooks/queries/useCustomPortalAnalytics";
import { ApiError } from "@/lib/api-client";
import {
  customPortalPaymentStatusLabel,
  customPortalStatusLabel,
  type CustomPortalDTO,
} from "@/types/custom-portal";

function formatDateOnly(iso: string) {
  const [y, m, d] = iso.split("-");
  return d ? `${d}/${m}/${y}` : iso;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function CompanyCustomPortalPage() {
  const { data, isLoading } = useMyCustomPortal();
  const [tab, setTab] = useState<"overview" | "appearance" | "analytics">(
    "overview"
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minha Plataforma</h1>
        <p className="text-muted-foreground text-sm">
          Sua vitrine de vagas com a identidade visual da empresa, sobre os
          mesmos projetos e vagas que você já publica no Nexus.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="max-w-3xl">
            {isLoading ? (
              <Skeleton className="h-56" />
            ) : data?.portal ? (
              <div className="flex flex-col gap-4">
                <PortalCard
                  portal={data.portal}
                  onEditAppearance={() => setTab("appearance")}
                />
                <SubscriptionBillingCard />
              </div>
            ) : data?.latestRequest?.status === "PENDING" ? (
              <PendingCard
                requestedAt={data.latestRequest.requestedAt}
                message={data.latestRequest.message}
              />
            ) : data?.latestRequest?.status === "REJECTED" ? (
              <RejectedCard
                reason={data.latestRequest.decisionReason}
                canRequest={data.canRequest}
              />
            ) : (
              <EmptyCard canRequest={data?.canRequest ?? true} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : data?.portal ? (
            <CompanyBrandingTab portal={data.portal} />
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                A aba Aparência fica disponível assim que a sua plataforma for
                aprovada. Enquanto isso, acompanhe o status na aba “Visão
                geral”.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : data?.portal ? (
            <CompanyAnalyticsTab />
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                As análises da sua plataforma aparecem aqui depois que ela for
                aprovada e começar a receber acessos.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompanyBrandingTab({ portal }: { portal: CustomPortalDTO }) {
  const save = useUpdateCustomPortalBranding();
  const upload = useUploadCustomPortalImage();
  const remove = useDeleteCustomPortalImage();

  return (
    <BrandingEditor
      portal={portal}
      savingBranding={save.isPending}
      onSaveBranding={(body) => save.mutateAsync(body)}
      onUploadImage={(kind, file) => upload.mutateAsync({ kind, file })}
      onDeleteImage={(kind) => remove.mutateAsync({ kind })}
    />
  );
}

function CompanyAnalyticsTab() {
  const [days, setDays] = useState<AnalyticsRange>(30);
  const analytics = useCustomPortalAnalytics(days);

  return (
    <PortalAnalyticsView
      data={analytics.data}
      days={days}
      onDaysChange={setDays}
      isLoading={analytics.isLoading}
    />
  );
}

function RequestButton({
  canRequest,
  label = "Quero minha plataforma personalizada",
}: {
  canRequest: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const request = useRequestCustomPortal();

  function handleOpenChange(next: boolean) {
    if (next) setMessage("");
    setOpen(next);
  }

  function handleConfirm() {
    request.mutate(
      { message: message.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(
            "Solicitação enviada! Você receberá um e-mail com a decisão."
          );
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível enviar a solicitação."
          ),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canRequest}>
          <Store className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar plataforma personalizada</DialogTitle>
          <DialogDescription>
            Nossa equipe vai analisar o pedido e definir o plano, o valor e o
            subdomínio. Você acompanha o status por aqui e recebe um e-mail com
            a decisão.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="custom-portal-message">
            Mensagem para a equipe (opcional)
          </Label>
          <Textarea
            id="custom-portal-message"
            rows={3}
            placeholder="Conte um pouco sobre o que você espera da sua plataforma."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={request.isPending} onClick={handleConfirm}>
            {request.isPending ? "Enviando…" : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyCard({ canRequest }: { canRequest: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="text-primary size-5" />
          Ainda não solicitada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            Cor, logo, banner e textos institucionais com a cara da empresa.
          </li>
          <li>
            Endereço próprio: <code>suaempresa.nexus.com.br</code>.
          </li>
          <li>
            Mostra as mesmas oportunidades que você já publica no Nexus — sem
            recadastrar nada.
          </li>
        </ul>
        <RequestButton canRequest={canRequest} />
      </CardContent>
    </Card>
  );
}

function PendingCard({
  requestedAt,
  message,
}: {
  requestedAt: string;
  message: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="text-warning size-5" />
          Solicitação em análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Enviada em {formatDateTime(requestedAt)}. Nossa equipe vai avaliar e
          você receberá um e-mail com a decisão.
        </p>
        {message && (
          <div>
            <div className="text-muted-foreground text-xs font-medium uppercase">
              Sua mensagem
            </div>
            <p className="whitespace-pre-line">{message}</p>
          </div>
        )}
        <Badge variant="secondary" className="bg-warning/15 text-warning">
          Pendente
        </Badge>
      </CardContent>
    </Card>
  );
}

function RejectedCard({
  reason,
  canRequest,
}: {
  reason: string | null;
  canRequest: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="text-destructive size-5" />
          Solicitação não aprovada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {reason && (
          <div>
            <div className="text-muted-foreground text-xs font-medium uppercase">
              Motivo
            </div>
            <p className="whitespace-pre-line">{reason}</p>
          </div>
        )}
        <RequestButton canRequest={canRequest} label="Solicitar novamente" />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b py-2 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  SUSPENDED: "bg-warning/15 text-warning",
  CANCELED: "bg-destructive/15 text-destructive",
};
const paymentStyle: Record<string, string> = {
  UP_TO_DATE: "bg-success/15 text-success",
  OVERDUE: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

function isBrandingEmpty(portal: CustomPortalDTO) {
  return (
    !portal.displayName &&
    !portal.primaryColor &&
    !portal.logoUrl &&
    !portal.bannerUrl &&
    !portal.faviconUrl &&
    !portal.aboutText &&
    portal.sections.length === 0
  );
}

function PortalCard({
  portal,
  onEditAppearance,
}: {
  portal: CustomPortalDTO;
  onEditAppearance: () => void;
}) {
  const active = portal.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-4">
      {/* Status e endereço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="text-primary size-5" />
            Sua plataforma
          </CardTitle>
          <Badge
            variant="secondary"
            className={statusStyle[portal.status] ?? ""}
          >
            {customPortalStatusLabel[portal.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <PortalUrlBox subdomain={portal.subdomain} active={active} />

          {isBrandingEmpty(portal) && (
            <p className="bg-muted/50 rounded-md p-3 text-xs">
              Sua página ainda não foi personalizada. Configure cor, logo,
              banner e textos na aba <strong>Aparência</strong>.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onEditAppearance}>
              <Palette className="size-4" />
              Editar aparência
            </Button>
            <PortalPreviewDialog portal={portal} />
          </div>
        </CardContent>
      </Card>

      {/* Assinatura — somente leitura (quem edita é o Admin) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Plano">{portal.planName}</Row>
          <Row label="Valor mensal">
            R${" "}
            {portal.planPrice.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Row>
          <Row label="Início da assinatura">
            {formatDateOnly(portal.subscriptionStartDate)}
          </Row>
          <Row label="Próximo vencimento">
            {formatDateOnly(portal.nextDueDate)}
          </Row>
          <Row label="Pagamento">
            <span
              className={`rounded px-2 py-0.5 text-xs ${paymentStyle[portal.paymentStatus] ?? ""}`}
            >
              {customPortalPaymentStatusLabel[portal.paymentStatus]}
            </span>
          </Row>
          <p className="text-muted-foreground pt-3 text-xs">
            A assinatura é gerida pela equipe Nexus. Para mudanças de plano,
            valor ou pagamento, fale com o suporte.
          </p>
        </CardContent>
      </Card>

      {/* Banner contextual */}
      {active ? (
        <Card className="border-primary/30">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" />
            <p className="text-muted-foreground">
              Sua página está no ar. Visitantes veem as vagas abertas da sua
              empresa com a identidade visual que você configurar na aba
              Aparência.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-warning/40">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <Clock className="text-warning mt-0.5 size-5 shrink-0" />
            <p className="text-muted-foreground">
              Sua plataforma personalizada está{" "}
              {customPortalStatusLabel[portal.status].toLowerCase()} — a página
              pública fica fora do ar até a reativação. Seu cadastro normal no
              Nexus continua ativo e inalterado; fale com o suporte para
              regularizar. Você pode continuar editando a aparência normalmente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
