"use client";

import { useParams } from "next/navigation";

import { ReviewsListView } from "@/components/reviews/reviews-list-view";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";

export default function PublicProfessionalReviewsPage() {
  const { professionalId } = useParams<{ professionalId: string }>();
  const id = Number(professionalId);
  const { data: professional, isLoading } = usePublicProfessional(id);

  if (isLoading || !professional) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <ReviewsListView
      entityType="professional"
      entityId={id}
      profileName={professional.name}
      backHref={`/company/professionals/${id}`}
    />
  );
}
