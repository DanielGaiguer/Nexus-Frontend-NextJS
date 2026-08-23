import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<string, { message: string }>(
    `/api/matches/company-interest-by-project${qs ? `?${qs}` : ""}`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
