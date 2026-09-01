"use client";

import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateFiscalConfig } from "@/hooks/mutations/useNfseActions";
import { useFiscalConfig } from "@/hooks/queries/useNfse";
import { ApiError } from "@/lib/api-client";

export default function AdminFiscalConfigPage() {
  const { data: config, isLoading } = useFiscalConfig();
  const update = useUpdateFiscalConfig();
  const [empresaId, setEmpresaId] = useState("");
  const [description, setDescription] = useState("");
  const seededRef = useRef(false);

  // Semeia os campos com o valor atual só na primeira vez — um refetch em
  // segundo plano não deve sobrescrever o que o admin está digitando.
  useEffect(() => {
    if (config && !seededRef.current) {
      setEmpresaId(config.enotasEmpresaId ?? "");
      setDescription(config.defaultServiceDescription ?? "");
      seededRef.current = true;
    }
  }, [config]);

  const dirty =
    config != null &&
    (empresaId.trim() !== (config.enotasEmpresaId ?? "") ||
      description.trim() !== (config.defaultServiceDescription ?? ""));

  function handleSave() {
    update.mutate(
      {
        enotasEmpresaId: empresaId.trim(),
        defaultServiceDescription: description.trim(),
      },
      {
        onSuccess: (saved) => {
          setEmpresaId(saved.enotasEmpresaId ?? "");
          setDescription(saved.defaultServiceDescription ?? "");
          toast.success("Configuração fiscal atualizada!");
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar a configuração."
          ),
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configuração fiscal
        </h1>
        <p className="text-muted-foreground text-sm">
          Dados que o Nexus usa para emitir a NFS-e de cada comissão cobrada,
          via eNotas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="text-primary size-4" />
            Emissor no eNotas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="empresa-id">ID da empresa no eNotas</Label>
                <Input
                  id="empresa-id"
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  placeholder="ex.: 7f2c1e90-..."
                />
                <p className="text-muted-foreground text-xs">
                  O CNPJ, a inscrição municipal, o regime tributário, o código
                  de serviço e o certificado ficam no painel do eNotas. Aqui só
                  o identificador da empresa emitente. A API key vai na variável
                  de ambiente <code>ENOTAS_API_KEY</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service-description">
                  Descrição padrão do serviço
                </Label>
                <Textarea
                  id="service-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comissão pela intermediação de contratação — Nexus"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  disabled={!dirty || update.isPending}
                  onClick={handleSave}
                >
                  {update.isPending ? "Salvando…" : "Salvar"}
                </Button>
                {config && (
                  <span className="text-xs">
                    {config.nfseEnabled ? (
                      config.simulated ? (
                        <span className="text-warning font-medium">
                          Modo de teste (sem eNotas)
                        </span>
                      ) : (
                        <span className="text-success font-medium">
                          Emissão ativa
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Emissão desligada — falta a API key ou o ID da empresa.
                      </span>
                    )}
                  </span>
                )}
              </div>

              {config?.updatedAt && (
                <p className="text-muted-foreground text-xs">
                  Última alteração em{" "}
                  {new Date(config.updatedAt).toLocaleString("pt-BR")}
                  {config.updatedByAdminEmail
                    ? ` por ${config.updatedByAdminEmail}`
                    : ""}
                  .
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-muted-foreground space-y-2 text-sm">
        <p>
          Quando uma comissão é confirmada como paga, o Nexus emite
          automaticamente a NFS-e tendo o contratante como tomador do serviço. A
          nota fica disponível para o contratante em{" "}
          <strong className="text-foreground">Pagamento</strong> e para o Admin
          em <strong className="text-foreground">Notas fiscais</strong>.
        </p>
        <p>
          Emissões que falharem (ex.: dados fiscais do contratante incompletos)
          vão para a fila de{" "}
          <strong className="text-foreground">Notas fiscais</strong> sem travar
          o restante do fluxo financeiro.
        </p>
      </div>
    </div>
  );
}
