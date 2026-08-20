"use client";

import { ReviewsListView } from "@/components/reviews/reviews-list-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/queries/useCompanyProfile";

export default function MyCompanyReviewsPage() {
  const { data: profile, isLoading } = useCompanyProfile();

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <ReviewsListView
      entityType="company"
      entityId={profile.id}
      profileName={profile.companyName}
      backHref="/company/profile"
    />
  );
}
