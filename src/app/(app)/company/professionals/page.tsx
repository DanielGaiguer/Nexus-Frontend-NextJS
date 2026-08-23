"use client";

import { MapPin, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessionalDirectory } from "@/hooks/queries/useProfessionalDirectory";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

export default function CompanyProfessionalsPage() {
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

      <div className="max-w-sm space-y-1">
        <Label className="text-xs">Buscar</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
            href={`/company/professionals/${professional.id}?from=directory`}
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
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MapPin className="text-primary size-3" />
                      {professional.city}
                      {professional.uf ? `, ${professional.uf}` : ""}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1">
                    {professional.reputation != null ? (
                      <>
                        <Star className="fill-warning text-warning size-3.5" />
                        <span className="text-xs font-medium">
                          {professional.reputation.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Sem avaliações ainda
                      </span>
                    )}
                  </div>
                  {professional.experienceLevel && (
                    <Badge variant="secondary" className="mt-1 text-[11px]">
                      {experienceLabels[professional.experienceLevel] ??
                        professional.experienceLevel}
                    </Badge>
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
