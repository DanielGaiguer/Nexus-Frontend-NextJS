import { proxyToBackend } from "@/lib/route-handlers";
import type { PendingReviewDTO } from "@/types/review";

export async function GET() {
  return proxyToBackend<PendingReviewDTO>("/api/reviews/pending/professional");
}
