import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio reutilizável — substitui os "th:if isEmpty" mudos do
 * Thymeleaf antigo (ver regra de modernização no README).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-4 py-10 text-center ${className ?? ""}`}
    >
      <Icon className="text-muted-foreground/60 mb-1 size-8" />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground max-w-xs text-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
