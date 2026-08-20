import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewDisplayDTO } from "@/types/review";

export function ReviewCard({ review }: { review: ReviewDisplayDTO }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={review.reviewerPhotoUrl ?? undefined} alt="" />
            <AvatarFallback>
              {review.reviewerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="truncate font-medium">
                {review.reviewerName}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < review.rating
                        ? "fill-warning text-warning size-3.5"
                        : "text-muted-foreground/30 size-3.5"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="text-muted-foreground text-xs">
              {review.opportunityTitle} ·{" "}
              {new Date(review.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        {review.comment && (
          <p className="text-sm whitespace-pre-line">{review.comment}</p>
        )}

        {(review.positiveReasons.length > 0 ||
          review.negativeReasons.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {review.positiveReasons.map((reason) => (
              <Badge
                key={reason}
                variant="outline"
                className="border-success/40 bg-success/10 text-success text-[11px]"
              >
                {reason}
              </Badge>
            ))}
            {review.negativeReasons.map((reason) => (
              <Badge
                key={reason}
                variant="outline"
                className="border-destructive/40 bg-destructive/10 text-destructive text-[11px]"
              >
                {reason}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
