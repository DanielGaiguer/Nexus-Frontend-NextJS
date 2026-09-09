import { useMutation, useQueryClient } from "@tanstack/react-query";

import { screeningAttemptKey } from "@/hooks/queries/useScreeningInvitations";
import { apiFetch } from "@/lib/api-client";
import type {
  ScreeningVideoConfirmRequestDTO,
  ScreeningVideoConsentDTO,
  ScreeningVideoUploadTicketDTO,
} from "@/types/screening-video";

/**
 * Vídeo assíncrono. O upload em si NÃO está aqui -- ele vai do browser direto pro Supabase (ver
 * uploadToSignedUrl em lib/screening-video). Estes hooks só falam com o nosso backend: pedir
 * consentimento, pedir a assinatura, e confirmar depois que o arquivo subiu.
 */

/** Registra o aceite de gravação de imagem e voz DESTA tentativa. Idempotente no backend -- a
 * data do aceite original nunca é reescrita. */
export function useAcceptVideoConsent(invitationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<ScreeningVideoConsentDTO>(
        `/api/screening-invitations/${invitationId}/video/consent`,
        { method: "POST" }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: screeningAttemptKey(invitationId),
      }),
  });
}

/** Pede a signed URL. Falha com 409 se o consentimento ainda não foi registrado. */
export function useVideoUploadTicket(invitationId: number) {
  return useMutation({
    mutationFn: ({
      questionId,
      contentType,
    }: {
      questionId: number;
      contentType: string;
    }) =>
      apiFetch<ScreeningVideoUploadTicketDTO>(
        `/api/screening-invitations/${invitationId}/video/upload-url` +
          `?questionId=${questionId}&contentType=${encodeURIComponent(contentType)}`,
        { method: "POST" }
      ),
  });
}

/**
 * Confirma o upload. É aqui que o backend mede o arquivo no Supabase e recusa se estourou o teto
 * (apagando o objeto). Só depois desta confirmação a resposta existe -- e é ela que faz a questão
 * contar como respondida no submit.
 */
export function useConfirmVideoUpload(invitationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ScreeningVideoConfirmRequestDTO) =>
      apiFetch<{ message: string }>(
        `/api/screening-invitations/${invitationId}/video/confirm`,
        { method: "POST", body }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: screeningAttemptKey(invitationId),
      }),
  });
}
