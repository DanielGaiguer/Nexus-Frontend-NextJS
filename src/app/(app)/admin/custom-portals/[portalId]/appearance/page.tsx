"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { BrandingEditor } from "@/components/custom-portal/branding-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminDeleteCustomPortalImage,
  useAdminUpdateCustomPortalBranding,
  useAdminUploadCustomPortalImage,
} from "@/hooks/mutations/useAdminCustomPortalBranding";
import { useAdminCustomPortalDetail } from "@/hooks/queries/useAdminCustomPortals";

export default function AdminCustomPortalAppearancePage() {
  const params = useParams<{ portalId: string }>();
  const portalId = Number(params.portalId);
  const detail = useAdminCustomPortalDetail(portalId);

  const save = useAdminUpdateCustomPortalBranding();
  const upload = useAdminUploadCustomPortalImage();
  const remove = useAdminDeleteCustomPortalImage();

  const portal = detail.data?.portal;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <Link
          href="/admin/custom-portals"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Plataformas personalizadas
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {portal ? `Aparência — ${portal.companyName}` : "Aparência"}
        </h1>
        {portal && (
          <p className="text-muted-foreground text-sm">
            {portal.subdomain}.nexus.com.br
          </p>
        )}
      </div>

      {detail.isLoading ? (
        <Skeleton className="h-96" />
      ) : portal ? (
        <BrandingEditor
          portal={portal}
          savingBranding={save.isPending}
          onSaveBranding={(body) => save.mutateAsync({ portalId, ...body })}
          onUploadImage={(kind, file) =>
            upload.mutateAsync({ portalId, kind, file })
          }
          onDeleteImage={(kind) => remove.mutateAsync({ portalId, kind })}
        />
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Plataforma não encontrada.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
