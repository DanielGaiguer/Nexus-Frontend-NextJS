"use client";

import { Download, FileText, FileX, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadResume } from "@/hooks/mutations/useUploadResume";
import { ApiError } from "@/lib/api-client";

export function ResumeCard({
  professionalId,
  hasResume,
}: {
  professionalId: number;
  hasResume: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadResume = useUploadResume();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadResume.mutate(file, {
      onSuccess: () => toast.success("Currículo enviado!"),
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível enviar o currículo."
        );
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Currículo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          {hasResume ? (
            <>
              <FileText className="text-success size-4" /> PDF enviado
            </>
          ) : (
            <>
              <FileX className="size-4" /> Nenhum currículo enviado
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploadResume.isPending}
          >
            <Upload className="size-3.5" />
            {uploadResume.isPending
              ? "Enviando…"
              : hasResume
                ? "Substituir"
                : "Enviar currículo"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {hasResume && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/api/professional/${professionalId}/resume`}
                target="_blank"
                rel="noopener"
              >
                <Download className="size-3.5" />
                Baixar
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
