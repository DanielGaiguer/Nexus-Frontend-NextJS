"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Building2, Eye, Shield, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/admin/data-table";
import { adminTableFeatures } from "@/components/admin/table-features";
import { ToggleUserDialog } from "@/components/admin/toggle-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers } from "@/hooks/queries/useAdminUsers";
import type { UserSummaryDTO } from "@/types/admin";

const typeBadge: Record<
  UserSummaryDTO["type"],
  { label: string; icon: typeof User }
> = {
  PROFESSIONAL: { label: "Professional", icon: User },
  COMPANY: { label: "Company", icon: Building2 },
  ADMIN: { label: "Admin", icon: Shield },
};

const helper = createColumnHelper<typeof adminTableFeatures, UserSummaryDTO>();

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const [type, setType] = useState<"all" | UserSummaryDTO["type"]>("all");

  const filtered = useMemo(() => {
    if (!users) return [];
    return type === "all" ? users : users.filter((u) => u.type === type);
  }, [users, type]);

  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "Nome",
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user.profilePhotoUrl ?? undefined} alt="" />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name}</span>
            </div>
          );
        },
      }),
      helper.accessor("email", {
        header: "E-mail",
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      helper.accessor("type", {
        header: "Tipo",
        cell: (info) => {
          const badge = typeBadge[info.getValue()];
          const Icon = badge.icon;
          return (
            <Badge variant="outline" className="gap-1">
              <Icon className="size-3" />
              {badge.label}
            </Badge>
          );
        },
      }),
      helper.accessor("active", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "outline"}>
            {info.getValue() ? "Ativo" : "Inativo"}
          </Badge>
        ),
      }),
      helper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => {
          const user = info.row.original;
          const profileHref =
            user.type === "PROFESSIONAL"
              ? `/admin/professional/${user.id}`
              : user.type === "COMPANY"
                ? `/admin/company/${user.id}`
                : null;
          return (
            <div className="flex items-center gap-2">
              {profileHref && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={profileHref}>
                    <Eye className="size-3.5" />
                    Ver perfil
                  </Link>
                </Button>
              )}
              <ToggleUserDialog
                userId={user.id}
                email={user.email}
                active={user.active}
              />
            </div>
          );
        },
      }),
    ],
    []
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gerenciamento de Usuários
        </h1>
        <p className="text-muted-foreground text-sm">
          {users?.length ?? 0} usuários cadastrados na plataforma
        </p>
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="PROFESSIONAL">Professional</TabsTrigger>
          <TabsTrigger value="COMPANY">Company</TabsTrigger>
          <TabsTrigger value="ADMIN">Admin</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Buscar por nome ou e-mail..."
          emptyMessage="Nenhum usuário encontrado."
        />
      )}
    </div>
  );
}
