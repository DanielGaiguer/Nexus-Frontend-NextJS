"use client";

import { ImageOff, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import type { BrandingImageKind } from "@/types/custom-portal";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

export function BrandingImageField({
  label,
  hint,
  kind,
  url,
  aspect,
  disabled,
  onUpload,
  onDelete,
}: {
  label: string;
  hint?: string;
  kind: BrandingImageKind;
  url: string | null;
  aspect: "square" | "wide";
  disabled?: boolean;
  onUpload: (kind: BrandingImageKind, file: File) => Promise<unknown>;
  onDelete: (kind: BrandingImageKind) => Promise<unknown>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("A imagem não pode passar de 5MB.");
      return;
    }
    setBusy(true);
    try {
      await onUpload(kind, file);
      toast.success(`${label} atualizado.`);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : `Não foi possível enviar ${label.toLowerCase()}.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await onDelete(kind);
      toast.success(`${label} removido.`);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : `Não foi possível remover ${label.toLowerCase()}.`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-3">
        <div
          className={`bg-muted flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${
            aspect === "wide" ? "h-16 w-28" : "size-16"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
            <img src={url} alt="" className="size-full object-contain" />
          ) : (
            <ImageOff className="text-muted-foreground/60 size-5" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {url ? "Trocar" : "Enviar"}
          </Button>
          {url && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={disabled || busy}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
