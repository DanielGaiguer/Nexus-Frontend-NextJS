"use client";

import { Eye } from "lucide-react";

import { PortalPreview } from "@/components/custom-portal/portal-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CustomPortalDTO } from "@/types/custom-portal";

/** "Ver prévia" — mostra a página pública como está salva agora, sem entrar no editor. */
export function PortalPreviewDialog({ portal }: { portal: CustomPortalDTO }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="size-4" />
          Ver prévia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévia da página pública</DialogTitle>
        </DialogHeader>
        <PortalPreview
          data={{
            displayName: portal.displayName ?? "",
            primaryColor: portal.primaryColor ?? "",
            logoUrl: portal.logoUrl,
            bannerUrl: portal.bannerUrl,
            faviconUrl: portal.faviconUrl,
            aboutText: portal.aboutText ?? "",
            sections: portal.sections.map((s) => ({
              title: s.title,
              content: s.content ?? "",
            })),
            companyName: portal.companyName,
            subdomain: portal.subdomain,
            status: portal.status,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
