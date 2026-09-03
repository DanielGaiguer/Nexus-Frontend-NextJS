/**
 * Log de auditoria de acesso administrativo a dado pessoal (LGPD).
 * Espelha com.main.nexus.dto.DataAccessLog(Page)DTO.
 */

export interface DataAccessLogDTO {
  id: number;
  adminUserId: number | null;
  adminEmail: string | null;
  targetUserId: number | null;
  targetUserEmail: string | null;
  targetType: string | null;
  targetEntityId: number | null;
  action: string;
  httpMethod: string | null;
  endpoint: string | null;
  at: string;
}

export interface DataAccessLogPageDTO {
  content: DataAccessLogDTO[];
  totalElements: number;
  page: number;
  size: number;
  hasMore: boolean;
}

export interface DataAccessLogFilters {
  adminUserId?: number;
  targetUserId?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  size?: number;
}
