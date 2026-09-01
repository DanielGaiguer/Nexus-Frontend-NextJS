"use client";

import { useRouter } from "next/navigation";

import { StatusCheckForm } from "@/components/matches/status-check-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatch } from "@/hooks/queries/useMatch";

/**
 * Confirmação da contratação aos 30 dias — a mesma tela serve contratante e
 * profissional (o backend resolve o lado pelo papel logado). Sai do fluxo do
 * antigo "status check" de 14 dias.
 */
export function StatusCheckPageContent({
  matchId,
  role,
}: {
  matchId: number;
  role: "company" | "professional";
}) {
  const router = useRouter();
  const { data: match, isLoading } = useMatch(matchId);

  const confirmation = match?.confirmation ?? null;
  const isJob = match?.project.opportunityType === "JOB";
  const alreadyAnswered = confirmation?.viewerAnswered === true;
  const windowOpen = confirmation?.status === "AWAITING_RESPONSES";

  const back = () =>
    router.push(role === "company" ? "/company/matches" : "/pro/matches");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Confirme sua contratação
        </h1>
        <p className="text-muted-foreground text-sm">
          Esta contratação completou 30 dias. Confirme se o trabalho foi
          concluído e informe o valor final combinado — os dois lados respondem
          separadamente.
        </p>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : !confirmation ? (
            <Message
              title="Nada para confirmar por aqui"
              body="A janela de confirmação desta contratação ainda não abriu (ela abre 30 dias após o fechamento)."
              onBack={back}
            />
          ) : alreadyAnswered ? (
            <Message
              title="Você já respondeu"
              body="Sua confirmação foi registrada. Assim que o outro lado responder, o Nexus concilia os valores."
              onBack={back}
            />
          ) : !windowOpen ? (
            <Message
              title="Confirmação finalizada"
              body="Esta confirmação já foi encerrada — nada mais a responder."
              onBack={back}
            />
          ) : (
            <StatusCheckForm
              matchId={matchId}
              isJob={isJob}
              suggestedAmount={confirmation.suggestedAmount}
              onSubmitted={back}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Message({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 py-4">
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-muted-foreground text-sm">{body}</p>
      <button
        type="button"
        onClick={onBack}
        className="text-primary text-sm font-semibold hover:underline"
      >
        Voltar para os matches
      </button>
    </div>
  );
}
