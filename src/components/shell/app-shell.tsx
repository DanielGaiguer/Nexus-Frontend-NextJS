"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
