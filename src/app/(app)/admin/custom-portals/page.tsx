"use client";

import { BarChart3, History, Palette, Search, Store } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminPortalAnalyticsView } from "@/components/admin/admin-portal-analytics-view";
import { ApproveCustomPortalRequestDialog } from "@/components/admin/approve-custom-portal-request-dialog";
import { CreateCustomPortalDialog } from "@/components/admin/create-custom-portal-dialog";
import { CustomPortalStatusDialog } from "@/components/admin/custom-portal-status-dialog";
import { CustomPortalSubscriptionDialog } from "@/components/admin/custom-portal-subscription-dialog";
import { RejectCustomPortalRequestDialog } from "@/components/admin/reject-custom-portal-request-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminCustomPortalDetail,
  useAdminCustomPortalRequests,
  useAdminCustomPortals,
} from "@/hooks/queries/useAdminCustomPortals";
import {
  useAdminCustomPortalSystemAnalytics,
  type AnalyticsRange,
} from "@/hooks/queries/useCustomPortalAnalytics";
import {
  customPortalPaymentStatusLabel,
  customPortalRequestStatusLabel,
  customPortalStatusLabel,
  type CustomPortalDTO,
  type CustomPortalRequestDTO,
  type CustomPortalStatus,
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

const requestBadgeClass: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-destructive/15 text-destructive",
};
const portalBadgeClass: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  SUSPENDED: "bg-warning/15 text-warning",
  CANCELED: "bg-destructive/15 text-destructive",
};
const paymentBadgeClass: Record<string, string> = {
  UP_TO_DATE: "bg-success/15 text-success",
  OVERDUE: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export default function AdminCustomPortalsPage() {
  const [tab, setTab] = useState<"requests" | "portals" | "analytics">(
    "requests"
  );
  const requests = useAdminCustomPortalRequests();
  const portals = useAdminCustomPortals();

  const requestRows = requests.data ?? [];
  const portalRows = portals.data ?? [];
  const pendingCount = requestRows.filter((r) => r.status === "PENDING").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Plataformas personalizadas
          </h1>
          <p className="text-muted-foreground text-sm">
            Solicitações dos contratantes, gestão das plataformas e visão geral
            do módulo.
          </p>
        </div>
        <CreateCustomPortalDialog />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="requests">
            Solicitações <Badge variant="secondary">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="portals">
            Plataformas <Badge variant="secondary">{portalRows.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "requests" ? (
        <RequestsTab isLoading={requests.isLoading} rows={requestRows} />
      ) : tab === "portals" ? (
        <PortalsTab isLoading={portals.isLoading} rows={portalRows} />
      ) : (
        <AnalyticsTab />
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [days, setDays] = useState<AnalyticsRange>(30);
  const analytics = useAdminCustomPortalSystemAnalytics(days);

  return (
    <AdminPortalAnalyticsView
      data={analytics.data}
      days={days}
      onDaysChange={setDays}
      isLoading={analytics.isLoading}
    />
  );
}

function RequestsTab({
  isLoading,
  rows,
}: {
  isLoading: boolean;
  rows: CustomPortalRequestDTO[];
}) {
  const [scope, setScope] = useState<"PENDING" | "ALL">("PENDING");

  const filtered = useMemo(
    () => (scope === "ALL" ? rows : rows.filter((r) => r.status === "PENDING")),
    [rows, scope]
  );

  if (isLoading) return <Skeleton className="h-64" />;

  const filters = (
    <div className="flex justify-end">
      <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Fila de pendentes</SelectItem>
          <SelectItem value="ALL">Todas as solicitações</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {filters}
        <EmptyState
          icon={Store}
          title="Nenhuma solicitação"
          description="Quando um contratante pedir uma plataforma personalizada, ela aparece aqui."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filters}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Nenhuma solicitação pendente"
          description="A fila está vazia. Use “Todas as solicitações” para ver o histórico."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contratante</TableHead>
                <TableHead>Solicitada em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.companyName}</div>
                    {r.message && (
                      <div className="text-muted-foreground max-w-sm truncate text-xs">
                        “{r.message}”
                      </div>
                    )}
                    {r.status === "REJECTED" && r.decisionReason && (
                      <div className="text-destructive/80 max-w-sm truncate text-xs">
                        Motivo: {r.decisionReason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(r.requestedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={requestBadgeClass[r.status] ?? ""}
                    >
                      {customPortalRequestStatusLabel[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <RejectCustomPortalRequestDialog
                          requestId={r.id}
                          companyName={r.companyName}
                        />
                        <ApproveCustomPortalRequestDialog
                          requestId={r.id}
                          companyName={r.companyName}
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {r.reviewedByEmail ? `por ${r.reviewedByEmail}` : "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function PortalsTab({
  isLoading,
  rows,
}: {
  isLoading: boolean;
  rows: CustomPortalDTO[];
}) {
  const [status, setStatus] = useState<CustomPortalStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(
      (p) =>
        (status === "ALL" || p.status === status) &&
        (term === "" ||
          p.companyName.toLowerCase().includes(term) ||
          p.subdomain.toLowerCase().includes(term))
    );
  }, [rows, status, search]);

  if (isLoading) return <Skeleton className="h-64" />;

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por contratante ou subdomínio…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select
        value={status}
        onValueChange={(v) => setStatus(v as CustomPortalStatus | "ALL")}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          <SelectItem value="ACTIVE">
            {customPortalStatusLabel.ACTIVE}
          </SelectItem>
          <SelectItem value="SUSPENDED">
            {customPortalStatusLabel.SUSPENDED}
          </SelectItem>
          <SelectItem value="CANCELED">
            {customPortalStatusLabel.CANCELED}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Nenhuma plataforma personalizada"
        description="Aprove uma solicitação ou use “Criar plataforma” para começar."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filters}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Nenhuma plataforma encontrada"
          description="Ajuste a busca ou o filtro de status."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contratante</TableHead>
                <TableHead>Subdomínio</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.companyName}</div>
                    <div className="text-muted-foreground text-xs">
                      {p.createdFromRequest
                        ? "via solicitação"
                        : "criada pelo admin"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <code>{p.subdomain}.nexus.com.br</code>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      {p.planName} — R${" "}
                      {p.planPrice.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      vence {formatDateOnly(p.nextDueDate)} ·{" "}
                      <span
                        className={`rounded px-1 ${paymentBadgeClass[p.paymentStatus] ?? ""}`}
                      >
                        {customPortalPaymentStatusLabel[p.paymentStatus]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={portalBadgeClass[p.status] ?? ""}
                    >
                      {customPortalStatusLabel[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/custom-portals/${p.id}/analytics`}>
                          <BarChart3 className="size-4" />
                          Analytics
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/custom-portals/${p.id}/appearance`}>
                          <Palette className="size-4" />
                          Aparência
                        </Link>
                      </Button>
                      <HistoryDialog
                        portalId={p.id}
                        companyName={p.companyName}
                      />
                      {p.status !== "CANCELED" && (
                        <CustomPortalSubscriptionDialog portal={p} />
                      )}
                      {p.status === "ACTIVE" && (
                        <CustomPortalStatusDialog
                          portalId={p.id}
                          action="suspend"
                          companyName={p.companyName}
                        />
                      )}
                      {p.status === "SUSPENDED" && (
                        <CustomPortalStatusDialog
                          portalId={p.id}
                          action="reactivate"
                          companyName={p.companyName}
                        />
                      )}
                      {p.status !== "CANCELED" && (
                        <CustomPortalStatusDialog
                          portalId={p.id}
                          action="cancel"
                          companyName={p.companyName}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function HistoryDialog({
  portalId,
  companyName,
}: {
  portalId: number;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const detail = useAdminCustomPortalDetail(portalId, open);

  const statusLabel = (s: CustomPortalStatus | null) =>
    s ? customPortalStatusLabel[s] : "—";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="size-4" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico — {companyName}</DialogTitle>
        </DialogHeader>
        {detail.isLoading ? (
          <Skeleton className="h-40" />
        ) : (detail.data?.statusHistory.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sem alterações registradas.
          </p>
        ) : (
          <ol className="space-y-3">
            {detail.data!.statusHistory.map((h) => (
              <li key={h.id} className="border-l-2 pl-3 text-sm">
                <div className="font-medium">
                  {statusLabel(h.previousStatus)} → {statusLabel(h.newStatus)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatDateTime(h.changedAt)}
                  {h.changedByEmail ? ` · ${h.changedByEmail}` : ""}
                </div>
                {h.note && <div className="mt-0.5">{h.note}</div>}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
