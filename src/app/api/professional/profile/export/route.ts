import { proxyBinary } from "@/lib/route-handlers";

/** Exporta o perfil em PDF — admin passa ?professionalId=X, o dono chama sem param. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyBinary(
    `/api/professional/profile/export${qs ? `?${qs}` : ""}`,
    "application/pdf"
  );
}
