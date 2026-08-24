"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useDeleteCompanyPhoto,
  useUploadCompanyPhoto,
} from "@/hooks/mutations/useCompanyPhotoMutations";
import { ApiError } from "@/lib/api-client";

/** Espelha ProfilePhoto (professional) — sem corte client-side, ver README. */
export function CompanyPhoto({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadCompanyPhoto();
  const remove = useDeleteCompanyPhoto();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    upload.mutate(file, {
      onSuccess: () => toast.success("Logo atualizada!"),
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Erro ao enviar a logo. Tente novamente."
        );
      },
    });
  }

  function handleRemove() {
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Logo removida."),
      onError: () => toast.error("Erro ao remover a logo."),
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group relative">
        <Avatar className="size-24 rounded-xl">
          <AvatarImage src={photoUrl ?? undefined} alt={name} />
          <AvatarFallback className="rounded-xl text-2xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="bg-background absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border shadow-sm"
          aria-label="Alterar logo"
        >
          <Camera className="size-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {photoUrl && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="size-3.5" />
              Remover logo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover logo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover a foto do contratante? Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                disabled={remove.isPending}
              >
                {remove.isPending ? "Removendo…" : "Remover"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
