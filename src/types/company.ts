/** Espelha com.main.nexus.dto.CompanyProfileDTO. */
export interface CompanyProfileDTO {
  id: number;
  companyName: string;
  email: string;
  taxId: string | null;
  phone: string | null;
  city: string | null;
  uf: string | null;
  cep: string | null;
  description: string | null;
  reputation: number | null;
  latitude: number | null;
  longitude: number | null;
  /** String crua do enum CompanyStatus do backend (ex.: "PENDING", "APPROVED"). */
  status: string;
  profilePhotoUrl: string | null;
  linkedinUrl: string | null;
}
