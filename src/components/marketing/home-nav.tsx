"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useDisplayName } from "@/hooks/queries/useDisplayName";
import { ApiError } from "@/lib/api-client";
import type { SessionClaims } from "@/types/auth";

const roleHome: Record<SessionClaims["role"], string> = {
  PROFESSIONAL: "/pro/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

// Hrefs absolutos (não só "#âncora") porque este nav também é usado nas
// páginas de auth (login/cadastro) — precisa navegar de volta pra home
// antes de rolar até a seção, não só um "#" que faria nada fora de "/".
const links = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#para-empresas", label: "Para empresas" },
  { href: "/#para-profissionais", label: "Para profissionais" },
];

function SessionActions({
  session,
  onNavigate,
}: {
  session: SessionClaims;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const displayName = useDisplayName(session.role);
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível sair. Tente novamente."
        );
      },
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground hidden text-sm sm:inline">
        {displayName}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          handleLogout();
          onNavigate?.();
        }}
        disabled={logout.isPending}
      >
        <LogOut className="size-4" />
        {logout.isPending ? "Saindo…" : "Sair"}
      </Button>
    </div>
  );
}

export function HomeNav({ session }: { session: SessionClaims | null }) {
  const [open, setOpen] = useState(false);
  const dashboardHref = session ? roleHome[session.role] : "/login";

  return (
    <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          nexus<span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button variant="outline" size="sm" asChild>
            <Link href={dashboardHref}>Dashboard</Link>
          </Button>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {session ? (
            <SessionActions session={session} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register/professional">Criar conta</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <div className="flex flex-col gap-1 px-4 pb-4">
                {links.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="hover:bg-accent rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href={dashboardHref}
                    className="hover:bg-accent rounded-md px-2 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </SheetClose>
                <div className="mt-3 border-t pt-3">
                  {session ? (
                    <SessionActions
                      session={session}
                      onNavigate={() => setOpen(false)}
                    />
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Entrar</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register/professional">Criar conta</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
