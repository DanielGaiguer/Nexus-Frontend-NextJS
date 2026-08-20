"use client";

import { ReviewsListView } from "@/components/reviews/reviews-list-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";

export default function MyProfessionalReviewsPage() {
  const { data: profile, isLoading } = useProfessionalProfile();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <ReviewsListView
      entityType="professional"
      entityId={profile.id}
      profileName={profile.name}
      backHref="/pro/profile"
    />
  );
}
