"use client";

import { History, Palette, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
  const [tab, setTab] = useState<"requests" | "portals">("requests");
  const requests = useAdminCustomPortalRequests();
  const portals = useAdminCustomPortals();

  const pendingCount = (requests.data ?? []).filter(
    (r) => r.status === "PENDING"
  ).length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Plataformas personalizadas
          </h1>
          <p className="text-muted-foreground text-sm">
            Solicitações dos contratantes e gestão das plataformas e
            assinaturas.
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
            Plataformas{" "}
            <Badge variant="secondary">{portals.data?.length ?? 0}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "requests" ? (
        <RequestsTab
          isLoading={requests.isLoading}
          rows={requests.data ?? []}
        />
      ) : (
        <PortalsTab isLoading={portals.isLoading} rows={portals.data ?? []} />
      )}
    </div>
  );
}

function RequestsTab({
  isLoading,
  rows,
}: {
  isLoading: boolean;
  rows: CustomPortalRequestDTO[];
}) {
  if (isLoading) return <Skeleton className="h-64" />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Nenhuma solicitação"
        description="Quando um contratante pedir uma plataforma personalizada, ela aparece aqui."
      />
    );
  }

  return (
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
          {rows.map((r) => (
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
  );
}

function PortalsTab({
  isLoading,
  rows,
}: {
  isLoading: boolean;
  rows: CustomPortalDTO[];
}) {
  if (isLoading) return <Skeleton className="h-64" />;
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
          {rows.map((p) => (
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
                    <Link href={`/admin/custom-portals/${p.id}/appearance`}>
                      <Palette className="size-4" />
                      Aparência
                    </Link>
                  </Button>
                  <HistoryDialog portalId={p.id} companyName={p.companyName} />
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
