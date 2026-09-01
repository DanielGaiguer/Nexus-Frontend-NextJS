"use client";

import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOpenSupportTicket } from "@/hooks/mutations/useSupportActions";
import { ApiError } from "@/lib/api-client";

export function OpenSupportTicketDialog() {
  const router = useRouter();
  const openTicket = useOpenSupportTicket();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function reset() {
    setSubject("");
    setMessage("");
  }

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Descreva o motivo do contato.");
      return;
    }
    openTicket.mutate(
      { subject: subject.trim() || null, message: trimmed },
      {
        onSuccess: (conv) => {
          toast.success(
            "Chamado aberto. O suporte do Nexus vai responder por aqui."
          );
          setDialogOpen(false);
          reset();
          router.push(`/support/${conv.id}`);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível abrir o chamado."
          ),
      }
    );
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setDialogOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <MessageSquarePlus className="size-4" />
          Abrir chamado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir chamado de suporte</DialogTitle>
          <DialogDescription>
            Descreva o que está acontecendo. O suporte do Nexus responde nesta
            mesma aba.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">Assunto (opcional)</Label>
            <Input
              id="ticket-subject"
              maxLength={200}
              placeholder="Ex.: Cobrança de comissão que não reconheço"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ticket-message">Mensagem</Label>
            <Textarea
              id="ticket-message"
              rows={4}
              maxLength={2000}
              placeholder="Conte os detalhes: o que você tentou fazer, o que aconteceu, prints se tiver…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={message.trim() === "" || openTicket.isPending}
            onClick={handleSubmit}
          >
            {openTicket.isPending ? "Abrindo…" : "Abrir chamado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
