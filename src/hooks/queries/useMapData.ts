import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  MapCompanyDTO,
  MapOpportunityDTO,
  MapProfessionalDTO,
} from "@/types/map";

export interface MapFilters {
  city?: string;
}

function toQueryString(filters: MapFilters) {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const mapProfessionalsKey = (filters: MapFilters) =>
  ["map", "professionals", filters] as const;
export const mapCompaniesKey = (filters: MapFilters) =>
  ["map", "companies", filters] as const;
export const mapOpportunitiesKey = (filters: MapFilters) =>
  ["map", "opportunities", filters] as const;

export function useMapProfessionals(filters: MapFilters = {}) {
  return useQuery({
    queryKey: mapProfessionalsKey(filters),
    queryFn: () =>
      apiFetch<MapProfessionalDTO[]>(
        `/api/map/professionals${toQueryString(filters)}`
      ),
    staleTime: 60 * 1000,
  });
}

export function useMapCompanies(filters: MapFilters = {}) {
  return useQuery({
    queryKey: mapCompaniesKey(filters),
    queryFn: () =>
      apiFetch<MapCompanyDTO[]>(`/api/map/companies${toQueryString(filters)}`),
    staleTime: 60 * 1000,
  });
}

export function useMapOpportunities(filters: MapFilters = {}) {
  return useQuery({
    queryKey: mapOpportunitiesKey(filters),
    queryFn: () =>
      apiFetch<MapOpportunityDTO[]>(
        `/api/map/opportunities${toQueryString(filters)}`
      ),
    staleTime: 60 * 1000,
  });
}
