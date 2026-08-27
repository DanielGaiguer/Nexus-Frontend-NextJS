"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BrandingImageField } from "@/components/custom-portal/branding-image-field";
import { PortalPreview } from "@/components/custom-portal/portal-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import type {
  BrandingImageKind,
  CustomPortalDTO,
  UpdateCustomPortalBrandingBody,
} from "@/types/custom-portal";

const DEFAULT_COLOR = "#5457e0";
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_SECTIONS = 10;

interface SectionForm {
  title: string;
  content: string;
}

function initialSections(portal: CustomPortalDTO): SectionForm[] {
  return (portal.sections ?? []).map((s) => ({
    title: s.title ?? "",
    content: s.content ?? "",
  }));
}

export function BrandingEditor({
  portal,
  onSaveBranding,
  onUploadImage,
  onDeleteImage,
  savingBranding,
}: {
  portal: CustomPortalDTO;
  onSaveBranding: (body: UpdateCustomPortalBrandingBody) => Promise<unknown>;
  onUploadImage: (kind: BrandingImageKind, file: File) => Promise<unknown>;
  onDeleteImage: (kind: BrandingImageKind) => Promise<unknown>;
  savingBranding: boolean;
}) {
  const [displayName, setDisplayName] = useState(portal.displayName ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    portal.primaryColor ?? DEFAULT_COLOR
  );
  const [aboutText, setAboutText] = useState(portal.aboutText ?? "");
  const [sections, setSections] = useState<SectionForm[]>(() =>
    initialSections(portal)
  );

  const colorValid = HEX_RE.test(primaryColor);
  const sectionMissingTitle = sections.some(
    (s) => !s.title.trim() && s.content.trim()
  );

  const dirty = useMemo(() => {
    const a = JSON.stringify({
      displayName: displayName.trim(),
      primaryColor: colorValid ? primaryColor.toLowerCase() : "",
      aboutText: aboutText.trim(),
      sections: sections.map((s) => ({
        title: s.title.trim(),
        content: s.content.trim(),
      })),
    });
    const b = JSON.stringify({
      displayName: portal.displayName?.trim() ?? "",
      primaryColor: portal.primaryColor?.toLowerCase() ?? "",
      aboutText: portal.aboutText?.trim() ?? "",
      sections: (portal.sections ?? []).map((s) => ({
        title: s.title?.trim() ?? "",
        content: s.content?.trim() ?? "",
      })),
    });
    return a !== b;
  }, [displayName, primaryColor, colorValid, aboutText, sections, portal]);

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateSection(index: number, patch: Partial<SectionForm>) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function handleSave() {
    if (primaryColor.trim() && !colorValid) {
      toast.error("Cor inválida. Use um valor como #4F46E5.");
      return;
    }
    if (sectionMissingTitle) {
      toast.error("Toda seção com texto precisa de um título.");
      return;
    }
    const body: UpdateCustomPortalBrandingBody = {
      displayName: displayName.trim() || null,
      primaryColor: colorValid ? primaryColor.toLowerCase() : null,
      aboutText: aboutText.trim() || null,
      sections: sections
        .map((s) => ({
          title: s.title.trim(),
          content: s.content.trim() || null,
        }))
        .filter((s) => s.title || s.content),
    };
    onSaveBranding(body)
      .then(() => toast.success("Aparência salva."))
      .catch((error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível salvar a aparência."
        )
      );
  }

  return (
    <div className="flex flex-col gap-4">
      {portal.status !== "ACTIVE" && (
        <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-md p-3 text-sm">
          <span className="font-medium">Edição liberada.</span>
          <span className="text-muted-foreground">
            A publicação da página pública depende da assinatura ativa.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {dirty ? "Alterações não salvas." : "Tudo salvo."}
            </p>
            <Button
              onClick={handleSave}
              disabled={!dirty || savingBranding || sectionMissingTitle}
            >
              <Save className="size-4" />
              {savingBranding ? "Salvando…" : "Salvar"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Identidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cp-display-name">Nome de exibição</Label>
                <Input
                  id="cp-display-name"
                  maxLength={120}
                  placeholder={portal.companyName}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  Aparece como título da página. Em branco, usa “
                  {portal.companyName}”.
                </p>
              </div>
              <BrandingImageField
                label="Logo"
                kind="LOGO"
                url={portal.logoUrl}
                aspect="square"
                hint="PNG, JPG ou WebP até 5MB. Fundo transparente recomendado."
                disabled={savingBranding}
                onUpload={onUploadImage}
                onDelete={onDeleteImage}
              />
              <BrandingImageField
                label="Banner"
                kind="BANNER"
                url={portal.bannerUrl}
                aspect="wide"
                hint="Imagem de capa larga (ex.: 1600×400). PNG, JPG ou WebP até 5MB."
                disabled={savingBranding}
                onUpload={onUploadImage}
                onDelete={onDeleteImage}
              />
              <BrandingImageField
                label="Favicon"
                kind="FAVICON"
                url={portal.faviconUrl}
                aspect="square"
                hint="Ícone da aba do navegador. PNG ou WebP quadrado até 5MB."
                disabled={savingBranding}
                onUpload={onUploadImage}
                onDelete={onDeleteImage}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="cp-color">Cor primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Selecionar cor primária"
                    className="size-9 shrink-0 cursor-pointer rounded border bg-transparent"
                    value={colorValid ? primaryColor : DEFAULT_COLOR}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <Input
                    id="cp-color"
                    className="w-32 font-mono"
                    placeholder={DEFAULT_COLOR}
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    aria-invalid={!!primaryColor.trim() && !colorValid}
                  />
                </div>
                <p
                  className={
                    !!primaryColor.trim() && !colorValid
                      ? "text-destructive text-xs"
                      : "text-muted-foreground text-xs"
                  }
                >
                  Aplicada a botões e destaques da página pública (não afeta o
                  Nexus). Formato #RRGGBB.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                placeholder="Fale sobre a empresa, a cultura, o momento…"
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Seções extras</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={sections.length >= MAX_SECTIONS}
                onClick={() =>
                  setSections((prev) => [...prev, { title: "", content: "" }])
                }
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma seção. Ex.: “Nossos valores”, “Benefícios”, “Como é
                  trabalhar aqui”.
                </p>
              )}
              {sections.map((section, index) => (
                <div key={index} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Título da seção"
                      maxLength={150}
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, { title: e.target.value })
                      }
                      aria-invalid={
                        !section.title.trim() && !!section.content.trim()
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, 1)}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        setSections((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      aria-label="Remover seção"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Texto da seção"
                    value={section.content}
                    onChange={(e) =>
                      updateSection(index, { content: e.target.value })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="text-muted-foreground mb-2 text-sm font-medium">
            Pré-visualização
          </div>
          <PortalPreview
            data={{
              displayName,
              primaryColor,
              logoUrl: portal.logoUrl,
              bannerUrl: portal.bannerUrl,
              faviconUrl: portal.faviconUrl,
              aboutText,
              sections,
              companyName: portal.companyName,
              subdomain: portal.subdomain,
              status: portal.status,
            }}
          />
        </div>
      </div>
    </div>
  );
}
