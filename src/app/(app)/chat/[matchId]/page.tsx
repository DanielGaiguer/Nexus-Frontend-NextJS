"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  Lock,
  User,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ProposalDetails } from "@/components/matches/proposal-details";
import { CompanyTypeBadge } from "@/components/shared/company-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatMatches, useChatMessages } from "@/hooks/queries/useChat";
import { useMatch } from "@/hooks/queries/useMatch";
import {
  useProjectProposals,
  useMyProposals,
} from "@/hooks/queries/useProposals";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatWindowPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const id = Number(matchId);
  const router = useRouter();

  const { data: chats } = useChatMatches();
  const summary = chats?.find((c) => c.matchId === id);
  const { data: messages, isLoading } = useChatMessages(id);
  const { data: match } = useMatch(id);

  // Chat só existe pra match confirmado -- otherPartyType diz quem é a OUTRA
  // parte, então o papel de quem está logado é sempre o oposto.
  const viewerIsCompany = summary?.otherPartyType === "PROFESSIONAL";
  const viewerIsProfessional = summary?.otherPartyType === "COMPANY";

  const { data: myProposals } = useMyProposals(viewerIsProfessional);
  const { data: projectProposals } = useProjectProposals(
    match?.project.id ?? 0,
    viewerIsCompany && match != null
  );

  const myProposal = viewerIsProfessional
    ? myProposals?.find((p) => p.projectId === match?.project.id)
    : undefined;
  // Empresa: a proposta específica desse profissional pra esse projeto --
  // abre num Dialog aqui mesmo (janela completa), não navega pra lista com
  // todas as propostas do projeto.
  const companyProposal = viewerIsCompany
    ? projectProposals?.find((p) => p.professionalId === match?.professional.id)
    : undefined;

  const profileHref = match
    ? viewerIsProfessional
      ? `/pro/companies/${match.project.companyId}`
      : `/company/professionals/${match.professional.id}`
    : undefined;
  const opportunityHref = match
    ? `/public/opportunity/${match.project.id}`
    : undefined;
  const proposalHref =
    match && viewerIsProfessional
      ? `/pro/opportunities/${match.project.id}/proposal`
      : undefined;

  const matchActive = summary?.matchActive !== false;
  const { isConnected, error, sendMessage } = useChatSocket(id, matchActive);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-6rem)] max-w-4xl flex-col overflow-hidden rounded-lg border">
      <div className="flex shrink-0 items-center gap-3 border-b p-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        {summary ? (
          <>
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={summary.otherPartyPhotoUrl ?? undefined}
                alt=""
              />
              <AvatarFallback>
                {summary.otherPartyName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="truncate text-sm font-semibold hover:underline"
                  >
                    {summary.otherPartyName}
                  </Link>
                ) : (
                  <div className="truncate text-sm font-semibold">
                    {summary.otherPartyName}
                  </div>
                )}
                {summary.otherPartyType === "COMPANY" && (
                  <CompanyTypeBadge type={summary.otherPartyCompanyType} />
                )}
              </div>
              {opportunityHref ? (
                <Link
                  href={opportunityHref}
                  className="text-muted-foreground block truncate text-xs hover:underline"
                >
                  {summary.projectTitle}
                </Link>
              ) : (
                <div className="text-muted-foreground truncate text-xs">
                  {summary.projectTitle}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {profileHref && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={profileHref}>
                    <User className="size-4" />
                    <span className="hidden sm:inline">Ver perfil</span>
                  </Link>
                </Button>
              )}
              {opportunityHref && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={opportunityHref}>
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">Ver oportunidade</span>
                  </Link>
                </Button>
              )}
              {proposalHref && myProposal && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={proposalHref}>
                    <FileText className="size-4" />
                    <span className="hidden sm:inline">Ver proposta</span>
                  </Link>
                </Button>
              )}
              {companyProposal && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <FileText className="size-4" />
                      <span className="hidden sm:inline">Ver proposta</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Proposta de {companyProposal.professionalName}
                      </DialogTitle>
                    </DialogHeader>
                    <ProposalDetails proposal={companyProposal} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </>
        ) : (
          <Skeleton className="h-9 w-40" />
        )}
      </div>

      {matchActive && !isConnected && (
        <div className="text-warning bg-warning/10 flex shrink-0 items-center gap-2 px-4 py-2 text-xs">
          <WifiOff className="size-3.5 shrink-0" />
          Conectando…
        </div>
      )}

      {matchActive &&
        summary?.daysUntilExpiration != null &&
        summary.daysUntilExpiration >= 0 &&
        summary.daysUntilExpiration <= 7 && (
          <div className="bg-warning/10 text-warning flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            Este chat encerra em {summary.daysUntilExpiration} dia(s).
          </div>
        )}

      {!matchActive && (
        <div className="bg-muted text-muted-foreground flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
          <Lock className="size-4 shrink-0" />
          Este chat foi encerrado. O histórico está disponível somente para
          leitura.
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
          <WifiOff className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div
        ref={scrollRef}
        className="thin-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-11 w-3/5 rounded-2xl ${i % 2 === 0 ? "self-start" : "self-end"}`}
            />
          ))}
        {!isLoading &&
          messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.senderType !== summary?.otherPartyType}
            />
          ))}
      </div>

      <ChatComposer
        disabled={!matchActive}
        canSend={isConnected}
        onSend={sendMessage}
      />
    </div>
  );
}
