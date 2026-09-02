"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { RejectCompanyDialog } from "@/components/admin/reject-company-dialog";
import { adminTableFeatures } from "@/components/admin/table-features";
import { CompanyTypeBadge } from "@/components/shared/company-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApproveCompany } from "@/hooks/mutations/useAdminCompanyActions";
import { useAdminAllCompanies } from "@/hooks/queries/useAdminCompanies";
import { ApiError } from "@/lib/api-client";
import type { CompanyProfileDTO, CompanyType } from "@/types/company";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  APPROVED: { label: "Aprovada", variant: "default" },
  PENDING: { label: "Pendente", variant: "secondary" },
  REJECTED: { label: "Rejeitada", variant: "outline" },
};

const helper = createColumnHelper<
  typeof adminTableFeatures,
  CompanyProfileDTO
>();

export default function AdminApprovalsPage() {
  const { data: companies, isLoading } = useAdminAllCompanies();
  const [tab, setTab] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<CompanyType | "ALL">("ALL");
  const approveCompany = useApproveCompany();

  const counts = useMemo(() => {
    const list = companies ?? [];
    return {
      all: list.length,
      PENDING: list.filter((c) => c.status === "PENDING").length,
      APPROVED: list.filter((c) => c.status === "APPROVED").length,
      REJECTED: list.filter((c) => c.status === "REJECTED").length,
    };
  }, [companies]);

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies
      .filter((c) => tab === "all" || c.status === tab)
      .filter((c) => typeFilter === "ALL" || c.type === typeFilter);
  }, [companies, tab, typeFilter]);

  const columns = useMemo(
    () => [
      helper.accessor("companyName", {
        header: "Contratante",
        cell: (info) => {
          const company = info.row.original;
          return (
            <Link
              href={`/admin/company/${company.id}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage
                  src={company.profilePhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback>
                  {company.companyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{company.companyName}</span>
                  <CompanyTypeBadge type={company.type} />
                </div>
                {company.description && (
                  <div className="text-muted-foreground max-w-xs truncate text-xs">
                    {company.description}
                  </div>
                )}
              </div>
            </Link>
          );
        },
      }),
      helper.accessor("taxId", {
        header: "Documento",
        cell: (info) => (
          <span className="text-muted-foreground tabular-nums">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      helper.display({
        id: "location",
        header: "Cidade",
        cell: (info) => {
          const company = info.row.original;
          return (
            <span className="text-muted-foreground">
              {[company.city, company.uf].filter(Boolean).join(", ") || "—"}
            </span>
          );
        },
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = statusLabels[info.getValue()] ?? {
            label: info.getValue(),
            variant: "outline" as const,
          };
          return <Badge variant={status.variant}>{status.label}</Badge>;
        },
      }),
      helper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const company = info.row.original;
          if (company.status !== "PENDING") return null;
          return (
            <div className="flex justify-end gap-2">
              <RejectCompanyDialog
                companyId={company.id}
                companyName={company.companyName}
              />
              <Button
                size="sm"
                disabled={approveCompany.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  approveCompany.mutate(company.id, {
                    onSuccess: () =>
                      toast.success("Contratante aprovado com sucesso!"),
                    onError: (error) =>
                      toast.error(
                        error instanceof ApiError
                          ? error.message
                          : "Não foi possível aprovar."
                      ),
                  });
                }}
              >
                <Check className="size-4" />
                Aprovar contratante
              </Button>
            </div>
          );
        },
      }),
    ],
    [approveCompany]
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Aprovação de Contratantes
        </h1>
        <p className="text-muted-foreground text-sm">
          Verifique e aprove ou rejeite novos cadastros de contratantes
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="all">
                Todas <Badge variant="secondary">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                Pendentes <Badge variant="secondary">{counts.PENDING}</Badge>
              </TabsTrigger>
              <TabsTrigger value="APPROVED">
                Aprovadas <Badge variant="secondary">{counts.APPROVED}</Badge>
              </TabsTrigger>
              <TabsTrigger value="REJECTED">
                Rejeitadas <Badge variant="secondary">{counts.REJECTED}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as CompanyType | "ALL")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="INDIVIDUAL">Pessoa Física</SelectItem>
            <SelectItem value="LEGAL_ENTITY">Empresa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Buscar contratante..."
          emptyMessage="Nenhum contratante encontrado."
          renderMobileCard={(company) => {
            const status = statusLabels[company.status] ?? {
              label: company.status,
              variant: "outline" as const,
            };
            return (
              <div className="bg-card flex flex-col gap-2 rounded-lg border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/company/${company.id}`}
                    className="flex min-w-0 items-center gap-2 hover:underline"
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage
                        src={company.profilePhotoUrl ?? undefined}
                        alt=""
                      />
                      <AvatarFallback>
                        {company.companyName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 font-medium break-words">
                      {company.companyName}
                    </span>
                  </Link>
                  <Badge variant={status.variant} className="shrink-0">
                    {status.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <CompanyTypeBadge type={company.type} />
                  <span className="text-muted-foreground tabular-nums">
                    {company.taxId ?? "—"}
                  </span>
                  <span className="text-muted-foreground">
                    {[company.city, company.uf].filter(Boolean).join(", ") ||
                      "—"}
                  </span>
                </div>
                {company.description && (
                  <p className="text-muted-foreground text-xs break-words">
                    {company.description}
                  </p>
                )}
                {company.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <RejectCompanyDialog
                      companyId={company.id}
                      companyName={company.companyName}
                    />
                    <Button
                      size="sm"
                      disabled={approveCompany.isPending}
                      onClick={() =>
                        approveCompany.mutate(company.id, {
                          onSuccess: () =>
                            toast.success("Contratante aprovado com sucesso!"),
                          onError: (error) =>
                            toast.error(
                              error instanceof ApiError
                                ? error.message
                                : "Não foi possível aprovar."
                            ),
                        })
                      }
                    >
                      <Check className="size-4" />
                      Aprovar contratante
                    </Button>
                  </div>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
