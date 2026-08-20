"use client";

import {
  Check,
  HeartHandshake,
  History,
  Mail,
  Send,
  ThumbsDown,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MatchCard } from "@/components/professional/match-card";
import { RejectMatchDialog } from "@/components/professional/reject-match-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ApiError } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

export default function MatchesPage() {
  const { data: profile } = useProfessionalProfile();
  const invites = useMatchInvites();
  const sent = useSentInterests();
  const allMatches = useMatches();
  const previous = usePreviousMatches();

  const confirmed = (allMatches.data ?? []).filter(
    (m) => m.status === "MATCHED"
  );
  const rejected = (allMatches.data ?? []).filter(
    (m) => m.status === "REJECTED"
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Matches</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie convites e veja seus matches confirmados
        </p>
      </div>

      <Tabs defaultValue="invites">
        <TabsList className="flex-wrap">
          <TabsTrigger value="invites">
            Convites{" "}
            <Badge variant="secondary">{invites.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviados <Badge variant="secondary">{sent.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmados <Badge variant="secondary">{confirmed.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="previous">
            Anteriores{" "}
            <Badge variant="secondary">{previous.data?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Recusados <Badge variant="secondary">{rejected.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invites" className="flex flex-col gap-3">
          <InvitesList
            matches={invites.data}
            isLoading={invites.isLoading}
            mySkills={profile?.skills}
          />
        </TabsContent>

        <TabsContent value="sent" className="flex flex-col gap-3">
          <SentList
            matches={sent.data}
            isLoading={sent.isLoading}
            mySkills={profile?.skills}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="flex flex-col gap-3">
          <ConfirmedList
            matches={confirmed}
            isLoading={allMatches.isLoading}
            mySkills={profile?.skills}
          />
        </TabsContent>

        <TabsContent value="previous" className="flex flex-col gap-3">
          <PlainList
            matches={previous.data}
            isLoading={previous.isLoading}
            mySkills={profile?.skills}
            emptyTitle="Nenhuma oportunidade anterior"
            emptyDescription="Matches confirmados que já se encerraram aparecem aqui."
            emptyIcon={History}
          />
        </TabsContent>

        <TabsContent value="rejected" className="flex flex-col gap-3">
          <PlainList
            matches={rejected}
            isLoading={allMatches.isLoading}
            mySkills={profile?.skills}
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
        description="Oportunidades em que você demonstrar interesse aparecem aqui até a empresa responder."
      />
    );
  }

  return matches.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      mySkills={mySkills}
      actions={
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
          Retirar interesse
        </Button>
      }
    />
  ));
}

function ConfirmedList({
  matches,
  isLoading,
  mySkills,
}: {
  matches: MatchResponseDTO[];
  isLoading: boolean;
  mySkills: string[] | undefined;
}) {
  if (isLoading) return <Loading />;
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="Nenhum match confirmado ainda"
        description="Aceite um convite ou tenha seu interesse aceito pela empresa pra ver os contatos aqui."
      />
    );
  }

  return matches.map((match) => (
    <ConfirmedMatchCard key={match.id} match={match} mySkills={mySkills} />
  ));
}

function ConfirmedMatchCard({
  match,
  mySkills,
}: {
  match: MatchResponseDTO;
  mySkills: string[] | undefined;
}) {
  const [revealed, setRevealed] = useState(false);
  const contact = useCompanyContact(match.project.companyId, revealed);

  return (
    <MatchCard
      match={match}
      mySkills={mySkills}
      showScore={false}
      actions={
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>
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
}: {
  matches: MatchResponseDTO[] | undefined;
  isLoading: boolean;
  mySkills: string[] | undefined;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon: typeof Mail;
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
    />
  ));
}
