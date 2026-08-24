"use client";

import {
  Check,
  CircleCheck,
  Eye,
  HeartHandshake,
  History,
  Mail,
  MessageCircle,
  Search,
  Send,
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
import { AcceptedProposalPanel } from "@/components/matches/accepted-proposal-panel";
import { ContactDialog } from "@/components/matches/contact-dialog";
import { MatchHistoryDialog } from "@/components/matches/match-history-dialog";
import { MatchReviewDialog } from "@/components/matches/match-review-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const scoreOptions = [
  { value: "0", label: "Qualquer score" },
  { value: "90", label: "Acima de 90%" },
  { value: "80", label: "Acima de 80%" },
  { value: "70", label: "Acima de 70%" },
  { value: "60", label: "Acima de 60%" },
  { value: "50", label: "Acima de 50%" },
];

/** Busca + score mínimo, únicos pra todas as abas — busca por título do
 * projeto ou nome do candidato; score compara o final score arredondado do
 * match (mesmo valor mostrado no ScoreRing dos cards). */
function filterMatches<T extends MatchResponseDTO>(
  matches: T[] | undefined,
  term: string,
  minScore: number
): T[] | undefined {
  const trimmed = term.trim().toLowerCase();
  return matches?.filter((m) => {
    if (trimmed) {
      const matchesSearch =
        m.project.title.toLowerCase().includes(trimmed) ||
        m.professional.name.toLowerCase().includes(trimmed);
      if (!matchesSearch) return false;
    }
    if (minScore > 0) {
      const score = m.scoreBreakdown
        ? Math.round(m.scoreBreakdown.finalScore)
        : null;
      if (score == null || score < minScore) return false;
    }
    return true;
  });
}

function ChatAndReviewActions({
  matchId,
  projectTitle,
  reviewedMatchIds,
}: {
  matchId: number;
  projectTitle: string;
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
        <MatchReviewDialog
          matchId={matchId}
          authorType="COMPANY"
          projectTitle={projectTitle}
        />
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
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);

  const filteredReceived = filterMatches(received.data, search, minScore);
  const filteredSent = filterMatches(sent.data, search, minScore);
  const filteredConfirmed = filterMatches(confirmed.data, search, minScore);
  const filteredPrevious = filterMatches(previous.data, search, minScore);
  const filteredRejected = filterMatches(rejected.data, search, minScore);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie interesses de candidatos e veja seus matches confirmados
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="max-w-sm flex-1 space-y-1">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por projeto ou profissional..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-44 space-y-1">
          <Label className="text-xs">Score</Label>
          <Select
            value={String(minScore)}
            onValueChange={(v) => setMinScore(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scoreOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="received">
        {/* Mobile (< md): 3 linhas -- Confirmados sozinho em cima (é o mais
            importante), Recebidos+Enviados no meio, o resto embaixo. */}
        <div className="mb-[3px] flex flex-col gap-1.5 md:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="confirmed">
              Confirmados{" "}
              <Badge variant="secondary">
                {filteredConfirmed?.length ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="received">
              Recebidos{" "}
              <Badge variant="secondary">{filteredReceived?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviados{" "}
              <Badge variant="secondary">{filteredSent?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="previous">
              Anteriores{" "}
              <Badge variant="secondary">{filteredPrevious?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusados{" "}
              <Badge variant="secondary">{filteredRejected?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop (>= md): uma linha só, Confirmados primeiro, depois
            Recebidos, Enviados, Anteriores, Recusados. */}
        <TabsList className="mb-[3px] hidden md:inline-flex">
          <TabsTrigger value="confirmed">
            Confirmados{" "}
            <Badge variant="secondary">{filteredConfirmed?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="received">
            Recebidos{" "}
            <Badge variant="secondary">{filteredReceived?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviados{" "}
            <Badge variant="secondary">{filteredSent?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="previous">
            Anteriores{" "}
            <Badge variant="secondary">{filteredPrevious?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Recusados{" "}
            <Badge variant="secondary">{filteredRejected?.length ?? 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="flex flex-col gap-3">
          <ReceivedList
            matches={filteredReceived}
            isLoading={received.isLoading}
          />
        </TabsContent>
        <TabsContent value="sent" className="flex flex-col gap-3">
          <SentList matches={filteredSent} isLoading={sent.isLoading} />
        </TabsContent>
        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ConfirmedList
            matches={filteredConfirmed}
            isLoading={confirmed.isLoading}
            reviewedMatchIds={reviewedMatchIds}
          />
        </TabsContent>
        <TabsContent value="previous" className="flex flex-col gap-3">
          <PlainList
            matches={filteredPrevious}
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
            matches={filteredRejected}
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
    <div className="flex flex-col gap-3">
      <CandidateCard
        match={match}
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealed(true)}
            >
              <Mail className="size-4" />
              Entrar em contato
            </Button>
            <ContactDialog
              open={revealed}
              onOpenChange={setRevealed}
              isLoading={contact.isLoading}
              isError={contact.isError}
              email={contact.data?.email}
              phone={contact.data?.phone}
            />
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
              projectTitle={match.project.title}
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
      {match.acceptedProposal && (
        <AcceptedProposalPanel proposal={match.acceptedProposal} />
      )}
    </div>
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
              projectTitle={match.project.title}
              reviewedMatchIds={reviewedMatchIds}
            />
          )}
        </>
      }
    />
  ));
}
