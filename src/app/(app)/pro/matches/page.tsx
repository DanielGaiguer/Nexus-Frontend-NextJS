"use client";

import {
  Building2,
  Check,
  CircleCheck,
  Clock,
  Eye,
  HeartHandshake,
  History,
  Mail,
  MessageCircle,
  Search,
  Send,
  Star,
  ThumbsDown,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { MatchHistoryDialog } from "@/components/matches/match-history-dialog";
import { MatchCard } from "@/components/professional/match-card";
import { RejectMatchDialog } from "@/components/professional/reject-match-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcceptMatch,
  useCancelMatch,
} from "@/hooks/mutations/useMatchActions";
import { useCompanyContact } from "@/hooks/queries/useCompanyContact";
import {
  useMatchInvites,
  useMatches,
  usePreviousMatches,
  useSentInterests,
} from "@/hooks/queries/useMatches";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { useReviewedMatchIds } from "@/hooks/queries/useReviews";
import { ApiError } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

/** Busca única pra todas as abas — por título do projeto ou nome da empresa. */
function filterBySearch<T extends MatchResponseDTO>(
  matches: T[] | undefined,
  term: string
): T[] | undefined {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return matches;
  return matches?.filter(
    (m) =>
      m.project.title.toLowerCase().includes(trimmed) ||
      m.project.companyName.toLowerCase().includes(trimmed)
  );
}

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

export default function MatchesPage() {
  const { data: profile } = useProfessionalProfile();
  const invites = useMatchInvites();
  const sent = useSentInterests();
  const allMatches = useMatches();
  const previous = usePreviousMatches();
  const { data: reviewedMatchIds } = useReviewedMatchIds("professional");
  const [search, setSearch] = useState("");

  // Confirmados = MATCHED e ainda ativo -- os já encerrados (active=false)
  // saem daqui e aparecem em "Anteriores" (usePreviousMatches já filtra por
  // active=false do lado do backend), não nos dois ao mesmo tempo.
  const confirmed = (allMatches.data ?? []).filter(
    (m) => m.status === "MATCHED" && m.active !== false
  );
  const rejected = (allMatches.data ?? []).filter(
    (m) => m.status === "REJECTED"
  );

  const filteredInvites = filterBySearch(invites.data, search);
  const filteredSent = filterBySearch(sent.data, search);
  const filteredConfirmed = filterBySearch(confirmed, search);
  const filteredPrevious = filterBySearch(previous.data, search);
  const filteredRejected = filterBySearch(rejected, search);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Matches</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie convites e veja seus matches confirmados
        </p>
      </div>

      <div className="max-w-sm space-y-1">
        <Label className="text-xs">Buscar</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por projeto ou empresa..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="invites">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="invites">
              Convites Pendentes{" "}
              <Badge variant="secondary">{filteredInvites?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Interesses Enviados{" "}
              <Badge variant="secondary">{filteredSent?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Matches Confirmados{" "}
              <Badge variant="secondary">
                {filteredConfirmed?.length ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="previous">
              Oportunidades Anteriores{" "}
              <Badge variant="secondary">{filteredPrevious?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusados{" "}
              <Badge variant="secondary">{filteredRejected?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="invites" className="flex flex-col gap-3">
          <InvitesList
            matches={filteredInvites}
            isLoading={invites.isLoading}
            mySkills={profile?.skills}
          />
        </TabsContent>

        <TabsContent value="sent" className="flex flex-col gap-3">
          <SentList
            matches={filteredSent}
            isLoading={sent.isLoading}
            mySkills={profile?.skills}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ConfirmedList
            matches={filteredConfirmed ?? []}
            isLoading={allMatches.isLoading}
            mySkills={profile?.skills}
            reviewedMatchIds={reviewedMatchIds}
          />
        </TabsContent>

        <TabsContent value="previous" className="flex flex-col gap-3">
          <PlainList
            matches={filteredPrevious}
            isLoading={previous.isLoading}
            mySkills={profile?.skills}
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
            matches={filteredRejected}
            isLoading={allMatches.isLoading}
            mySkills={profile?.skills}
            emptyTitle="Nenhum match recusado"
            emptyDescription="Convites recusados por você ou pela empresa aparecerão aqui."
            emptyIcon={ThumbsDown}
            renderBadge={(match) => (
              <Badge variant="destructive" className="w-fit">
                {match.companyStatus !== "REJECTED" &&
                match.professionalStatus !== "REJECTED"
                  ? "Oportunidade encerrada pela empresa"
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

function InvitesList({
  matches,
  isLoading,
  mySkills,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  mySkills: string[] | undefined;
}) {
  const acceptMatch = useAcceptMatch();

  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="Nenhum convite pendente"
        description="Quando empresas demonstrarem interesse, os convites aparecerão aqui."
      />
    );
  }

  return matches.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      mySkills={mySkills}
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
          {match.project.companyId != null && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/pro/companies/${match.project.companyId}`}>
                <Building2 className="size-4" />
                Ver empresa
              </Link>
            </Button>
          )}
          <RejectMatchDialog matchId={match.id} />
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
            Aceitar convite
          </Button>
        </>
      }
    />
  ));
}

function SentList({
  matches,
  isLoading,
  mySkills,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  mySkills: string[] | undefined;
}) {
  const cancelMatch = useCancelMatch();

  if (isLoading) return <Loading />;
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="Nenhum interesse enviado"
        description="Oportunidades em que você demonstrar interesse aparecerão aqui até que a empresa responda."
      />
    );
  }

  return matches.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      mySkills={mySkills}
      actions={
        <>
          <Badge
            variant="outline"
            className="border-warning/30 text-warning mr-auto"
          >
            <Clock className="size-3" />
            Aguardando resposta da empresa
          </Badge>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/public/opportunity/${match.project.id}`}>
              <Eye className="size-4" />
              Ver oportunidade
            </Link>
          </Button>
          {match.project.companyId != null && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/pro/companies/${match.project.companyId}`}>
                <Building2 className="size-4" />
                Ver empresa
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={cancelMatch.isPending}
            onClick={() =>
              cancelMatch.mutate(match.id, {
                onSuccess: () => toast.success("Interesse retirado."),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível retirar."
                  ),
              })
            }
          >
            <X className="size-4" />
            Cancelar interesse
          </Button>
        </>
      }
    />
  ));
}

function ConfirmedList({
  matches,
  isLoading,
  mySkills,
  reviewedMatchIds,
}: {
  matches: MatchResponseDTO[];
  isLoading: boolean;
  mySkills: string[] | undefined;
  reviewedMatchIds: number[] | undefined;
}) {
  if (isLoading) return <Loading />;
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="Nenhum match confirmado ainda"
        description="Aceite convites ou demonstre interesse em oportunidades para confirmar matches."
      />
    );
  }

  return matches.map((match) => (
    <ConfirmedMatchCard
      key={match.id}
      match={match}
      mySkills={mySkills}
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

function ConfirmedMatchCard({
  match,
  mySkills,
  reviewedMatchIds,
}: {
  match: MatchResponseDTO;
  mySkills: string[] | undefined;
  reviewedMatchIds: number[] | undefined;
}) {
  const [revealed, setRevealed] = useState(false);
  const contact = useCompanyContact(match.project.companyId, revealed);
  const cancelMatch = useCancelMatch();
  const remaining = daysRemaining(match.createdAt);
  const isEnded = match.active === false || remaining <= 0;

  return (
    <MatchCard
      match={match}
      mySkills={mySkills}
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
          {match.project.companyId != null && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/pro/companies/${match.project.companyId}`}>
                <Building2 className="size-4" />
                Ver perfil da empresa
              </Link>
            </Button>
          )}
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
  mySkills,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  reviewedMatchIds,
  renderBadge,
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  mySkills: string[] | undefined;
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
    <MatchCard
      key={match.id}
      match={match}
      mySkills={mySkills}
      showScore={false}
      badge={renderBadge?.(match)}
      actions={
        <>
          {match.project.companyId != null && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/pro/companies/${match.project.companyId}`}>
                <Building2 className="size-4" />
                Ver empresa
              </Link>
            </Button>
          )}
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
