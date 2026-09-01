/**
 * Espelha os DTOs da camada de comissão do backend
 * (com.main.nexus.dto.CommissionPolicyDTO / ContractorCommissionStatusDTO).
 * `percentage` / `currentPercentage` são BigDecimal serializados como número.
 * `updatedAt` chega como String ISO ("2026-08-28T12:00:00") ou null.
 *
 * Camada financeira, Prompt 1: só configuração + leitura. Nada é cobrado ainda.
 */

/** Espelha com.main.nexus.dto.CommissionPolicyDTO. */
export interface CommissionPolicyDTO {
  percentage: number;
  updatedAt: string | null;
  updatedByAdminEmail: string | null;
}

/** Corpo de PUT /api/admin/commission-policy. */
export interface UpdateCommissionPolicyBody {
  percentage: number;
}

/** Espelha com.main.nexus.dto.ContractorCommissionStatusDTO. */
export interface ContractorCommissionStatusDTO {
  freeHiresLimit: number;
  usedFreeHires: number;
  freeHiresRemaining: number;
  commissionApplies: boolean;
  currentPercentage: number;
}
