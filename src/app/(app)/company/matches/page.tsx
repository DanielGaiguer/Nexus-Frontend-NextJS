"use client";

import {
  Check,
  CircleCheck,
  HeartHandshake,
  History,
  Mail,
  MessageCircle,
  Send,
  Star,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { CandidateCard } from "@/components/company/candidate-card";
import { RejectInterestDialog } from "@/components/company/reject-interest-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCompanyAcceptMatch,
  useCompanyCancelMatch,
} from "@/hooks/mutations/useCompanyMatchActions";
import {
  useConfirmedCompanyMatches,
  usePreviousCompanyMatches,
  useReceivedInterests,
  useRejectedCompanyMatches,
  useSentInvites,
} from "@/hooks/queries/useCompanyMatches";
import { useProfessionalContact } from "@/hooks/queries/useProfessionalContact";
import { useReviewedMatchIds } from "@/hooks/queries/useReviews";
import { ApiError } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

function ChatAndReviewActions({
  matchId,
  reviewedMatchIds,
}: {
  matchId: number;
  reviewedMatchIds: number[] | undefined;
}) {
  const reviewed = reviewedMatchIds?.includes(matchId) ?? false;
  return (
    <>
      <Button size="sm" variant="outline" asChild>
        <Link href={`/chat/${matchId}`}>
          <MessageCircle className="size-4" />
          Chat
        </Link>
      </Button>
      {reviewed ? (
        <Button size="sm" variant="ghost" disabled>
          <CircleCheck className="size-4" />
          Avaliado
        </Button>
      ) : (
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/matches/${matchId}/review`}>
            <Star className="size-4" />
            Avaliar
          </Link>
        </Button>
      )}
    </>
  );
}

export default function CompanyMatchesPage() {
  const received = useReceivedInterests();
  const sent = useSentInvites();
  const confirmed = useConfirmedCompanyMatches();
  const rejected = useRejectedCompanyMatches();
  const previous = usePreviousCompanyMatches();
  const { data: reviewedMatchIds } = useReviewedMatchIds("company");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie interesses de candidatos e veja seus matches confirmados
        </p>
      </div>

      <Tabs defaultValue="received">
        <TabsList className="flex-wrap">
          <TabsTrigger value="received">
            Recebidos{" "}
            <Badge variant="secondary">{received.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Convites enviados{" "}
            <Badge variant="secondary">{sent.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmados{" "}
            <Badge variant="secondary">{confirmed.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="previous">
            Anteriores{" "}
            <Badge variant="secondary">{previous.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Recusados{" "}
            <Badge variant="secondary">{rejected.data?.length ?? 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="flex flex-col gap-3">
          <ReceivedList
            matches={received.data}
            isLoading={received.isLoading}
          />
        </TabsContent>
        <TabsContent value="sent" className="flex flex-col gap-3">
          <SentList matches={sent.data} isLoading={sent.isLoading} />
        </TabsContent>
        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ConfirmedList
            matches={confirmed.data}
            isLoading={confirmed.isLoading}
            reviewedMatchIds={reviewedMatchIds}
          />
        </TabsContent>
        <TabsContent value="previous" className="flex flex-col gap-3">
          <PlainList
            matches={previous.data}
            isLoading={previous.isLoading}
            emptyTitle="Nenhuma oportunidade anterior"
            emptyDescription="Matches confirmados que já se encerraram aparecem aqui."
            emptyIcon={History}
            reviewedMatchIds={reviewedMatchIds}
          />
        </TabsContent>
        <TabsContent value="rejected" className="flex flex-col gap-3">
          <PlainList
            matches={rejected.data}
            isLoading={rejected.isLoading}
            emptyTitle="Nenhum match recusado"
            emptyIcon={ThumbsDown}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  );
}

function ReceivedList({
  matches,
  isLoading,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
}) {
  const acceptMatch = useCompanyAcceptMatch();

  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="Nenhum interesse recebido"
        description="Quando profissionais demonstrarem interesse nas suas vagas, eles aparecem aqui."
      />
    );
  }

  return matches.map((match) => (
    <CandidateCard
      key={match.id}
      match={match}
      actions={
        <>
          <RejectInterestDialog matchId={match.id} />
          <Button
            size="sm"
            disabled={acceptMatch.isPending}
            onClick={() =>
              acceptMatch.mutate(match.id, {
                onSuccess: () =>
                  toast.success("Match confirmado! Contato liberado."),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível aceitar."
                  ),
              })
            }
          >
            <Check className="size-4" />
            Aceitar
          </Button>
        </>
      }
    />
  ));
}

function SentList({
  matches,
  isLoading,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
}) {
  const cancelMatch = useCompanyCancelMatch();

  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="Nenhum convite enviado"
        description="Convites enviados a partir do ranking de um projeto aparecem aqui até o profissional responder."
      />
    );
  }

  return matches.map((match) => (
    <CandidateCard
      key={match.id}
      match={match}
      actions={
        <Button
          size="sm"
          variant="outline"
          disabled={cancelMatch.isPending}
          onClick={() =>
            cancelMatch.mutate(match.id, {
              onSuccess: () => toast.success("Convite retirado."),
              onError: (error) =>
                toast.error(
                  error instanceof ApiError
                    ? error.message
                    : "Não foi possível retirar."
                ),
            })
          }
        >
          Retirar convite
        </Button>
      }
    />
  ));
}

function ConfirmedList({
  matches,
  isLoading,
  reviewedMatchIds,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  reviewedMatchIds: number[] | undefined;
}) {
  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="Nenhum match confirmado ainda"
        description="Aceite um interesse ou tenha seu convite aceito pelo profissional pra ver os contatos aqui."
      />
    );
  }

  return matches.map((match) => (
    <ConfirmedCandidateCard
      key={match.id}
      match={match}
      reviewedMatchIds={reviewedMatchIds}
    />
  ));
}

function ConfirmedCandidateCard({
  match,
  reviewedMatchIds,
}: {
  match: MatchResponseDTO;
  reviewedMatchIds: number[] | undefined;
}) {
  const [revealed, setRevealed] = useState(false);
  const contact = useProfessionalContact(match.professional.id, revealed);

  return (
    <CandidateCard
      match={match}
      showScore={false}
      actions={
        <>
          <div className="flex flex-col items-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealed(true)}
            >
              <Mail className="size-4" />
              Ver contato
            </Button>
            {revealed && contact.isLoading && (
              <span className="text-muted-foreground text-xs">Carregando…</span>
            )}
            {revealed && contact.data && (
              <div className="text-muted-foreground text-right text-xs">
                <div>{contact.data.email}</div>
                {contact.data.phone && <div>{contact.data.phone}</div>}
              </div>
            )}
            {revealed && contact.isError && (
              <span className="text-destructive text-xs">
                Não foi possível carregar o contato.
              </span>
            )}
          </div>
          <ChatAndReviewActions
            matchId={match.id}
            reviewedMatchIds={reviewedMatchIds}
          />
        </>
      }
    />
  );
}

function PlainList({
  matches,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  reviewedMatchIds,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon: typeof Mail;
  /** Só passado pra aba "anteriores" — a "recusados" não tem chat nem avaliação. */
  reviewedMatchIds?: number[];
}) {
  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return matches.map((match) => (
    <CandidateCard
      key={match.id}
      match={match}
      showScore={false}
      actions={
        reviewedMatchIds !== undefined ? (
          <ChatAndReviewActions
            matchId={match.id}
            reviewedMatchIds={reviewedMatchIds}
          />
        ) : undefined
      }
    />
  ));
}
