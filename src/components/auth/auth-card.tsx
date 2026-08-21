import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthCardProps {
  /** Ícone em círculo — usado nas telas de cadastro (mesmo padrão de `.auth-logo` do app antigo). Omitir quando `wordmark` for true. */
  icon?: LucideIcon;
  /** Login.html não tem `.auth-logo`, só a wordmark "nexus." grande acima do título — único caso assim entre as telas de auth. */
  wordmark?: boolean;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Wrapper visual compartilhado pelas telas de login/cadastro. */
export function AuthCard({
  icon: Icon,
  wordmark,
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-center gap-3 text-center">
        {wordmark ? (
          <div className="text-2xl font-bold tracking-tight">
            nexus<span className="text-primary">.</span>
          </div>
        ) : (
          Icon && (
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
              <Icon className="size-6" />
            </div>
          )
        )}
        {eyebrow && (
          <span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-medium">
            {eyebrow}
          </span>
        )}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer && (
        <div className="text-muted-foreground border-t px-6 py-4 text-center text-sm">
          {footer}
        </div>
      )}
    </Card>
  );
}
