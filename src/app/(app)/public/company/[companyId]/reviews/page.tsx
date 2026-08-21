"use client";

import { useParams } from "next/navigation";

import { ReviewsListView } from "@/components/reviews/reviews-list-view";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicCompany } from "@/hooks/queries/usePublicCompany";

export default function PublicCompanyReviewsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);
  const { data: company, isLoading } = usePublicCompany(id);

  if (isLoading || !company) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <ReviewsListView
      entityType="company"
      entityId={id}
      profileName={company.companyName}
    />
  );
}
