/**
 * Gravação e upload da resposta em vídeo. Tudo o que é específico de MediaRecorder/Supabase vive
 * aqui, fora do componente.
 */

/**
 * Corte de duração no client. O backend NÃO consegue verificar duração -- isso exigiria abrir o
 * container do arquivo, dependência nova e desproporcional (decisão confirmada com o usuário).
 * O que ele garante é o teto de TAMANHO, medido no Supabase depois do upload.
 *
 * Então este limite é um proxy, não uma trava: 180s a ~1.6 Mbps (ver RECORDING_BITS_PER_SECOND)
 * dá ~36MB, confortavelmente abaixo dos 50MB do backend. Quem usar ferramenta própria consegue
 * subir um vídeo mais longo, desde que caiba no tamanho -- limitação conhecida e aceita.
 */
export const MAX_RECORDING_SECONDS = 180;

/** Fixado para a conta acima fechar. Sem isto o bitrate varia com a câmera e a mesma duração
 * produziria arquivos de tamanhos imprevisíveis. */
const RECORDING_BITS_PER_SECOND = 1_600_000;

/**
 * Preferência de codec, em ordem.
 *
 * MP4/H.264 primeiro DE PROPÓSITO: é o caso que quebra sem transcodificação. Chrome e Firefox
 * gravam WebM/VP8-VP9 por padrão, o Safari não reproduz WebM de forma confiável -- candidato
 * grava no Chrome, recrutador abre no Safari, vídeo não toca. Onde o browser souber gravar MP4,
 * grava MP4. VP8 vem antes de VP9 pelo mesmo motivo: decodifica em mais lugares.
 *
 * Não há transcodificação server-side nesta versão (limitação conhecida, documentada no
 * Passo 0). Onde só houver WebM, é WebM que sobe.
 */
const MIME_PREFERENCE = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  "video/mp4",
  'video/webm;codecs="vp8,opus"',
  "video/webm;codecs=vp8",
  'video/webm;codecs="vp9,opus"',
  "video/webm",
];

export interface RecordingFormat {
  /** Passado ao MediaRecorder -- inclui os codecs. */
  mimeType: string;
  /** Só o tipo base (`video/mp4`, `video/webm`) -- é o que o backend valida e o que vai no
   * Content-Type do PUT. */
  contentType: string;
}

/** `null` = este browser não sabe gravar em nenhum formato que o backend aceita. */
export function pickRecordingFormat(): RecordingFormat | null {
  if (typeof MediaRecorder === "undefined") return null;

  for (const mimeType of MIME_PREFERENCE) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType, contentType: mimeType.split(";")[0] };
    }
  }
  return null;
}

export function recorderOptions(format: RecordingFormat): MediaRecorderOptions {
  return {
    mimeType: format.mimeType,
    videoBitsPerSecond: RECORDING_BITS_PER_SECOND,
  };
}

/**
 * PUT direto no Supabase, na signed URL que o backend assinou.
 *
 * XHR e não fetch porque só XHR reporta progresso de UPLOAD -- e num arquivo de dezenas de MB,
 * uma barra parada é indistinguível de uma tela travada.
 */
export function uploadToSignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", contentType);
    // Regravar reaproveita o mesmo caminho de objeto quando o ticket é o mesmo.
    request.setRequestHeader("x-upsert", "true");

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      reject(
        new Error(
          `O armazenamento recusou o envio (HTTP ${request.status}). Tente novamente.`
        )
      );
    });

    request.addEventListener("error", () =>
      reject(new Error("Falha de rede ao enviar o vídeo. Tente novamente."))
    );
    request.addEventListener("abort", () =>
      reject(new Error("Envio do vídeo cancelado."))
    );

    request.send(blob);
  });
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
