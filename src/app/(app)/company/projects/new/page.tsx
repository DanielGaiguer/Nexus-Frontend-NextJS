"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProjectForm } from "@/components/company/project-form";

export default function NewProjectPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Nova Oportunidade</h1>
        <p className="text-muted-foreground text-sm">
          Escolha o tipo de oportunidade e preencha os dados correspondentes
        </p>
      </div>
      <div className="bg-info/10 text-foreground rounded-md p-3 text-sm">
        Ao criar, o ranking de profissionais compatíveis será gerado
        automaticamente.
      </div>
      <ProjectForm />
    </div>
  );
}
