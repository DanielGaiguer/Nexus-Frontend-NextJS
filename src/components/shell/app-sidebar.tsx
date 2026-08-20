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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDisplayName } from "@/hooks/queries/useDisplayName";
import type { SessionClaims } from "@/types/auth";

export function AppSidebar({ session }: { session: SessionClaims }) {
  const pathname = usePathname();
  const sections = navByRole[session.role];
  const displayName = useDisplayName(session.role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 text-base font-semibold"
        >
          nexus<span className="text-primary">.</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="text-muted-foreground text-xs">
              {roleLabel[session.role]}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
