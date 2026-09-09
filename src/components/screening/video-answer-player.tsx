"use client";

import { Play, VideoOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useScreeningVideoPlayback } from "@/hooks/queries/useScreeningInvitations";
import { formatSeconds } from "@/lib/screening-video";

/**
 * Reprodução de uma resposta em vídeo.
 *
 * É um `<video controls>` puro apontando para a signed URL -- nada de player customizado. O
 * elemento nativo já faz seek por Range request contra o Supabase, que é justamente o que o
 * proxy do currículo (`byte[]` inteiro em memória, sem Range) não faria; foi por isso que o
 * Passo 0 descartou reaproveitar aquele caminho aqui.
 *
 * O link só é pedido quando alguém clica em assistir: ele vale ~5 minutos, então buscá-lo ao
 * carregar a tela geraria links para vídeos que ninguém abriu e que expirariam antes do clique.
 */
export function VideoAnswerPlayer({
  invitationId,
  questionId,
  hasVideo,
  durationSeconds,
}: {
  invitationId: number;
  questionId: number;
  hasVideo: boolean;
  durationSeconds: number | null;
}) {
  const [requested, setRequested] = useState(false);
  // O <video> falhou em carregar a fonte -- na prática, link vencido. Estado próprio porque o
  // react-query considera a busca do link um sucesso: quem falhou foi o browser, depois.
  const [failedToLoad, setFailedToLoad] = useState(false);
  const playback = useScreeningVideoPlayback(
    invitationId,
    questionId,
    requested
  );

  // hasVideo=false com duração preenchida = existiu um vídeo e o arquivo foi removido (exclusão
  // de conta do candidato, ver AccountDeletionService). A linha da resposta continua; o arquivo
  // não. Dizer isso é melhor do que a resposta simplesmente sumir da tela.
  if (!hasVideo) {
    return (
      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <VideoOff className="size-4" />
        {durationSeconds != null
          ? "O vídeo desta resposta foi removido do armazenamento."
          : "Nenhum vídeo foi enviado para esta pergunta."}
      </p>
    );
  }

  if (!requested) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRequested(true)}
        >
          <Play className="size-4" />
          Assistir resposta
        </Button>
        {durationSeconds != null && (
          <span className="text-muted-foreground text-xs">
            {formatSeconds(durationSeconds)} (aproximado)
          </span>
        )}
      </div>
    );
  }

  if (playback.isLoading) {
    return <Skeleton className="aspect-video w-full max-w-md" />;
  }

  // Duas formas de falhar, e as duas precisam terminar num botão: o link não veio (erro de rede
  // ou 4xx do backend) ou o link veio e VENCEU enquanto a pessoa olhava a tela. O segundo caso é
  // o mais provável -- a signed URL vale ~5 minutos e o card fica aberto muito mais que isso --
  // e sem tratamento explícito ele vira um player preto sem explicação nenhuma.
  if (playback.isError || !playback.data || failedToLoad) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          {failedToLoad
            ? "O link deste vídeo expirou."
            : "Não foi possível carregar o vídeo agora."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setFailedToLoad(false);
            playback.refetch();
          }}
        >
          {failedToLoad ? "Gerar novo link" : "Tentar de novo"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <video
        // key na URL: quando o link é renovado (o anterior expirou), o browser precisa recarregar
        // a fonte em vez de manter o elemento com a URL vencida.
        key={playback.data.url}
        src={playback.data.url}
        controls
        preload="metadata"
        playsInline
        onError={() => setFailedToLoad(true)}
        className="aspect-video w-full max-w-md rounded-lg border bg-black"
      />
      <p className="text-muted-foreground text-xs">
        Link temporário, válido por alguns minutos — se o vídeo parar de abrir,
        gere um novo.
      </p>
    </div>
  );
}
