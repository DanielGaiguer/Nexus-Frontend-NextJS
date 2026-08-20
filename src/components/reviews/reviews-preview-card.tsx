import { Star } from "lucide-react";
import Link from "next/link";

import { ReviewCard } from "@/components/reviews/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewCount, useReviewsTop3 } from "@/hooks/queries/useReviews";

/**
 * Card de preview (top 3) usado em qualquer perfil — próprio ou de terceiro
 * — com link pra página dedicada. Espelha o `#reviews-preview-mount` do app
 * antigo (populado via fetch de `/app-api/reviews/{type}/{id}/top3`).
 */
export function ReviewsPreviewCard({
  entityType,
  entityId,
  viewAllHref,
}: {
  entityType: "professional" | "company";
  entityId: number | undefined;
  viewAllHref: string;
}) {
  const count = useReviewCount(entityType, entityId);
  const top3 = useReviewsTop3(entityType, entityId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Star className="text-warning size-4" />
          Avaliações
          {count.data != null && count.data > 0 && (
            <span className="text-muted-foreground font-normal">
              ({count.data})
            </span>
          )}
        </CardTitle>
        {count.data != null && count.data > 0 && (
          <Link
            href={viewAllHref}
            className="text-primary text-xs font-semibold hover:underline"
          >
            Ver todas
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {top3.isLoading && <Skeleton className="h-24" />}
        {!top3.isLoading && (!top3.data || top3.data.length === 0) && (
          <p className="text-muted-foreground text-sm">
            Nenhuma avaliação ainda.
          </p>
        )}
        {top3.data?.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </CardContent>
    </Card>
  );
}
