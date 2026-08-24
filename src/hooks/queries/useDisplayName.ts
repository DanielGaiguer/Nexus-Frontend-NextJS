import { useCompanyProfile } from "@/hooks/queries/useCompanyProfile";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import type { UserRole } from "@/types/auth";

/**
 * Nome de exibição pro header/sidebar — busca o perfil certo conforme o
 * papel (o JWT não carrega o nome, só id/email/role, ver TokenService).
 * ADMIN não tem perfil próprio nesta fatia, cai no fallback.
 */
export function useDisplayName(role: UserRole): string {
  const professional = useProfessionalProfile(role === "PROFESSIONAL");
  const company = useCompanyProfile(role === "COMPANY");

  if (role === "PROFESSIONAL") return professional.data?.name ?? "Profissional";
  if (role === "COMPANY") return company.data?.companyName ?? "Contratante";
  return "Administrador";
}
