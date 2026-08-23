"use client";

import { ArrowLeft, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReviewCard } from "@/components/reviews/review-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewsAll } from "@/hooks/queries/useReviews";
import { cn } from "@/lib/utils";

const ratingFilters = [null, 5, 4, 3, 2, 1] as const;

/**
 * Conteúdo compartilhado de matches/review.html + public/professional-reviews.html
 * + public/company-reviews.html — mesma tela renderiza a listagem completa de
 * avaliações de um profissional ou de uma empresa, seja vista por terceiros
 * (/public/{type}/{id}/reviews) ou pelo próprio dono (/pro/reviews, /company/reviews).
 */
export function ReviewsListView({
  entityType,
  entityId,
  profileName,
}: {
  entityType: "professional" | "company";
  entityId: number;
  profileName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const { data, isLoading, isFetching } = useReviewsAll(
    entityType,
    entityId,
    rating
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <p className="text-muted-foreground mb-1 text-xs">
          Perfil &rarr; Avaliações de {profileName}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Avaliações de {profileName}
        </h1>
        {data && (
          <p className="text-muted-foreground text-sm">
            {data.totalReviews} avaliação{data.totalReviews !== 1 ? "ões" : ""}{" "}
            · média {data.averageRating.toFixed(1)}{" "}
            <Star className="fill-warning text-warning inline size-3.5" />
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Filtrar por nota</Label>
        <div className="flex flex-wrap gap-2">
          {ratingFilters.map((value) => (
            <Button
              key={value ?? "all"}
              size="sm"
              variant={rating === value ? "default" : "outline"}
              className={
                rating === value
                  ? // Mesmo bg-primary de sempre é agressivo demais aqui (cinco
                    // desses lado a lado) — escurece e satura menos, sem mexer
                    // no --primary global usado no resto do app.
                    "bg-[color-mix(in_srgb,var(--primary)_70%,black)] hover:bg-[color-mix(in_srgb,var(--primary)_60%,black)]"
                  : undefined
              }
              onClick={() => setRating(value)}
            >
              {value == null ? (
                "Todas"
              ) : (
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: value }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        rating === value
                          ? "fill-primary-foreground text-primary-foreground"
                          : "fill-muted-foreground/60 text-muted-foreground/60"
                      )}
                    />
                  ))}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {!isLoading && data && data.reviews.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nenhuma avaliação encontrada para este filtro.
        </p>
      )}

      <div
        className={cn(
          "flex flex-col gap-3 transition-opacity",
          // Troca de filtro com dados antigos ainda na tela (placeholderData)
          // — esmaece um pouco enquanto o novo filtro carrega em segundo
          // plano, em vez de trocar pra esqueleto (o que causava o "pulo").
          isFetching && "opacity-60"
        )}
      >
        {data?.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
