"use client";

import {
  CircleCheck,
  Clock,
  HeartHandshake,
  History,
  Hourglass,
  Mail,
  MessageCircle,
  Search,
  ThumbsDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import { BillingBlockBanner } from "@/components/billing/billing-block-banner";
import { ProposalCard } from "@/components/company/proposal-card";
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
import { useCompanyCancelMatch } from "@/hooks/mutations/useCompanyMatchActions";
import {
  useConfirmedCompanyMatches,
  usePreviousCompanyMatches,
  useReceivedInterests,
  useRejectedCompanyMatches,
  useSentInvites,
} from "@/hooks/queries/useCompanyMatches";
import { useMyProjects } from "@/hooks/queries/useMyProjects";
import { useProfessionalContact } from "@/hooks/queries/useProfessionalContact";
import { useCompanyProposals } from "@/hooks/queries/useProposals";
import { useReviewedMatchIds } from "@/hooks/queries/useReviews";
import { ApiError } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";
import type { ProposalResponseDTO } from "@/types/proposal";

interface ProposalEntry {
  proposal: ProposalResponseDTO;
  /** Achado cruzando proposal.matchId (ou o par projeto+profissional) com todos os matches
   * da empresa em qualquer status -- pode não existir (proposta de profissional que ficou
   * indisponível antes de qualquer match ser gerado), o ProposalCard já lida bem com isso. */
  match: MatchResponseDTO | undefined;
}

/** Proposta PENDING cuja etapa mais recente de triagem ainda não foi decidida -- essas saem de
 * "Recebidas" e vão pra aba "Em processo" (a decisão da empresa sobre a PROPOSTA continua
 * disponível ali normalmente, só o agrupamento muda). screeningInvitations já vem ordenado por
 * sentAt decrescente (ver ScreeningInvitationService.getSummariesFor), então [0] é a mais recente. */
function isInScreeningProcess(proposal: ProposalResponseDTO) {
  const latest = proposal.screeningInvitations[0];
  if (!latest) return false;
  return (
    latest.status === "SENT" ||
    latest.status === "IN_PROGRESS" ||
    latest.status === "SUBMITTED"
  );
}

const scoreOptions = [
  { value: "0", label: "Qualquer score" },
  { value: "90", label: "Acima de 90%" },
  { value: "80", label: "Acima de 80%" },
  { value: "70", label: "Acima de 70%" },
  { value: "60", label: "Acima de 60%" },
  { value: "50", label: "Acima de 50%" },
];

function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  );
}

/** Ações extras quando a proposta já virou match confirmado -- as mesmas de
 * ConfirmedCandidateCard em /company/matches, só que ancoradas aqui pelo Match
 * resolvido (nunca falta nesse caso: aceitar cria o Match se ele não existir). */
function ConfirmedProposalExtras({
  match,
  reviewedMatchIds,
  ended,
}: {
  match: MatchResponseDTO;
  reviewedMatchIds: number[] | undefined;
  ended: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const contact = useProfessionalContact(match.professional.id, revealed);
  const cancelMatch = useCompanyCancelMatch();
  const reviewed = reviewedMatchIds?.includes(match.id) ?? false;

  return (
    <>
      {!ended && (
        <>
          <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
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
        </>
      )}
      <MatchHistoryDialog matchId={match.id} />
      <Button size="sm" variant="outline" asChild>
        <Link href={`/chat/${match.id}`}>
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
          matchId={match.id}
          authorType="COMPANY"
          projectTitle={match.project.title}
        />
      )}
      {!ended && (
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
  );
}

function ProposalSection({
  entries,
  isLoading,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  extraActionsFor,
}: {
  entries: ProposalEntry[];
  isLoading: boolean;
  emptyIcon: typeof HeartHandshake;
  emptyTitle: string;
  emptyDescription: string;
  extraActionsFor?: (match: MatchResponseDTO | undefined) => React.ReactNode;
}) {
  if (isLoading) return <Loading />;
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return entries.map(({ proposal, match }) => (
    <ProposalCard
      key={proposal.id}
      proposal={proposal}
      match={match}
      showProjectTitle
      extraActions={extraActionsFor?.(match)}
    />
  ));
}

function CompanyProposalsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "confirmed";
  const proposalsQuery = useCompanyProposals();
  const projectsQuery = useMyProjects();
  const received = useReceivedInterests();
  const sent = useSentInvites();
  const confirmedMatches = useConfirmedCompanyMatches();
  const rejectedMatches = useRejectedCompanyMatches();
  const previousMatches = usePreviousCompanyMatches();
  const { data: reviewedMatchIds } = useReviewedMatchIds("company");

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [minScore, setMinScore] = useState(0);

  const isLoading = proposalsQuery.isLoading;

  // Todos os matches da empresa em qualquer status, só pra resolver qual Match
  // fica por trás de cada proposta (comparar, ver perfil interno, ações de
  // match confirmado) -- não precisa vir tudo de um único endpoint "geral".
  const allMatches = useMemo(
    () => [
      ...(received.data ?? []),
      ...(sent.data ?? []),
      ...(confirmedMatches.data ?? []),
      ...(rejectedMatches.data ?? []),
      ...(previousMatches.data ?? []),
    ],
    [
      received.data,
      sent.data,
      confirmedMatches.data,
      rejectedMatches.data,
      previousMatches.data,
    ]
  );

  // Já vem do backend ordenado por createdAt desc (mais recente primeiro) --
  // preservado aqui, o filtro abaixo não reordena.
  const entries = useMemo(() => {
    if (!proposalsQuery.data) return [];
    return proposalsQuery.data.map((proposal): ProposalEntry => {
      const match =
        (proposal.matchId != null
          ? allMatches.find((m) => m.id === proposal.matchId)
          : undefined) ??
        allMatches.find(
          (m) =>
            m.project.id === proposal.projectId &&
            m.professional.id === proposal.professionalId
        );
      return { proposal, match };
    });
  }, [proposalsQuery.data, allMatches]);

  // Só projetos PROJECT com "aceita propostas" ativo -- os únicos que podem
  // ter recebido alguma proposta pra começo de conversa.
  const eligibleProjects = (projectsQuery.data ?? []).filter(
    (p) => p.opportunityType === "PROJECT" && p.acceptsProposals === true
  );

  function filterEntries(list: ProposalEntry[]) {
    const term = search.trim().toLowerCase();
    return list.filter((e) => {
      if (
        projectFilter !== "ALL" &&
        e.proposal.projectId !== Number(projectFilter)
      ) {
        return false;
      }
      if (term) {
        const matchesSearch =
          e.proposal.projectTitle.toLowerCase().includes(term) ||
          e.proposal.professionalName.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      if (minScore > 0) {
        const score = Math.round(e.proposal.matchScoreAtSubmission);
        if (score < minScore) return false;
      }
      return true;
    });
  }

  const confirmedList = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "ACCEPTED" && e.match?.active !== false
    )
  );
  const receivedList = filterEntries(
    entries.filter(
      (e) =>
        e.proposal.status === "PENDING" && !isInScreeningProcess(e.proposal)
    )
  );
  const inScreeningList = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "PENDING" && isInScreeningProcess(e.proposal)
    )
  );
  const previousList = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "ACCEPTED" && e.match?.active === false
    )
  );
  const rejectedList = filterEntries(
    entries.filter(
      (e) =>
        e.proposal.status === "REJECTED" ||
        e.proposal.status === "WITHDRAWN" ||
        e.proposal.status === "EXPIRED"
    )
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <BillingBlockBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Propostas</h1>
        <p className="text-muted-foreground text-sm">
          Todas as propostas recebidas em qualquer um dos seus projetos
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
        <div className="w-56 space-y-1">
          <Label className="text-xs">Projeto</Label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os projetos</SelectItem>
              {eligibleProjects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <Tabs defaultValue={initialTab}>
        {/* Mobile (< md): Confirmadas sozinha em cima, o resto em pares --
            mesmo espírito do split usado em /company/matches e /pro/proposals. */}
        <div className="mb-[3px] flex flex-col gap-1.5 md:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="confirmed">
              Confirmadas{" "}
              <Badge variant="secondary">{confirmedList.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="received">
              Recebidas <Badge variant="secondary">{receivedList.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="inScreening">
              Em processo{" "}
              <Badge variant="secondary">{inScreeningList.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="previous">
              Anteriores{" "}
              <Badge variant="secondary">{previousList.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusadas <Badge variant="secondary">{rejectedList.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop (>= md): uma linha só, mesma ordem de /pro/proposals
            (Confirmadas, Pendentes/Recebidas, Em processo, Anteriores, Recusadas). */}
        <TabsList className="mb-[3px] hidden md:inline-flex">
          <TabsTrigger value="confirmed">
            Confirmadas{" "}
            <Badge variant="secondary">{confirmedList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="received">
            Recebidas <Badge variant="secondary">{receivedList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inScreening">
            Em processo{" "}
            <Badge variant="secondary">{inScreeningList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="previous">
            Anteriores <Badge variant="secondary">{previousList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Recusadas <Badge variant="secondary">{rejectedList.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ProposalSection
            entries={confirmedList}
            isLoading={isLoading}
            emptyIcon={HeartHandshake}
            emptyTitle="Nenhuma proposta aceita ainda"
            emptyDescription="Propostas que você aceitar aparecerão aqui, com o match já confirmado."
            extraActionsFor={(match) =>
              match && (
                <ConfirmedProposalExtras
                  match={match}
                  reviewedMatchIds={reviewedMatchIds}
                  ended={false}
                />
              )
            }
          />
        </TabsContent>

        <TabsContent value="received" className="flex flex-col gap-3">
          <ProposalSection
            entries={receivedList}
            isLoading={isLoading}
            emptyIcon={Clock}
            emptyTitle="Nenhuma proposta recebida"
            emptyDescription="Propostas enviadas por profissionais aos seus projetos aparecerão aqui, aguardando sua decisão."
          />
        </TabsContent>

        <TabsContent value="inScreening" className="flex flex-col gap-3">
          <ProposalSection
            entries={inScreeningList}
            isLoading={isLoading}
            emptyIcon={Hourglass}
            emptyTitle="Nenhuma proposta em processo seletivo"
            emptyDescription="Propostas de candidatos ainda respondendo etapas de triagem, ou aguardando sua decisão sobre uma etapa, aparecerão aqui."
          />
        </TabsContent>

        <TabsContent value="previous" className="flex flex-col gap-3">
          <ProposalSection
            entries={previousList}
            isLoading={isLoading}
            emptyIcon={History}
            emptyTitle="Nenhuma proposta anterior"
            emptyDescription="Propostas aceitas cujo match já foi encerrado aparecerão aqui como histórico."
            extraActionsFor={(match) =>
              match && (
                <ConfirmedProposalExtras
                  match={match}
                  reviewedMatchIds={reviewedMatchIds}
                  ended={true}
                />
              )
            }
          />
        </TabsContent>

        <TabsContent value="rejected" className="flex flex-col gap-3">
          <ProposalSection
            entries={rejectedList}
            isLoading={isLoading}
            emptyIcon={ThumbsDown}
            emptyTitle="Nenhuma proposta recusada"
            emptyDescription="Propostas recusadas, retiradas pelo profissional ou expiradas aparecerão aqui."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// useSearchParams (pra abrir direto na aba "?tab=received" -- ver redirect de
// company/screening-invitations/[invitationId] ao aprovar a última etapa) exige um Suspense
// boundary em volta, mesmo padrão já usado em (auth)/login/page.tsx.
export default function CompanyProposalsPage() {
  return (
    <Suspense fallback={null}>
      <CompanyProposalsPageContent />
    </Suspense>
  );
}
