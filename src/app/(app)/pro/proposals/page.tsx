"use client";

import {
  Building2,
  Clock,
  DollarSign,
  Eye,
  FileEdit,
  FileQuestion,
  FileText,
  HeartHandshake,
  History,
  Hourglass,
  Search,
  ThumbsDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProposalDetails } from "@/components/matches/proposal-details";
import { ScoreBreakdownGrid } from "@/components/matches/score-breakdown-grid";
import { ScreeningInvitationBadges } from "@/components/matches/screening-invitation-badges";
import { MatchCard } from "@/components/professional/match-card";
import { ScoreRing } from "@/components/professional/score-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkSectionSeenOnMount } from "@/hooks/mutations/useMarkSectionSeen";
import { useWithdrawProposal } from "@/hooks/mutations/useProposalMutations";
import { useMatches } from "@/hooks/queries/useMatches";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { usePublicOpportunity } from "@/hooks/queries/usePublicOpportunity";
import { useMyProposals } from "@/hooks/queries/useProposals";
import { ApiError } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";
import {
  proposalStatusLabels,
  type ProposalResponseDTO,
} from "@/types/proposal";

interface ProposalEntry {
  proposal: ProposalResponseDTO;
  /** Nem toda proposta tem Match -- profissional marcado como indisponível não
   * entra na geração em massa de Match, mas ainda pode enviar proposta (o
   * backend não bloqueia isso). Sem Match, os cards caem no fallback
   * ProposalOnlyCard, que busca os dados do projeto direto. */
  match: MatchResponseDTO | undefined;
}

interface ActionContext {
  proposal: ProposalResponseDTO;
  projectId: number;
  companyId: number | null;
}

/** Proposta PENDING cuja etapa mais recente de triagem ainda não foi decidida -- essas saem de
 * "Pendentes" e vão pra aba "Em processo" (screeningInvitations já vem ordenado por sentAt
 * decrescente, ver ScreeningInvitationService.getSummariesFor, então [0] é a mais recente). */
function isInScreeningProcess(proposal: ProposalResponseDTO) {
  const latest = proposal.screeningInvitations[0];
  if (!latest) return false;
  return (
    latest.status === "SENT" ||
    latest.status === "IN_PROGRESS" ||
    latest.status === "SUBMITTED"
  );
}

/** Diálogo com o conteúdo completo da proposta, somente leitura -- mesmo
 * ProposalDetails usado na comparação da empresa e no match confirmado. */
function ProposalDetailsDialog({
  proposal,
}: {
  proposal: ProposalResponseDTO;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="size-4" />
          Ver proposta completa
        </Button>
      </DialogTrigger>
      <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sua proposta para {proposal.projectTitle}</DialogTitle>
        </DialogHeader>
        <ProposalDetails proposal={proposal} />
      </DialogContent>
    </Dialog>
  );
}

function statusBadge(proposal: ProposalResponseDTO) {
  if (proposal.status === "ACCEPTED") {
    return (
      <Badge className="bg-success/15 text-success w-fit">
        Proposta aceita
      </Badge>
    );
  }
  if (proposal.status === "PENDING") {
    return (
      <Badge variant="outline" className="border-warning/30 text-warning w-fit">
        <Clock className="size-3" />
        Aguardando resposta do contratante
      </Badge>
    );
  }
  const label = proposal.autoRejectedPositionFilled
    ? "Vaga preenchida"
    : proposalStatusLabels[proposal.status];
  return (
    <Badge
      variant={proposal.status === "REJECTED" ? "destructive" : "outline"}
      className="w-fit"
    >
      {label}
    </Badge>
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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** Card mais simples pra propostas sem Match por trás -- busca só os dados
 * públicos do projeto (nome do contratante) pra completar o cabeçalho. */
function ProposalOnlyCard({
  proposal,
  renderActions,
}: {
  proposal: ProposalResponseDTO;
  renderActions: (ctx: ActionContext) => React.ReactNode;
}) {
  const { data: project, isLoading } = usePublicOpportunity(proposal.projectId);

  const latestScreening = proposal.screeningInvitations[0];
  const screeningHref = latestScreening
    ? latestScreening.status === "SENT" ||
      latestScreening.status === "IN_PROGRESS"
      ? `/pro/screening-invitations/${latestScreening.id}/take`
      : `/pro/screening-invitations/${latestScreening.id}`
    : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{proposal.projectTitle}</div>
                <div className="text-muted-foreground text-sm">
                  {isLoading ? "Carregando…" : (project?.companyName ?? "—")}
                </div>
              </div>
              {statusBadge(proposal)}
            </div>

            <ScreeningInvitationBadges
              screeningInvitations={proposal.screeningInvitations}
              viewer="professional"
            />

            <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {formatCurrency(proposal.proposedValue)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {proposal.estimatedDays} dias
              </span>
            </div>

            {proposal.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {proposal.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="text-[11px]"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ScoreRing
            score={Math.round(proposal.matchScoreAtSubmission)}
            size={84}
          />
        </div>

        <ScoreBreakdownGrid breakdown={proposal.scoreBreakdown} />
      </CardContent>
      <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
        {screeningHref && (
          <Button size="sm" variant="outline" asChild>
            <Link href={screeningHref}>
              <FileQuestion className="size-4" />
              Ver processo
            </Link>
          </Button>
        )}
        {renderActions({
          proposal,
          projectId: proposal.projectId,
          companyId: project?.companyId ?? null,
        })}
      </div>
    </Card>
  );
}

function ProposalList({
  entries,
  isLoading,
  mySkills,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  renderActions,
}: {
  entries: ProposalEntry[];
  isLoading: boolean;
  mySkills: string[] | undefined;
  emptyIcon: typeof FileText;
  emptyTitle: string;
  emptyDescription: string;
  renderActions: (ctx: ActionContext) => React.ReactNode;
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

  return entries.map(({ proposal, match }) =>
    match ? (
      <MatchCard
        key={proposal.id}
        match={match}
        mySkills={mySkills}
        badge={statusBadge(proposal)}
        actions={renderActions({
          proposal,
          projectId: match.project.id,
          companyId: match.project.companyId,
        })}
      />
    ) : (
      <ProposalOnlyCard
        key={proposal.id}
        proposal={proposal}
        renderActions={renderActions}
      />
    )
  );
}

export default function ProposalsPage() {
  // Abrir Propostas zera o badge "Padrão B" da sidebar (proposta que você
  // enviou e teve o status alterado pelo contratante).
  useMarkSectionSeenOnMount("PRO_PROPOSALS");
  const { data: profile } = useProfessionalProfile();
  const proposalsQuery = useMyProposals();
  const matchesQuery = useMatches();
  const withdrawProposal = useWithdrawProposal();
  const [search, setSearch] = useState("");

  const isLoading = proposalsQuery.isLoading || matchesQuery.isLoading;

  const entries = useMemo(() => {
    if (!proposalsQuery.data) return [];
    return proposalsQuery.data.map((proposal): ProposalEntry => {
      const match = matchesQuery.data
        ? ((proposal.matchId != null
            ? matchesQuery.data.find((m) => m.id === proposal.matchId)
            : undefined) ??
          matchesQuery.data.find((m) => m.project.id === proposal.projectId))
        : undefined;
      return { proposal, match };
    });
  }, [proposalsQuery.data, matchesQuery.data]);

  function filterEntries(list: ProposalEntry[]) {
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (e) =>
        e.proposal.projectTitle.toLowerCase().includes(term) ||
        (e.match?.project.companyName.toLowerCase().includes(term) ?? false)
    );
  }

  const confirmed = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "ACCEPTED" && e.match?.active !== false
    )
  );
  const pending = filterEntries(
    entries.filter(
      (e) =>
        e.proposal.status === "PENDING" && !isInScreeningProcess(e.proposal)
    )
  );
  const inScreening = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "PENDING" && isInScreeningProcess(e.proposal)
    )
  );
  const previous = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "ACCEPTED" && e.match?.active === false
    )
  );
  const rejected = filterEntries(
    entries.filter(
      (e) => e.proposal.status === "REJECTED" || e.proposal.status === "EXPIRED"
    )
  );
  const withdrawn = filterEntries(
    entries.filter((e) => e.proposal.status === "WITHDRAWN")
  );

  function handleWithdraw(proposalId: number) {
    withdrawProposal.mutate(proposalId, {
      onSuccess: () => toast.success("Proposta retirada."),
      onError: (error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível retirar a proposta."
        ),
    });
  }

  function ViewOpportunityButton({ projectId }: { projectId: number }) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/public/opportunity/${projectId}`}>
          <Eye className="size-4" />
          Ver oportunidade
        </Link>
      </Button>
    );
  }

  function ViewCompanyButton({ companyId }: { companyId: number | null }) {
    if (companyId == null) return null;
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/pro/companies/${companyId}`}>
          <Building2 className="size-4" />
          Ver empresa
        </Link>
      </Button>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Propostas</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe todas as propostas que você enviou para projetos
        </p>
      </div>

      <div className="max-w-sm space-y-1">
        <Label className="text-xs">Buscar</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por projeto ou contratante..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="confirmed">
        {/* Mobile (< md): Confirmadas sozinha em cima (mais importante), o
            resto em pares -- mesmo espírito do split de /pro/matches. */}
        <div className="mb-[3px] flex flex-col gap-1.5 md:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="confirmed">
              Confirmadas <Badge variant="secondary">{confirmed.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="pending">
              Pendentes <Badge variant="secondary">{pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="inScreening">
              Em processo{" "}
              <Badge variant="secondary">{inScreening.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="previous">
              Anteriores <Badge variant="secondary">{previous.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusadas <Badge variant="secondary">{rejected.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="withdrawn">
              Retiradas <Badge variant="secondary">{withdrawn.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop (>= md): uma linha só, mesma ordem das abas de /pro/matches
            (Confirmados, Pendentes, Em processo, Anteriores, Recusados), com
            Retiradas por último -- distinta de Recusadas (recusa é decisão da
            empresa, retirada é decisão do próprio profissional). */}
        <TabsList className="mb-[3px] hidden md:inline-flex">
          <TabsTrigger value="confirmed">
            Confirmadas <Badge variant="secondary">{confirmed.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes <Badge variant="secondary">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inScreening">
            Em processo <Badge variant="secondary">{inScreening.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="previous">
            Anteriores <Badge variant="secondary">{previous.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Recusadas <Badge variant="secondary">{rejected.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="withdrawn">
            Retiradas <Badge variant="secondary">{withdrawn.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ProposalList
            entries={confirmed}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={HeartHandshake}
            emptyTitle="Nenhuma proposta aceita ainda"
            emptyDescription="Quando um contratante aceitar sua proposta, o match é confirmado automaticamente e ela aparece aqui."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <ProposalDetailsDialog proposal={proposal} />
                <Button size="sm" asChild>
                  <Link href="/pro/matches">
                    <HeartHandshake className="size-4" />
                    Ver em Matches
                  </Link>
                </Button>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="pending" className="flex flex-col gap-3">
          <ProposalList
            entries={pending}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={FileText}
            emptyTitle="Nenhuma proposta pendente"
            emptyDescription="Propostas enviadas que ainda aguardam resposta do contratante aparecerão aqui."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  disabled={withdrawProposal.isPending}
                  onClick={() => handleWithdraw(proposal.id)}
                >
                  <X className="size-4" />
                  Retirar proposta
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/pro/opportunities/${projectId}/proposal`}>
                    <FileEdit className="size-4" />
                    Ver/editar minha proposta
                  </Link>
                </Button>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="inScreening" className="flex flex-col gap-3">
          <ProposalList
            entries={inScreening}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={Hourglass}
            emptyTitle="Nenhuma proposta em processo seletivo"
            emptyDescription="Propostas em vagas com processo seletivo aparecem aqui enquanto você ainda está respondendo etapas, ou aguardando a decisão do contratante sobre uma etapa."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  disabled={withdrawProposal.isPending}
                  onClick={() => handleWithdraw(proposal.id)}
                >
                  <X className="size-4" />
                  Retirar proposta
                </Button>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="previous" className="flex flex-col gap-3">
          <ProposalList
            entries={previous}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={History}
            emptyTitle="Nenhuma proposta anterior"
            emptyDescription="Propostas aceitas cujo match foi encerrado aparecerão aqui como histórico."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <ProposalDetailsDialog proposal={proposal} />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/pro/matches">
                    <HeartHandshake className="size-4" />
                    Ver em Matches
                  </Link>
                </Button>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="rejected" className="flex flex-col gap-3">
          <ProposalList
            entries={rejected}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={ThumbsDown}
            emptyTitle="Nenhuma proposta recusada"
            emptyDescription="Propostas recusadas pelo contratante ou expiradas sem resposta aparecerão aqui."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <ProposalDetailsDialog proposal={proposal} />
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="withdrawn" className="flex flex-col gap-3">
          <ProposalList
            entries={withdrawn}
            isLoading={isLoading}
            mySkills={profile?.skills}
            emptyIcon={X}
            emptyTitle="Nenhuma proposta retirada"
            emptyDescription="Propostas que você mesmo retirou antes de o contratante decidir aparecerão aqui."
            renderActions={({ proposal, projectId, companyId }) => (
              <>
                <ViewOpportunityButton projectId={projectId} />
                <ViewCompanyButton companyId={companyId} />
                <ProposalDetailsDialog proposal={proposal} />
              </>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
