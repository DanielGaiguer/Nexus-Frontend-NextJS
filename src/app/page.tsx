import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <span className="text-lg font-semibold">
          <span className="text-primary">Nexus</span>
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            nexus-frontend-next
          </h1>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base">
            Fundação do novo frontend (Next.js + shadcn/ui + Tailwind v4). Telas
            de negócio chegam nos próximos prompts desta migração.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/theme-test">Ver design system</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Testar rota protegida</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
