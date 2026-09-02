import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * "Linha de tabela" no formato de card, para o mobile (abaixo de `md`). As telas
 * mantêm a `<Table>` tradicional de `md` pra cima e renderizam uma lista destes
 * cards abaixo — mesmos dados, mesmas ações, sem rolagem horizontal.
 */
export function RecordCard({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-2 rounded-lg border p-3 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Cabeçalho do card: título à esquerda, algo (badge, data) à direita. */
export function RecordCardHeader({
  title,
  aside,
}: {
  title: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 font-medium break-words">{title}</div>
      {aside != null && <div className="shrink-0 text-right">{aside}</div>}
    </div>
  );
}

/** Par rótulo → valor. Valor alinhado à direita e pode quebrar. */
export function RecordField({
  label,
  children,
  className,
}: PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 gap-y-0.5", className)}
    >
      <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
      <span className="min-w-0 text-right break-words">{children}</span>
    </div>
  );
}

/** Faixa de ações no rodapé do card (empilha/quebra sem estourar a largura). */
export function RecordCardActions({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 pt-1", className)}>
      {children}
    </div>
  );
}
