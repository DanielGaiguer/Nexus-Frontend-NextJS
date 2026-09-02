"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { roleLabel } from "@/components/shell/nav-config";
import { NotificationBell } from "@/components/shell/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useDisplayName,
  useDisplayPhotoUrl,
} from "@/hooks/queries/useDisplayName";
import { useLogout } from "@/hooks/mutations/useLogout";
import { ApiError } from "@/lib/api-client";
import type { SessionClaims } from "@/types/auth";

export function AppHeader({ session }: { session: SessionClaims }) {
  const router = useRouter();
  const displayName = useDisplayName(session.role);
  const photoUrl = useDisplayPhotoUrl(session.role);
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

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex-1" />
      <NotificationBell />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 pr-2 text-sm outline-none">
          <Avatar className="size-7">
            <AvatarImage src={photoUrl ?? undefined} alt="" />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden font-medium sm:inline">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-muted-foreground text-xs">
                {session.email} · {roleLabel[session.role]}
              </span>
            </div>
          </DropdownMenuLabel>
          {session.role !== "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={
                    session.role === "PROFESSIONAL"
                      ? "/pro/profile"
                      : "/company/profile"
                  }
                >
                  <User />
                  Meu perfil
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut />
            {logout.isPending ? "Saindo…" : "Sair"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
