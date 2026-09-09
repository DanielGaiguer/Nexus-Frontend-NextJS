"use client";

import {
  CheckCircle2,
  CircleStop,
  RotateCcw,
  Upload,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useConfirmVideoUpload,
  useVideoUploadTicket,
} from "@/hooks/mutations/useScreeningVideoMutations";
import { ApiError } from "@/lib/api-client";
import {
  MAX_RECORDING_SECONDS,
  formatSeconds,
  pickRecordingFormat,
  recorderOptions,
  uploadToSignedUrl,
  type RecordingFormat,
} from "@/lib/screening-video";

type Phase = "idle" | "recording" | "review" | "uploading" | "done";

/**
 * Gravação de UMA resposta em vídeo.
 *
 * O ciclo é gravar → revisar → enviar, e o candidato pode regravar quantas vezes quiser ANTES de
 * enviar: nada sobe pro servidor até ele apertar "Enviar vídeo". Depois de enviado, regravar
 * substitui o arquivo anterior (o backend apaga o antigo do bucket na hora).
 *
 * Este componente só é renderizado depois do consentimento de gravação -- a câmera nunca é pedida
 * antes disso (ver VideoConsentGate na tela de resposta).
 */
export function VideoAnswerRecorder({
  invitationId,
  questionId,
  alreadyUploaded,
  maxSizeBytes,
  onUploaded,
}: {
  invitationId: number;
  questionId: number;
  alreadyUploaded: boolean;
  maxSizeBytes: number;
  onUploaded: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(alreadyUploaded ? "done" : "idle");
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  // Detectado sob demanda, no clique de gravar -- nunca na montagem. `MediaRecorder` não existe
  // no servidor, então detectar durante a renderização daria divergência de hidratação, e
  // detectar num efeito só pra chamar setState provoca uma renderização em cascata à toa.
  // Consequência aceita: a mensagem de "navegador sem suporte" aparece depois do primeiro
  // clique, não antes.
  const formatRef = useRef<RecordingFormat | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bytesRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestTicket = useVideoUploadTicket(invitationId);
  const confirmUpload = useConfirmVideoUpload(invitationId);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // A câmera precisa ser desligada quando o componente sai de cena, senão o LED fica aceso e o
  // dispositivo segue capturando -- num componente que grava rosto e voz isso não é detalhe.
  useEffect(() => {
    return () => {
      clearTick();
      stopTracks();
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, [clearTick, stopTracks]);

  // Revoga a object URL do preview -- sem isso cada regravação vaza um blob na memória da aba.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function stopRecording() {
    clearTick();
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function startRecording() {
    const format = formatRef.current ?? pickRecordingFormat();
    if (!format) {
      setUnsupported(true);
      return;
    }
    formatRef.current = format;

    setRecordedBlob(null);
    setPreviewUrl(null);
    setProgress(0);
    setElapsed(0);
    chunksRef.current = [];
    bytesRef.current = 0;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
    } catch {
      toast.error(
        "Não foi possível acessar a câmera e o microfone. Verifique a permissão do navegador."
      );
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      await videoRef.current.play().catch(() => undefined);
    }

    const recorder = new MediaRecorder(stream, recorderOptions(format));
    recorderRef.current = recorder;

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size === 0) return;
      chunksRef.current.push(event.data);
      bytesRef.current += event.data.size;

      // Corte por TAMANHO, além do corte por tempo. É este que de fato protege o teto do
      // backend: a duração é só um proxy (bitrate varia com a câmera), o byte não.
      if (bytesRef.current >= maxSizeBytes * 0.9) {
        toast.info(
          "Limite de tamanho atingido — a gravação foi encerrada aqui."
        );
        stopRecording();
      }
    });

    recorder.addEventListener("stop", () => {
      clearTick();
      stopTracks();
      const blob = new Blob(chunksRef.current, { type: format.contentType });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setPhase("review");
    });

    // timeslice de 1s: sem ele o blob só materializa no stop, e o corte por tamanho acima nunca
    // teria como disparar durante a gravação.
    recorder.start(1000);
    setPhase("recording");

    tickRef.current = setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= MAX_RECORDING_SECONDS) {
          stopRecording();
          return MAX_RECORDING_SECONDS;
        }
        return next;
      });
    }, 1000);
  }

  async function upload() {
    const format = formatRef.current;
    if (!recordedBlob || !format) return;

    setPhase("uploading");
    setProgress(0);

    try {
      const ticket = await requestTicket.mutateAsync({
        questionId,
        contentType: format.contentType,
      });

      if (recordedBlob.size > ticket.maxSizeBytes) {
        // Barreira local antes de gastar o upload -- o backend recusaria depois de o arquivo
        // inteiro já ter subido.
        throw new Error(
          `O vídeo tem ${(recordedBlob.size / 1024 / 1024).toFixed(1)}MB e o limite é ${Math.floor(
            ticket.maxSizeBytes / 1024 / 1024
          )}MB. Grave um vídeo mais curto.`
        );
      }

      await uploadToSignedUrl(
        ticket.uploadUrl,
        recordedBlob,
        format.contentType,
        setProgress
      );

      await confirmUpload.mutateAsync({
        questionId,
        videoUrl: ticket.objectUrl,
        durationSeconds: elapsed || null,
      });

      setPhase("done");
      onUploaded();
      toast.success("Vídeo enviado.");
    } catch (error) {
      // Volta para "review": o blob continua na memória e o candidato tenta de novo sem
      // regravar. E, crucialmente, as OUTRAS respostas da etapa seguem intactas -- o vídeo é a
      // única resposta que sobe fora do submit, justamente pra que falhar aqui não derrube o
      // resto (ver ScreeningVideoService).
      setPhase("review");
      setProgress(0);
      toast.error(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Não foi possível enviar o vídeo. Tente novamente."
      );
    }
  }

  if (unsupported) {
    return (
      <p className="border-warning/40 bg-warning/10 text-foreground rounded-md border p-3 text-sm">
        Este navegador não suporta gravação de vídeo. Tente pelo Chrome, Edge,
        Firefox ou Safari atualizados — de preferência num computador.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* O elemento de vídeo serve aos dois momentos: espelho ao vivo enquanto grava, player do
          resultado na revisão. */}
      <div className="bg-muted overflow-hidden rounded-lg border">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          playsInline
          controls={phase === "review" || phase === "uploading"}
          src={
            phase === "review" || phase === "uploading"
              ? (previewUrl ?? undefined)
              : undefined
          }
        />
      </div>

      {phase === "recording" && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-destructive flex items-center gap-2 font-medium">
            <span className="bg-destructive size-2 animate-pulse rounded-full" />
            Gravando {formatSeconds(elapsed)} de{" "}
            {formatSeconds(MAX_RECORDING_SECONDS)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
          >
            <CircleStop className="size-4" />
            Parar
          </Button>
        </div>
      )}

      {phase === "uploading" && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-muted-foreground text-xs">
            Enviando vídeo… {progress}%
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(phase === "idle" || phase === "done") && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
          >
            {phase === "done" ? (
              <>
                <RotateCcw className="size-4" />
                Regravar
              </>
            ) : (
              <>
                <Video className="size-4" />
                Gravar resposta
              </>
            )}
          </Button>
        )}

        {phase === "review" && (
          <>
            <Button type="button" size="sm" onClick={upload}>
              <Upload className="size-4" />
              Enviar vídeo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startRecording}
            >
              <RotateCcw className="size-4" />
              Regravar
            </Button>
          </>
        )}
      </div>

      {phase === "done" && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="size-4 text-emerald-600" />
          Vídeo enviado. Você pode regravar até enviar as respostas da etapa.
        </p>
      )}

      {phase === "idle" && (
        <p className="text-muted-foreground text-xs">
          Até {formatSeconds(MAX_RECORDING_SECONDS)} de gravação. Nada é enviado
          enquanto você não confirmar — dá pra regravar quantas vezes quiser.
        </p>
      )}
    </div>
  );
}
