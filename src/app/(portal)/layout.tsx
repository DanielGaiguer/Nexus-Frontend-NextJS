import type { ReactNode } from "react";

/**
 * Layout das páginas públicas de plataforma personalizada
 * (`empresa.nexus.com.br`, servido via rewrite de host no proxy). Fora do
 * shell autenticado do Nexus. Superfície branca fixa — o tema escuro do
 * `next-themes` no `<html>` não vaza para cá; os componentes do portal usam
 * cor própria inline.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}
