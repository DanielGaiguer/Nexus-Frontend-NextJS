"use client";

import { Ban, Pause, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelCustomPortal,
  useReactivateCustomPortal,
  useSuspendCustomPortal,
} from "@/hooks/mutations/useAdminCustomPortalActions";
import { ApiError } from "@/lib/api-client";

type Action = "suspend" | "reactivate" | "cancel";

const COPY: Record<
  Action,
  {
    trigger: string;
    icon: typeof Pause;
    title: string;
    description: string;
    confirm: string;
    pending: string;
    success: string;
    destructive: boolean;
    noteRequired: boolean;
  }
> = {
  suspend: {
    trigger: "Suspender",
    icon: Pause,
    title: "Suspender plataforma personalizada",
    description:
      "A página pública fica indisponível até a reativação. O cadastro normal do contratante no Nexus não é afetado.",
    confirm: "Suspender",
    pending: "Suspendendo…",
    success: "Plataforma suspensa.",
    destructive: true,
    noteRequired: false,
  },
  reactivate: {
    trigger: "Reativar",
    icon: Play,
    title: "Reativar plataforma personalizada",
    description: "A plataforma volta a ficar ativa imediatamente.",
    confirm: "Reativar",
    pending: "Reativando…",
    success: "Plataforma reativada.",
    destructive: false,
    noteRequired: false,
  },
  cancel: {
    trigger: "Cancelar",
    icon: Ban,
    title: "Cancelar plataforma personalizada",
    description:
      "Encerra a plataforma em definitivo (não pode ser reativada). O cadastro normal do contratante no Nexus não é afetado.",
    confirm: "Cancelar plataforma",
    pending: "Cancelando…",
    success: "Plataforma cancelada.",
    destructive: true,
    noteRequired: false,
  },
};

export function CustomPortalStatusDialog({
  portalId,
  action,
  companyName,
  open: openProp,
  onOpenChange,
  hideTrigger,
}: {
  portalId: number;
  action: Action;
  companyName: string;
  /** Modo controlado: quando definido, o estado de abertura vem do pai. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Esconde o botão-gatilho padrão (usar quando o gatilho é externo, ex.: item de menu). */
  hideTrigger?: boolean;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    setOpenState(next);
  };
  const [note, setNote] = useState("");
  const copy = COPY[action];

  const suspend = useSuspendCustomPortal();
  const reactivate = useReactivateCustomPortal();
  const cancel = useCancelCustomPortal();
  const mutation =
    action === "suspend"
      ? suspend
      : action === "reactivate"
        ? reactivate
        : cancel;

  function handleOpenChange(next: boolean) {
    setNote("");
    setOpen(next);
  }

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    mutation.mutate(
      { portalId, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(copy.success);
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível concluir a ação."
          ),
      }
    );
  }

  const Icon = copy.icon;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={copy.destructive ? "text-destructive" : undefined}
          >
            <Icon className="size-4" />
            {copy.trigger}
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {copy.description} Contratante: <strong>{companyName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <label htmlFor="cp-status-note" className="text-sm font-medium">
            Observação (opcional)
          </label>
          <Textarea
            id="cp-status-note"
            rows={2}
            placeholder="Ex.: inadimplência — 2 faturas em aberto"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className={
              copy.destructive
                ? "bg-destructive hover:bg-destructive/90"
                : undefined
            }
          >
            {mutation.isPending ? copy.pending : copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
