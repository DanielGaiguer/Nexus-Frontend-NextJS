"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowActionItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
  /** Link de navegação. */
  href?: string;
  target?: string;
  /** Ação simples (sem diálogo). */
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Quando true, o item não é renderizado (açúcar pra listas condicionais). */
  hidden?: boolean;
  /**
   * Item que abre um diálogo: recebe `{open, onOpenChange}` controlados pelo
   * RowActions. O componente de diálogo precisa aceitar esses props e não
   * renderizar gatilho próprio (`hideTrigger`).
   */
  dialog?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => ReactNode;
};

/**
 * Rodapé de ações de um card: as ações de decisão ficam visíveis (`primary`);
 * o resto entra num menu "Ações" (kebab) — em qualquer largura de tela, pra não
 * poluir a linha nem no desktop. Diálogos são acionados em modo controlado.
 */
export function RowActions({
  primary,
  items,
  className,
  align = "end",
  menuLabel = "Ações",
}: {
  primary?: ReactNode;
  items: RowActionItem[];
  className?: string;
  align?: "start" | "end";
  menuLabel?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  // Deixa o menu fechar antes de abrir o diálogo (evita foco/scroll travados).
  const openLater = (key: string) => setTimeout(() => setOpenKey(key), 0);

  const visible = items.filter((it) => !it.hidden);

  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
    >
      {primary}

      {visible.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="size-4" />
                {menuLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-56">
              {visible.map((it) =>
                it.href ? (
                  <DropdownMenuItem key={it.key} asChild disabled={it.disabled}>
                    <Link href={it.href} target={it.target}>
                      {it.icon && <it.icon className="size-4" />}
                      {it.label}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={it.key}
                    variant={it.destructive ? "destructive" : "default"}
                    disabled={it.disabled}
                    onSelect={() => {
                      it.onSelect?.();
                      if (it.dialog) openLater(it.key);
                    }}
                  >
                    {it.icon && <it.icon className="size-4" />}
                    {it.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {visible
            .filter((it) => it.dialog)
            .map((it) => (
              <Fragment key={it.key}>
                {it.dialog!({
                  open: openKey === it.key,
                  onOpenChange: (o) => setOpenKey(o ? it.key : null),
                })}
              </Fragment>
            ))}
        </>
      )}
    </div>
  );
}
