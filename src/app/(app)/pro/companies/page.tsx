"use client";

import { Building2, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDirectory } from "@/hooks/queries/useCompanyDirectory";

export default function CompaniesDirectoryPage() {
  const [search, setSearch] = useState("");
  const directory = useCompanyDirectory(search);

  const companies = directory.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground text-sm">
          Explore as empresas cadastradas na plataforma
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nome..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {directory.isLoading && (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!directory.isLoading && companies.length === 0 && (
        <EmptyState icon={Building2} title="Nenhuma empresa encontrada" />
      )}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/pro/companies/${company.id}`}
            className="block min-w-0"
          >
            <Card className="hover:border-primary/40 h-full transition-colors">
              <CardContent className="flex items-start gap-3">
                <Avatar className="size-14 shrink-0 rounded-xl">
                  <AvatarImage
                    src={company.profilePhotoUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback className="rounded-xl">
                    {company.companyName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {company.companyName}
                  </div>
                  {company.city && (
                    <div className="text-muted-foreground text-xs">
                      {company.city}
                      {company.uf ? `, ${company.uf}` : ""}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1">
                    {company.reputation != null ? (
                      <>
                        <Star className="fill-warning text-warning size-3.5" />
                        <span className="text-xs font-medium">
                          {company.reputation.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Sem avaliações ainda
                      </span>
                    )}
                  </div>
                  {company.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {company.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {directory.hasNextPage && (
        <Button
          variant="outline"
          onClick={() => directory.fetchNextPage()}
          disabled={directory.isFetchingNextPage}
          className="self-center"
        >
          {directory.isFetchingNextPage ? "Carregando…" : "Carregar mais"}
        </Button>
      )}
    </div>
  );
}
