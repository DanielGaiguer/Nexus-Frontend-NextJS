import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Shell leve e público para /terms e /privacy. Fora dos grupos (app) e (auth)
 * de propósito: estas rotas não exigem sessão e não redirecionam um usuário
 * logado (ele precisa poder abrir os documentos a qualquer momento, inclusive
 * a partir da tela de re-aceite). Ver PUBLIC_PATHS em src/proxy.ts.
 */
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            nexus<span className="text-primary">.</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/terms" className="hover:text-foreground">
            Termos de Uso
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Política de Privacidade
          </Link>
          <span>© 2026 Nexus.</span>
        </div>
      </footer>
    </div>
  );
}
