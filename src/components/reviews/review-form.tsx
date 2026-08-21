"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ReasonChipPicker } from "@/components/reviews/reason-chip-picker";
import { StarRatingInput } from "@/components/reviews/star-rating-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/mutations/useSubmitReview";
import { ApiError } from "@/lib/api-client";
import { reviewFormSchema, type ReviewFormValues } from "@/lib/validation";
import {
  negativeReasonOptions,
  positiveReasonOptions,
  type AuthorType,
  type NegativeReason,
  type PositiveReason,
} from "@/types/review";

export function ReviewForm({
  matchId,
  authorType,
  cancelHref,
  cancelLabel = "Cancelar",
  onCancel,
  onSubmitted,
  onBlockedError,
}: {
  matchId: number;
  authorType: AuthorType;
  /** Link do botão de cancelar — usado na página standalone (volta pra lista de matches). */
  cancelHref?: string;
  /** Texto do botão de cancelar — "Responder depois" no modal do dashboard, "Cancelar" na página. */
  cancelLabel?: string;
  /** Ação do botão de cancelar quando não há navegação (ex.: fechar o modal). */
  onCancel?: () => void;
  onSubmitted: () => void;
  /**
   * O backend recusa a avaliação com 400 em dois casos específicos: empresa
   * que ainda não respondeu o status check, ou match marcado como "sem
   * contato" — quem chama pode querer trocar o form inteiro por um banner
   * nesses casos (ver /matches/[matchId]/review) em vez do toast genérico.
   */
  onBlockedError?: (message: string) => boolean;
}) {
  const role = authorType === "PROFESSIONAL" ? "professional" : "company";
  const submitReview = useSubmitReview(role);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      positiveReasons: [],
      negativeReasons: [],
    },
  });

  function onSubmit(values: ReviewFormValues) {
    submitReview.mutate(
      {
        matchId,
        rating: values.rating,
        comment: values.comment.trim() || null,
        authorType,
        positiveReasons: values.positiveReasons as PositiveReason[],
        negativeReasons: values.negativeReasons as NegativeReason[],
      },
      {
        onSuccess: () => {
          toast.success("Avaliação enviada com sucesso!");
          onSubmitted();
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "Não foi possível enviar a avaliação.";
          if (onBlockedError?.(message)) return;
          toast.error(message);
        },
      }
    );
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação geral *</FormLabel>
                  <FormControl>
                    <StarRatingInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positiveReasons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos positivos</FormLabel>
                  <FormControl>
                    <ReasonChipPicker
                      options={positiveReasonOptions}
                      value={field.value as PositiveReason[]}
                      onChange={field.onChange}
                      variant="positive"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="negativeReasons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos negativos</FormLabel>
                  <FormControl>
                    <ReasonChipPicker
                      options={negativeReasonOptions}
                      value={field.value as NegativeReason[]}
                      onChange={field.onChange}
                      variant="negative"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Comentário{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Compartilhe mais detalhes sobre sua experiência..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {cancelHref ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href={cancelHref}>{cancelLabel}</Link>
                </Button>
              ) : (
                onCancel && (
                  <Button type="button" variant="ghost" onClick={onCancel}>
                    {cancelLabel}
                  </Button>
                )
              )}
              <Button type="submit" disabled={submitReview.isPending}>
                <Star className="size-4" />
                Enviar avaliação
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
