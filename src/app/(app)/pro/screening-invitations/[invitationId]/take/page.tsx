"use client";

import { AlertTriangle, Send, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeclineScreeningInvitation,
  useStartScreeningAttempt,
  useSubmitScreeningAnswers,
} from "@/hooks/mutations/useScreeningInvitationMutations";
import { useScreeningAttempt } from "@/hooks/queries/useScreeningInvitations";
import { ApiError } from "@/lib/api-client";
import type { ScreeningAnswerSubmitDTO } from "@/types/screening";

interface LocalAnswer {
  selectedOptionIndex: number | null;
  essayText: string;
}

// EXPIRED tem sua própria checagem, antes desta -- é a única realmente terminal, sem nova
// tentativa (ver ScreeningInvitationService.checkGate).
const notAnswerableStatuses = new Set(["DECLINED", "CANCELLED"]);

export default function TakeScreeningInvitationPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const id = Number(invitationId);
  const router = useRouter();

  const { data: attempt, isLoading, error } = useScreeningAttempt(id);
  const startAttempt = useStartScreeningAttempt(id);
  const submitAnswers = useSubmitScreeningAnswers(id);
  const declineInvitation = useDeclineScreeningInvitation(id);

  const [answers, setAnswers] = useState<Record<number, LocalAnswer>>({});
  // Overwritten with Date.now() by the mount effect below -- 0 is just a pure placeholder so the
  // ref initializer itself doesn't call an impure function during render.
  const startedAtRef = useRef<number>(0);
  const tabSwitchCountRef = useRef(0);
  const touchedRef = useRef<Record<number, { first: number; last: number }>>(
    {}
  );
  const startedAttemptRef = useRef(false);

  useEffect(() => {
    if (startedAttemptRef.current) return;
    startedAttemptRef.current = true;
    startedAtRef.current = Date.now();
    startAttempt.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) tabSwitchCountRef.current += 1;
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (
      attempt?.status === "SUBMITTED" ||
      attempt?.status === "APPROVED" ||
      attempt?.status === "REPROVED"
    ) {
      router.replace(`/pro/screening-invitations/${id}`);
    }
  }, [attempt?.status, id, router]);

  function touchQuestion(questionId: number) {
    // Only ever invoked from onChange/onValueChange handlers, never during render -- timestamping
    // interaction time is the entire point here, same deliberate exception as sidebar.tsx.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const existing = touchedRef.current[questionId];
    touchedRef.current[questionId] = {
      first: existing?.first ?? now,
      last: now,
    };
  }

  function setSelectedOption(questionId: number, optionIndex: number) {
    touchQuestion(questionId);
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        selectedOptionIndex: optionIndex,
        essayText: current[questionId]?.essayText ?? "",
      },
    }));
  }

  function setEssayText(questionId: number, text: string) {
    touchQuestion(questionId);
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        selectedOptionIndex: current[questionId]?.selectedOptionIndex ?? null,
        essayText: text,
      },
    }));
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={XCircle}
          title="Questionário indisponível"
          description="Este convite não existe mais ou você não tem acesso a ele."
        />
      </div>
    );
  }

  if (attempt.status === "EXPIRED") {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={XCircle}
          title="O prazo deste questionário terminou"
          description="Você não respondeu a tempo. Diferente de recusar, isso é definitivo: não é possível tentar novamente para esta vaga."
        />
      </div>
    );
  }

  if (notAnswerableStatuses.has(attempt.status)) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={XCircle}
          title="Este questionário não está mais disponível"
          description="Ele foi recusado ou foi cancelado. Tente demonstrar interesse, aceitar o convite ou enviar a proposta novamente para gerar uma nova tentativa."
        />
      </div>
    );
  }

  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "APPROVED" ||
    attempt.status === "REPROVED"
  ) {
    return null;
  }

  const allAnswered = attempt.questions.every((q) => {
    const answer = answers[q.id];
    if (!answer) return false;
    return q.type === "MULTIPLE_CHOICE"
      ? answer.selectedOptionIndex != null
      : answer.essayText.trim() !== "";
  });

  function handleSubmit() {
    if (!attempt) return;
    const payload = {
      answers: attempt.questions.map((q): ScreeningAnswerSubmitDTO => {
        const answer = answers[q.id];
        const touched = touchedRef.current[q.id];
        return {
          questionId: q.id,
          selectedOptionIndex: answer?.selectedOptionIndex ?? null,
          essayText: q.type === "ESSAY" ? (answer?.essayText ?? "") : null,
          timeSpentSeconds: touched
            ? Math.max(1, Math.round((touched.last - touched.first) / 1000))
            : 0,
        };
      }),
      totalTimeSpentSeconds: Math.max(
        1,
        Math.round((Date.now() - startedAtRef.current) / 1000)
      ),
      tabSwitchCount: tabSwitchCountRef.current,
    };

    submitAnswers.mutate(payload, {
      onSuccess: () => {
        toast.success(
          "Resposta enviada! Aguardando a decisão da empresa sobre esta etapa."
        );
        router.push("/pro/matches");
      },
      onError: (submitError) =>
        toast.error(
          submitError instanceof ApiError
            ? submitError.message
            : "Não foi possível enviar o questionário."
        ),
    });
  }

  function handleDecline() {
    declineInvitation.mutate(undefined, {
      onSuccess: () => {
        toast.info(
          "Questionário recusado por agora. Você pode tentar novamente mais tarde."
        );
        router.push("/pro/opportunities");
      },
      onError: (declineError) =>
        toast.error(
          declineError instanceof ApiError
            ? declineError.message
            : "Não foi possível recusar o questionário."
        ),
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          Etapa {attempt.stageOrderIndex} de {attempt.totalStages} —{" "}
          {attempt.screeningQuestionnaireTitle}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {attempt.stageTitle}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {attempt.projectTitle} — {attempt.companyName}
        </p>
        {attempt.instructions && (
          <p className="text-muted-foreground mt-2 text-sm">
            {attempt.instructions}
          </p>
        )}
        <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <AlertTriangle className="size-3.5" />
          Responda até {new Date(attempt.deadlineAt).toLocaleString("pt-BR")}{" "}
          — depois disso o prazo se esgota e não será possível tentar de novo
          para esta vaga.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {attempt.questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="space-y-3">
              <p className="font-medium">
                {index + 1}. {question.prompt}
              </p>
              {question.type === "MULTIPLE_CHOICE" ? (
                <RadioGroup
                  value={
                    answers[question.id]?.selectedOptionIndex?.toString() ??
                    ""
                  }
                  onValueChange={(value) =>
                    setSelectedOption(question.id, Number(value))
                  }
                  className="space-y-2"
                >
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <RadioGroupItem value={optionIndex.toString()} />
                      {option}
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  rows={4}
                  value={answers[question.id]?.essayText ?? ""}
                  onChange={(e) => setEssayText(question.id, e.target.value)}
                  placeholder="Escreva sua resposta..."
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between gap-2 border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleDecline}
          disabled={declineInvitation.isPending || submitAnswers.isPending}
        >
          Recusar por agora
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitAnswers.isPending}
        >
          <Send className="size-4" />
          {submitAnswers.isPending ? "Enviando…" : "Enviar respostas"}
        </Button>
      </div>
    </div>
  );
}
