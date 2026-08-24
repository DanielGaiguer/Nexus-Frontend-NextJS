import { Star } from "lucide-react";
import Link from "next/link";

import { ReviewCard } from "@/components/reviews/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewCount, useReviewsTop5 } from "@/hooks/queries/useReviews";

/**
 * Card de preview (top 5 — maior nota, desempate por mais recente) usado em
 * qualquer perfil, próprio ou de terceiro, seja de empresa ou de profissional
 * — com link "Ver todas" pra página dedicada com a listagem completa.
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
  const top5 = useReviewsTop5(entityType, entityId);

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
        {top5.isLoading && <Skeleton className="h-24" />}
        {!top5.isLoading && (!top5.data || top5.data.length === 0) && (
          <p className="text-muted-foreground text-sm">
            Nenhuma avaliação ainda.
          </p>
        )}
        {top5.data?.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </CardContent>
    </Card>
  );
}
