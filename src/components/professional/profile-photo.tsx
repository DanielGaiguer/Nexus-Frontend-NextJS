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
  useDeleteProfilePhoto,
  useUploadProfilePhoto,
} from "@/hooks/mutations/useProfilePhotoMutations";
import { ApiError } from "@/lib/api-client";

/**
 * Sem o corte client-side (cropperjs) que o nexus-frontend antigo tinha —
 * simplificação desta migração, ver README. Envia o arquivo selecionado
 * direto; o backend não exige proporção quadrada.
 */
export function ProfilePhoto({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadProfilePhoto();
  const remove = useDeleteProfilePhoto();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    upload.mutate(file, {
      onSuccess: () => toast.success("Foto de perfil atualizada!"),
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Erro ao enviar a foto. Tente novamente."
        );
      },
    });
  }

  function handleRemove() {
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Foto de perfil removida."),
      onError: () => toast.error("Erro ao remover a foto."),
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group relative">
        <Avatar className="size-24">
          <AvatarImage src={photoUrl ?? undefined} alt={name} />
          <AvatarFallback className="text-2xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="bg-background absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border shadow-sm"
          aria-label="Alterar foto de perfil"
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
              Remover foto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover foto de perfil</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover sua foto de perfil? Esta ação não
                pode ser desfeita.
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
