/**
 * Resposta em vídeo assíncrona. Espelha com.main.nexus.dto.ScreeningVideo*.
 *
 * O arquivo NUNCA passa pelo nosso backend: o Spring assina, o browser sobe direto pro Supabase
 * (bucket privado) e volta pra confirmar. Assistir também é sempre por link assinado de curta
 * validade, gerado sob guard.
 */

/** Autorização de upload de UM vídeo, já depois dos guards (dono da tentativa, prazo aberto,
 * consentimento de gravação registrado). */
export interface ScreeningVideoUploadTicketDTO {
  questionId: number;
  /** URL absoluta do Supabase, pronta pro PUT do arquivo. */
  uploadUrl: string;
  token: string | null;
  /** Identifica o objeto na confirmação. Não abre nada sozinho -- o bucket é privado. */
  objectUrl: string;
  maxSizeBytes: number;
  expiresInSeconds: number;
}

/** Confirmação pós-upload. `durationSeconds` é informativo e não é verificado pelo backend --
 * ele só garante o teto de TAMANHO, medindo o arquivo no próprio Supabase. */
export interface ScreeningVideoConfirmRequestDTO {
  questionId: number;
  videoUrl: string;
  durationSeconds: number | null;
}

/** Link de reprodução assinado, de curta validade. */
export interface ScreeningVideoPlaybackDTO {
  questionId: number;
  url: string;
  expiresInSeconds: number;
  durationSeconds: number | null;
}

/** Estado do consentimento de gravação DESTA tentativa -- separado do consentimento geral de
 * cadastro (UserConsent): ceder imagem e voz para um processo seletivo é outra finalidade. */
export interface ScreeningVideoConsentDTO {
  invitationId: number;
  accepted: boolean;
  acceptedAt: string | null;
  text: string;
}
