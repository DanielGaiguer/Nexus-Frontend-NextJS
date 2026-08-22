import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accentClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
} as const;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: keyof typeof accentClasses;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "primary",
}: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {/* Espelha .nexus-stat-label do app antigo: uppercase + tracking. */}
          {/* Sem truncate: quebra em várias linhas em vez de cortar com reticências. */}
          <div className="text-muted-foreground text-xs tracking-wide uppercase">
            {label}
          </div>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            accentClasses[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
