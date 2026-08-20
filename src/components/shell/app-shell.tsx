"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import type { SessionClaims } from "@/types/auth";

export function AppShell({
  session,
  defaultSidebarOpen,
  children,
}: {
  session: SessionClaims;
  defaultSidebarOpen: boolean;
  children: ReactNode;
}) {
  // Conector global do chat — mantém o badge "Conversas" da sidebar em tempo
  // real em qualquer página autenticada, não só na tela de chat.
  useChatNotifications();

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar session={session} />
      <SidebarInset>
        <AppHeader session={session} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
