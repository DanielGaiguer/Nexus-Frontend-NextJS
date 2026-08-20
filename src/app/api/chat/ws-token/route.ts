import { NextResponse } from "next/server";

import { getSessionToken } from "@/lib/session";
import type { WsTokenDTO } from "@/types/chat";

/**
 * Não é um `proxyToBackend` normal — não repassa pro Spring, só devolve o
 * JWT cru da sessão pro client abrir a conexão STOMP.
 *
 * Por quê: o handshake STOMP (`ChatWebSocketHandler`/`WebSocketAuthInterceptor`
 * no backend) autentica lendo um header nativo `Authorization` no frame
 * CONNECT — não usa cookie nenhum, é um mecanismo de auth propositalmente
 * separado do `JwtFilter` REST. Como o browser conecta *direto* no backend
 * (`BACKEND_URL`, sem passar pelo Next), e um cookie httpOnly não pode ser
 * lido por JS pra virar esse header, o JWT precisa sair do cookie por um
 * instante — exatamente como o `nexus-frontend` (Thymeleaf) já faz hoje via
 * `ChatBffController#getWsToken` (mesma superfície de exposição, não é uma
 * regressão de segurança em relação ao app em produção).
 */
export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sessão inválida ou expirada." },
      { status: 401 }
    );
  }

  const wsBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  return NextResponse.json<WsTokenDTO>({ token, wsBaseUrl });
}
