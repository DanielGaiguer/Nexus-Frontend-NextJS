"use client";

import { useRouter } from "next/navigation";

import { StatusCheckForm } from "@/components/matches/status-check-form";
import { Card, CardContent } from "@/components/ui/card";

/** Espelha matches/status-check.html. */
export function StatusCheckPageContent({ matchId }: { matchId: number }) {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Como está indo o match?
        </h1>
        <p className="text-muted-foreground text-sm">
          Faltam 15 dias para este match encerrar. Conte-nos como está sendo.
        </p>
      </div>
      <Card>
        <CardContent>
          <StatusCheckForm
            matchId={matchId}
            onSubmitted={() => router.push("/company/matches")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
