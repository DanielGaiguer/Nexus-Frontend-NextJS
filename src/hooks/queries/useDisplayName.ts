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

/**
 * Foto de perfil do usuário logado pro avatar do shell (header + sidebar) —
 * mesma fonte do nome. `null` quando não há foto (ou é ADMIN, sem perfil): o
 * avatar cai no fallback padrão (inicial em círculo neutro), idêntico em
 * todo o sistema.
 */
export function useDisplayPhotoUrl(role: UserRole): string | null {
  const professional = useProfessionalProfile(role === "PROFESSIONAL");
  const company = useCompanyProfile(role === "COMPANY");

  if (role === "PROFESSIONAL")
    return professional.data?.profilePhotoUrl ?? null;
  if (role === "COMPANY") return company.data?.profilePhotoUrl ?? null;
  return null;
}
