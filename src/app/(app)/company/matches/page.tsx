"use client";

import {
  Check,
  CircleCheck,
  Clock,
  Eye,
  HeartHandshake,
  History,
  Mail,
  MessageCircle,
  Send,
  Star,
  ThumbsDown,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { CandidateCard } from "@/components/company/candidate-card";
import { RejectInterestDialog } from "@/components/company/reject-interest-dialog";
import { MatchHistoryDialog } from "@/components/matches/match-history-dialog";
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
        {/* Mobile (< md): 3 linhas -- Confirmados sozinho em cima (é o mais
            importante), Recebidos+Enviados no meio, o resto embaixo. */}
        <div className="mb-[3px] flex flex-col gap-1.5 md:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="confirmed">
              Confirmados{" "}
              <Badge variant="secondary">{confirmed.data?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="received">
              Recebidos{" "}
              <Badge variant="secondary">{received.data?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviados{" "}
              <Badge variant="secondary">{sent.data?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="previous">
              Anteriores{" "}
              <Badge variant="secondary">{previous.data?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusados{" "}
              <Badge variant="secondary">{rejected.data?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop (>= md): uma linha só, Confirmados primeiro, depois
            Recebidos, Enviados, Anteriores, Recusados. */}
        <TabsList className="mb-[3px] hidden md:inline-flex">
          <TabsTrigger value="confirmed">
            Confirmados{" "}
            <Badge variant="secondary">{confirmed.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="received">
            Recebidos{" "}
            <Badge variant="secondary">{received.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviados <Badge variant="secondary">{sent.data?.length ?? 0}</Badge>
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
            emptyTitle="Nenhum projeto anterior"
            emptyDescription="Quando um match confirmado for encerrado, ele aparecerá aqui como histórico."
            emptyIcon={History}
            reviewedMatchIds={reviewedMatchIds}
            renderBadge={() => (
              <Badge variant="outline" className="text-muted-foreground w-fit">
                Match encerrado
              </Badge>
            )}
          />
        </TabsContent>
        <TabsContent value="rejected" className="flex flex-col gap-3">
          <PlainList
            matches={rejected.data}
            isLoading={rejected.isLoading}
            emptyTitle="Nenhum match recusado"
            emptyDescription="Convites e interesses recusados por você ou pelo profissional aparecerão aqui."
            emptyIcon={ThumbsDown}
            renderBadge={(match) => (
              <Badge variant="destructive" className="w-fit">
                {match.companyStatus !== "REJECTED" &&
                match.professionalStatus !== "REJECTED"
                  ? "Oportunidade encerrada"
                  : "Recusado"}
              </Badge>
            )}
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
        title="Nenhum convite recebido"
        description="Quando profissionais demonstrarem interesse em seus projetos, aparecerão aqui."
      />
    );
  }

  return matches.map((match) => (
    <CandidateCard
      key={match.id}
      match={match}
      actions={
        <>
          <Button size="sm" variant="ghost" asChild>
            <Link
              href={`/public/opportunity/${match.project.id}`}
              target="_blank"
            >
              <Eye className="size-4" />
              Ver oportunidade
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/professional/${match.professional.id}`}>
              <User className="size-4" />
              Ver profissional
            </Link>
          </Button>
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
        description="Convites que você enviar para profissionais no ranking dos projetos aparecerão aqui, até que respondam."
      />
    );
  }

  return matches.map((match) => (
    <CandidateCard
      key={match.id}
      match={match}
      badge={
        <Badge
          variant="outline"
          className="border-warning/30 text-warning w-fit"
        >
          <Clock className="size-3" />
          Aguardando resposta do profissional
        </Badge>
      }
      actions={
        <>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/opportunity/${match.project.id}`}>
              <Eye className="size-4" />
              Ver oportunidade
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/professional/${match.professional.id}`}>
              <User className="size-4" />
              Ver perfil completo
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={cancelMatch.isPending}
            onClick={() =>
              cancelMatch.mutate(match.id, {
                onSuccess: () => toast.success("Match cancelado."),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível cancelar."
                  ),
              })
            }
          >
            <X className="size-4" />
            Cancelar Match
          </Button>
        </>
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
        title="Nenhum match confirmado"
        description="Quando os matches forem confirmados, os dados de contato dos profissionais aparecerão aqui."
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

/** Dias restantes até completar 30 dias desde a confirmação — espelha
 * MatchDTO#getDaysRemaining() do app antigo (pode dar negativo). */
function daysRemaining(createdAt: string) {
  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return 30 - elapsedDays;
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
  const cancelMatch = useCompanyCancelMatch();
  const remaining = daysRemaining(match.createdAt);
  const isEnded = match.active === false || remaining <= 0;

  return (
    <CandidateCard
      match={match}
      showScore={false}
      badge={
        <div className="flex flex-col gap-1">
          <Badge className="bg-success/15 text-success w-fit">
            Match Confirmado
          </Badge>
          {isEnded ? (
            <Badge variant="outline" className="text-muted-foreground w-fit">
              Este match foi encerrado
            </Badge>
          ) : (
            remaining <= 15 && (
              <Badge
                variant="outline"
                className="border-warning/30 text-warning w-fit"
              >
                ⚠️ Este match expira em {remaining} dias
              </Badge>
            )
          )}
        </div>
      }
      actions={
        <>
          <div className="flex flex-col items-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealed(true)}
            >
              <Mail className="size-4" />
              Entrar em contato
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
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/professional/${match.professional.id}`}>
              <User className="size-4" />
              Ver perfil completo
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/opportunity/${match.project.id}`}>
              <Eye className="size-4" />
              Ver oportunidade
            </Link>
          </Button>
          <MatchHistoryDialog matchId={match.id} />
          <ChatAndReviewActions
            matchId={match.id}
            reviewedMatchIds={reviewedMatchIds}
          />
          {match.active !== false && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={cancelMatch.isPending}
              onClick={() =>
                cancelMatch.mutate(match.id, {
                  onSuccess: () => toast.success("Match cancelado."),
                  onError: (error) =>
                    toast.error(
                      error instanceof ApiError
                        ? error.message
                        : "Não foi possível cancelar."
                    ),
                })
              }
            >
              <X className="size-4" />
              Cancelar Match
            </Button>
          )}
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
  renderBadge,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon: typeof Mail;
  /** Só passado pra aba "anteriores" — a "recusados" não tem chat nem avaliação. */
  reviewedMatchIds?: number[];
  renderBadge?: (match: MatchResponseDTO) => ReactNode;
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
      badge={renderBadge?.(match)}
      actions={
        <>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/professional/${match.professional.id}`}>
              <User className="size-4" />
              Ver perfil completo
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/opportunity/${match.project.id}`}>
              <Eye className="size-4" />
              Ver oportunidade
            </Link>
          </Button>
          <MatchHistoryDialog matchId={match.id} />
          {reviewedMatchIds !== undefined && (
            <ChatAndReviewActions
              matchId={match.id}
              reviewedMatchIds={reviewedMatchIds}
            />
          )}
        </>
      }
    />
  ));
}
