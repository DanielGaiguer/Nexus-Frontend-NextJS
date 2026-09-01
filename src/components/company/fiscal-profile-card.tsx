"use client";

import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveFiscalProfile } from "@/hooks/mutations/useNfseActions";
import { useCompanyFiscalProfile } from "@/hooks/queries/useNfse";
import { ApiError } from "@/lib/api-client";

type FormState = {
  legalName: string;
  fiscalEmail: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  cityIbgeCode: string;
};

const EMPTY: FormState = {
  legalName: "",
  fiscalEmail: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  cityIbgeCode: "",
};

/**
 * Dados fiscais do contratante (tomador do serviço) que a NFS-e exige e que o
 * cadastro básico não tem: razão social, e-mail fiscal e endereço. Ao salvar, o
 * backend re-tenta automaticamente as notas que tinham falhado por falta de dado.
 */
export function FiscalProfileCard({ enabled }: { enabled: boolean }) {
  const { data: profile, isLoading } = useCompanyFiscalProfile(enabled);
  const save = useSaveFiscalProfile();
  const [form, setForm] = useState<FormState>(EMPTY);
  const seededRef = useRef(false);

  useEffect(() => {
    if (profile && !seededRef.current) {
      setForm({
        legalName: profile.legalName ?? "",
        fiscalEmail: profile.fiscalEmail ?? "",
        street: profile.street ?? "",
        number: profile.number ?? "",
        complement: profile.complement ?? "",
        district: profile.district ?? "",
        cityIbgeCode: profile.cityIbgeCode ?? "",
      });
      seededRef.current = true;
    }
  }, [profile]);

  if (!enabled) return null;

  const set =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const isPj = profile?.companyType === "LEGAL_ENTITY";

  function handleSave() {
    save.mutate(
      {
        legalName: form.legalName.trim(),
        fiscalEmail: form.fiscalEmail.trim(),
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim(),
        district: form.district.trim(),
        cityIbgeCode: form.cityIbgeCode.trim(),
      },
      {
        onSuccess: (saved) =>
          toast.success(
            saved.complete
              ? "Dados fiscais salvos."
              : "Dados salvos, mas ainda faltam campos para emitir a nota."
          ),
        onError: (e) =>
          toast.error(
            e instanceof ApiError ? e.message : "Falha ao salvar os dados."
          ),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="text-primary size-4" />
          Dados fiscais (nota fiscal da comissão)
          {profile &&
            (profile.complete ? (
              <Badge
                variant="outline"
                className="border-success/40 text-success"
              >
                Completo
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-warning/40 text-warning"
              >
                Incompleto
              </Badge>
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-56" />
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Usados para emitir a NFS-e de cada comissão cobrada, com você como
              tomador do serviço. CNPJ/CPF, município e CEP vêm do seu cadastro.
            </p>

            <div className="text-muted-foreground grid grid-cols-2 gap-2 rounded-md border p-3 text-xs">
              <div>
                <span className="font-medium">Documento:</span>{" "}
                {profile?.taxId ?? "—"}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{" "}
                {isPj ? "Pessoa jurídica" : "Pessoa física"}
              </div>
              <div>
                <span className="font-medium">Município:</span>{" "}
                {profile?.city ?? "—"}
                {profile?.uf ? `/${profile.uf}` : ""}
              </div>
              <div>
                <span className="font-medium">CEP:</span> {profile?.cep ?? "—"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fp-legal-name">
                  Razão social {isPj ? "" : "/ nome completo"}
                </Label>
                <Input
                  id="fp-legal-name"
                  value={form.legalName}
                  onChange={set("legalName")}
                  placeholder={profile?.companyName ?? ""}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fp-email">E-mail fiscal</Label>
                <Input
                  id="fp-email"
                  type="email"
                  value={form.fiscalEmail}
                  onChange={set("fiscalEmail")}
                  placeholder="Para receber a nota emitida"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-street">Logradouro</Label>
                <Input
                  id="fp-street"
                  value={form.street}
                  onChange={set("street")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-number">Número</Label>
                <Input
                  id="fp-number"
                  value={form.number}
                  onChange={set("number")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-complement">Complemento</Label>
                <Input
                  id="fp-complement"
                  value={form.complement}
                  onChange={set("complement")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-district">Bairro</Label>
                <Input
                  id="fp-district"
                  value={form.district}
                  onChange={set("district")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-ibge">Código IBGE do município</Label>
                <Input
                  id="fp-ibge"
                  value={form.cityIbgeCode}
                  onChange={set("cityIbgeCode")}
                  placeholder="Opcional (7 dígitos)"
                />
              </div>
            </div>

            {isPj && (
              <p className="text-muted-foreground text-xs">
                Para pessoa jurídica, o endereço completo é obrigatório para
                emitir a nota.
              </p>
            )}

            <Button
              className="self-start"
              disabled={save.isPending}
              onClick={handleSave}
            >
              {save.isPending ? "Salvando…" : "Salvar dados fiscais"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
