"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navByRole, roleLabel } from "@/components/shell/nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatUnreadTotal } from "@/hooks/queries/useChat";
import { useSidebarBadges } from "@/hooks/queries/useSidebarBadges";
import { useSupportUnreadTotal } from "@/hooks/queries/useSupport";
import {
  useDisplayName,
  useDisplayPhotoUrl,
} from "@/hooks/queries/useDisplayName";
import { cn } from "@/lib/utils";
import type { SessionClaims } from "@/types/auth";

export function AppSidebar({ session }: { session: SessionClaims }) {
  const pathname = usePathname();
  const sections = navByRole[session.role];
  const displayName = useDisplayName(session.role);
  const photoUrl = useDisplayPhotoUrl(session.role);
  const unreadChat = useChatUnreadTotal();
  const supportSide = session.role === "ADMIN" ? "admin" : "user";
  const unreadSupport = useSupportUnreadTotal(supportSide);
  // Demais seções (Matches, Propostas, Processos Seletivos, Financeiro, Minha
  // Plataforma, filas do Admin) — um GET só, recalculado a cada carga da
  // sidebar. "Conversas" e "Suporte" seguem no seu próprio contador (tempo real).
  const otherBadges = useSidebarBadges();

  // Contador do badge por item de menu (0 = sem badge).
  const badgeFor = (href: string) => {
    if (href === "/chat") return unreadChat.data ?? 0;
    if (href === "/support" || href === "/admin/support")
      return unreadSupport.data ?? 0;
    return otherBadges.data?.[href] ?? 0;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border gap-0 border-b px-4 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        {/* Sidebar aberta: wordmark "nexus."; fechada (collapsible=icon), a
            wordmark fica espremida na largura estreita — troca pelo ícone
            quadrado do app antigo (nexus-icon.png), que cabe certinho. */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden"
        >
          nexus<span className="text-primary">.</span>
        </Link>
        <Link
          href="/"
          className="hidden group-data-[collapsible=icon]:block"
          aria-label="Nexus"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ícone estático pequeno, sem necessidade do Image do Next aqui */}
          <img src="/nexus-icon.png" alt="" className="size-7 rounded-md" />
        </Link>
      </SidebarHeader>

      {/* Espelha .nexus-sidebar-role do app antigo — logo abaixo da wordmark, acima da navegação. */}
      <div className="text-primary px-4 pt-3 pb-1 text-[0.65rem] font-bold tracking-widest uppercase group-data-[collapsible=icon]:hidden">
        {roleLabel[session.role]}
      </div>

      <SidebarContent className="thin-scrollbar">
        {sections.map((section, index) => (
          <SidebarGroup
            key={index}
            className={cn(
              "px-2 py-1",
              index === sections.length - 1 &&
                sections.length > 1 &&
                "border-sidebar-border mt-auto border-t pt-3"
            )}
          >
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.title}
                      // h-auto! + min-h-10: rótulos longos quebram em 2 linhas
                      // (jogam o texto pra baixo) em vez de cortar com "…".
                      // items-start mantém ícone e 1ª linha alinhados com os
                      // demais itens; a linha extra cresce pra baixo.
                      className="text-muted-foreground hover:bg-primary/8 hover:text-foreground data-[active=true]:bg-primary/15 data-[active=true]:text-foreground h-auto! min-h-10 items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group-data-[collapsible=icon]:min-h-0! data-[active=true]:font-semibold data-[active=true]:shadow-[inset_3px_0_0_var(--primary)] [&>span:last-child]:leading-tight [&>span:last-child]:whitespace-normal"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badgeFor(item.href) > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          "bg-primary text-primary-foreground rounded-full",
                          // SidebarMenuBadge base já vem com
                          // peer-hover/menu-button:text-sidebar-accent-foreground
                          // E peer-data-[active=true]/menu-button:text-sidebar-accent-foreground
                          // — sem isso, passar o mouse OU o item estar selecionado
                          // troca essa cor por cima do texto branco (fica ilegível
                          // sobre bg-primary), independente do tema.
                          "peer-hover/menu-button:text-primary-foreground peer-data-[active=true]/menu-button:text-primary-foreground",
                          // O botão do menu usa h-10! (maior que o h-8 padrão do
                          // size="default"), mas o offset vertical da badge
                          // (top-1.5) é calibrado pro h-8 original -- centraliza
                          // de verdade acompanhando a altura real do botão.
                          "peer-data-[size=default]/menu-button:top-1/2 peer-data-[size=default]/menu-button:-translate-y-1/2"
                        )}
                      >
                        {badgeFor(item.href) > 99 ? "99+" : badgeFor(item.href)}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t px-3 py-3">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <Avatar className="size-9 group-data-[collapsible=icon]:size-7">
            <AvatarImage src={photoUrl ?? undefined} alt="" />
            <AvatarFallback>
              {(displayName ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="text-muted-foreground text-xs">
              {roleLabel[session.role].toLowerCase()}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
