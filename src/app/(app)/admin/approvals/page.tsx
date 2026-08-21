"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { RejectCompanyDialog } from "@/components/admin/reject-company-dialog";
import { adminTableFeatures } from "@/components/admin/table-features";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApproveCompany } from "@/hooks/mutations/useAdminCompanyActions";
import { useAdminAllCompanies } from "@/hooks/queries/useAdminCompanies";
import { ApiError } from "@/lib/api-client";
import type { CompanyProfileDTO } from "@/types/company";

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
    return tab === "all"
      ? companies
      : companies.filter((c) => c.status === tab);
  }, [companies, tab]);

  const columns = useMemo(
    () => [
      helper.accessor("companyName", {
        header: "Empresa",
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
                <div className="font-medium">{company.companyName}</div>
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
        header: "CNPJ",
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
                      toast.success("Empresa aprovada com sucesso!"),
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
                Aprovar empresa
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
          Aprovação de Empresas
        </h1>
        <p className="text-muted-foreground text-sm">
          Verifique e aprove ou rejeite novos cadastros de empresas
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
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
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Buscar empresa..."
          emptyMessage="Nenhuma empresa encontrada."
        />
      )}
    </div>
  );
}
