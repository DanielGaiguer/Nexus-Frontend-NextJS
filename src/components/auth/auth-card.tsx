import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  /** Ícone em círculo — usado nas telas de cadastro (mesmo padrão de `.auth-logo` do app antigo). Omitir quando `wordmark` for true. */
  icon?: LucideIcon;
  /** Cor do ícone/círculo — default é o roxo de marca (`.auth-logo`/`.badge-glow` do app antigo). register/success passa a variante verde (checkmark de sucesso). */
  iconClassName?: string;
  /** Login.html não tem `.auth-logo`, só a wordmark "nexus." grande acima do título — único caso assim entre as telas de auth. */
  wordmark?: boolean;
  eyebrow?: string;
  /** Cor do badge do eyebrow — default roxo (`.badge-glow`); register-company/linkedin passam a variante ciano (mesmo tom de `#67e8f9` do app antigo). */
  eyebrowClassName?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Wrapper visual compartilhado pelas telas de login/cadastro. */
export function AuthCard({
  icon: Icon,
  iconClassName,
  wordmark,
  eyebrow,
  eyebrowClassName,
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
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                iconClassName ?? "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-6" />
            </div>
          )
        )}
        {eyebrow && (
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              eyebrowClassName ?? "bg-primary/10 text-primary border-primary/20"
            )}
          >
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
