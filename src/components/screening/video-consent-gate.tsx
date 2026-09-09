"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAcceptVideoConsent } from "@/hooks/mutations/useScreeningVideoMutations";
import { ApiError } from "@/lib/api-client";

/**
 * Porta de entrada da etapa de vídeo. Enquanto o aceite não estiver registrado, a câmera NÃO é
 * pedida -- o gravador nem é montado (ver a tela de resposta).
 *
 * Consentimento próprio, separado do aceite geral de cadastro: ali a pessoa concordou em usar a
 * plataforma; aqui ela está cedendo rosto e voz para UM processo seletivo, de UMA empresa. O
 * backend guarda o texto por extenso junto com a data, e não uma flag -- é o que permite provar
 * depois o que exatamente ela leu.
 */
export function VideoConsentGate({
  invitationId,
  consentText,
}: {
  invitationId: number;
  consentText: string;
}) {
  const [checked, setChecked] = useState(false);
  const acceptConsent = useAcceptVideoConsent(invitationId);

  function accept() {
    acceptConsent.mutate(undefined, {
      onError: (error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível registrar sua autorização."
        ),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="flex items-center gap-2 font-medium">
        <ShieldCheck className="size-4" />
        Autorização de gravação
      </p>

      <p className="text-muted-foreground text-sm">{consentText}</p>

      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
          className="mt-0.5"
          aria-label="Autorizo a gravação da minha imagem e da minha voz"
        />
        <span>Li e autorizo a gravação da minha imagem e da minha voz.</span>
      </label>

      <Button
        type="button"
        size="sm"
        disabled={!checked || acceptConsent.isPending}
        onClick={accept}
      >
        {acceptConsent.isPending
          ? "Registrando…"
          : "Autorizar e liberar a câmera"}
      </Button>

      <p className="text-muted-foreground text-xs">
        A câmera só é ativada depois desta autorização.
      </p>
    </div>
  );
}
