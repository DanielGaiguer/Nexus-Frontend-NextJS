"use client";

import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessionalDirectory } from "@/hooks/queries/useProfessionalDirectory";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

/**
 * `pro-professionals.html` no app antigo — diretório de outros
 * profissionais, visto pela perspectiva de um profissional (networking).
 * Mesmo endpoint público (`/api/public/professionals`) que
 * `company/professionals` e `admin/professionals` já usam, por isso
 * reaproveita o mesmo `useProfessionalDirectory`.
 */
export default function ProProfessionalsPage() {
  const [search, setSearch] = useState("");
  const directory = useProfessionalDirectory(search);

  const professionals =
    directory.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profissionais</h1>
        <p className="text-muted-foreground text-sm">
          Explore os profissionais cadastrados na plataforma
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

      {!directory.isLoading && professionals.length === 0 && (
        <EmptyState icon={Users} title="Nenhum profissional encontrado" />
      )}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {professionals.map((professional) => (
          <Link
            key={professional.id}
            href={`/pro/professional/${professional.id}`}
            className="block min-w-0"
          >
            <Card className="hover:border-primary/40 h-full transition-colors">
              <CardContent className="flex items-start gap-3">
                <Avatar className="size-14 shrink-0">
                  <AvatarImage
                    src={professional.profilePhotoUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {professional.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {professional.name}
                  </div>
                  {professional.city && (
                    <div className="text-muted-foreground text-xs">
                      {professional.city}
                      {professional.uf ? `, ${professional.uf}` : ""}
                    </div>
                  )}
                  {professional.experienceLevel && (
                    <Badge variant="secondary" className="mt-1 text-[11px]">
                      {experienceLabels[professional.experienceLevel] ??
                        professional.experienceLevel}
                    </Badge>
                  )}
                  {professional.skills.length > 0 && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {professional.skills.join(", ")}
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
