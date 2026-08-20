import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CandidateComparisonRequestDTO,
  CandidateComparisonResponseDTO,
} from "@/types/comparison";

export function useCompareCandidates() {
  return useMutation({
    mutationFn: (request: CandidateComparisonRequestDTO) =>
      apiFetch<CandidateComparisonResponseDTO>("/api/comparison/candidates", {
        method: "POST",
        body: request,
      }),
  });
}
