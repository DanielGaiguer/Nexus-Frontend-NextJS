"use client";

import { Briefcase, ExternalLink, LogIn, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { resolvePortalColor } from "@/components/custom-portal/portal-branding-view";
import { PortalLoginDialog } from "@/components/custom-portal/portal-login-dialog";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useSession } from "@/hooks/queries/useSession";
import { nexusUrlFrom } from "@/lib/portal-domain";

/**
 * Barra fixa no topo da página pública da plataforma personalizada, com menu
 * hambúrguer: Entrar/Sair, "Ver mais vagas" e "Acessar portal Nexus".
 *
 * Menu montado com markup próprio + cores inline — NÃO usa o DropdownMenu do
 * shadcn de propósito: ele renderiza num portal fora da árvore isolada e
 * herdaria o tema (dark) do Nexus por cima da página branca do portal.
 */
export function PortalHeader({
  rootHost,
  title,
  logoUrl,
  primaryColor,
  jobsHref,
}: {
  /** Domínio raiz do Nexus (sem o subdomínio), vindo do server. */
  rootHost: string;
  title: string;
  logoUrl: string | null;
  primaryColor: string | null;
  /** "#vagas" na home, "/" no detalhe. */
  jobsHref: string;
}) {
  const color = resolvePortalColor(primaryColor);
  const session = useSession();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const itemClass =
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-slate-50";
  const iconStyle = { color: "#64748b" } as const;

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderColor: "#e2e8f0",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2.5">
        <a
          href={jobsHref}
          className="flex min-w-0 items-center gap-2"
          onClick={() => setMenuOpen(false)}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md text-sm font-bold"
            style={{ background: `${color}1f`, color }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
              <img src={logoUrl} alt="" className="size-full object-contain" />
            ) : (
              title.charAt(0).toUpperCase()
            )}
          </span>
          <span
            className="truncate text-sm font-semibold"
            style={{ color: "#0f172a" }}
          >
            {title}
          </span>
        </a>

        <div className="relative">
          <button
            type="button"
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-md border"
            style={{ borderColor: "#e2e8f0", color: "#334155" }}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border shadow-lg"
                style={{
                  background: "#ffffff",
                  borderColor: "#e2e8f0",
                  color: "#0f172a",
                }}
              >
                {session.data ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={itemClass}
                    onClick={() => {
                      setMenuOpen(false);
                      logout.mutate(undefined, {
                        onSuccess: () => session.refetch(),
                      });
                    }}
                  >
                    <LogOut className="size-4" style={iconStyle} />
                    Sair
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={itemClass}
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginOpen(true);
                    }}
                  >
                    <LogIn className="size-4" style={iconStyle} />
                    Entrar
                  </button>
                )}

                <a
                  role="menuitem"
                  href={jobsHref}
                  className={itemClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <Briefcase className="size-4" style={iconStyle} />
                  Ver mais vagas
                </a>

                <div style={{ borderTop: "1px solid #e2e8f0" }} />

                <a
                  role="menuitem"
                  href={nexusUrlFrom(rootHost, "/")}
                  className={itemClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="size-4" style={iconStyle} />
                  Acessar portal Nexus
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <PortalLoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        primaryColor={primaryColor}
        rootHost={rootHost}
        onLoggedIn={() => session.refetch()}
      />
    </header>
  );
}
