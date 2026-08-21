"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navByRole, roleLabel } from "@/components/shell/nav-config";
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
import { useDisplayName } from "@/hooks/queries/useDisplayName";
import { cn } from "@/lib/utils";
import type { SessionClaims } from "@/types/auth";

/** Mesmo hash de cor por iniciais que o app antigo usa nos avatares sem foto (n.hashCode() -> hsl). */
function hueFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 360) + 360) % 360;
}

export function AppSidebar({ session }: { session: SessionClaims }) {
  const pathname = usePathname();
  const sections = navByRole[session.role];
  const displayName = useDisplayName(session.role);
  const unreadChat = useChatUnreadTotal();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border gap-0 border-b px-4 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:text-base"
        >
          nexus<span className="text-primary">.</span>
        </Link>
      </SidebarHeader>

      {/* Espelha .nexus-sidebar-role do app antigo — logo abaixo da wordmark, acima da navegação. */}
      <div className="text-primary px-4 pt-3 pb-1 text-[0.65rem] font-bold tracking-widest uppercase group-data-[collapsible=icon]:hidden">
        {roleLabel[session.role]}
      </div>

      <SidebarContent>
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
                      className="text-muted-foreground hover:bg-primary/8 hover:text-foreground data-[active=true]:bg-primary/15 data-[active=true]:text-foreground gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors data-[active=true]:font-semibold data-[active=true]:shadow-[inset_3px_0_0_var(--primary)]"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.href === "/chat" &&
                      !!unreadChat.data &&
                      unreadChat.data > 0 && (
                        <SidebarMenuBadge className="bg-primary text-primary-foreground rounded-full">
                          {unreadChat.data > 99 ? "99+" : unreadChat.data}
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
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white group-data-[collapsible=icon]:size-7"
            style={{
              backgroundColor: `hsl(${hueFromName(displayName ?? "U")}, 50%, 40%)`,
            }}
          >
            {(displayName ?? "U").charAt(0).toUpperCase()}
          </div>
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
