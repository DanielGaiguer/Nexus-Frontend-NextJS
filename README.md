# nexus-frontend-next

Novo frontend do Nexus, em migração a partir do `nexus-frontend` (Spring Boot +
Thymeleaf + Bootstrap), telas por telas, nesta ordem de prompts. O
`nexus-frontend` **continua no ar em paralelo** até a paridade de telas ser
atingida — este projeto é só leitura do backend (`nexus`, Spring Boot puro em
`com.main.nexus`), que **não muda**.

## Stack

- Next.js 16 (App Router), TypeScript estrito, Tailwind v4 (`@theme` em
  `src/app/globals.css`, sem `tailwind.config.js`).
- shadcn/ui, estilo `new-york`, ícones lucide-react, `cssVariables: true`
  (ver `components.json`).
- TanStack Query para todo dado remoto — sem `useEffect` + `fetch` solto.
- sonner como único mecanismo de toast.
- ESLint (flat config) + Prettier + `prettier-plugin-tailwindcss` +
  `typescript-eslint` recomendado + `eslint-config-next`.
- Auth via BFF: Route Handlers (`src/app/api/auth/...`) fazem a ponte com o
  Spring Boot e setam o JWT como cookie **httpOnly**. O browser nunca vê o
  token.
- Deploy alvo: Vercel.

## Convenções (não se repita perguntando isso de novo)

- **Hooks de dado remoto**: um hook por operação, nunca um hook genérico.
  - Query: `src/hooks/queries/use<Entidade>.ts`
  - Mutation: `src/hooks/mutations/use<Ação><Entidade>.ts`
  - Query keys centralizadas como array simples, ex.:
    `const projectsKey = (filters) => ['projects', filters]`.
- **Componentes de negócio** em `src/components/<domínio>/`. Componentes
  shadcn "crus" ficam intocados em `src/components/ui/` (regenerados via
  `npx shadcn@3 add <componente>` — fixamos a major 3 do CLI porque a 4.x
  trocou o modelo de estilos para radix/base/aria e não tem mais
  `new-york`).
- **HTTP**: `src/lib/api-client.ts` é o único lugar que monta URL.
  - `backendFetch` — só server-side (Route Handlers/Server Components), fala
    direto com o Spring Boot via `BACKEND_URL`.
  - `apiFetch` — client components/hooks, chama rota relativa do próprio
    Next (`/api/...`); o cookie httpOnly viaja sozinho, same-origin.
  - Ambas lançam `ApiError` com `{status, message}` no mesmo formato que o
    `ApiExceptionHandler` do backend já devolve — joga `error.message` direto
    num `toast.error(...)`.
- **Tipos** em `src/types/`, espelhando 1:1 os DTOs reais do backend
  (`nexus/src/main/java/com/main/nexus/dto`). Não invente campo.
- **`'use client'`** só onde há interação/hooks de estado ou query.
  Privilegie Server Components quando a tela for majoritariamente leitura.

## Regra de modernização de UI (ao portar cada tela do Thymeleaf)

| Padrão antigo (`nexus-frontend`)         | Substituir por                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `alert-success`/`alert-danger` estáticos | Toast via `sonner`, disparado no `onSuccess`/`onError` da mutation       |
| `confirm()`/`alert()` nativos            | `AlertDialog` do shadcn/ui, com o texto claro da consequência            |
| Form com `submit` que recarrega a página | `useMutation`, sem reload, com invalidação de query + toast de resultado |
| Lista sem estado de carregamento visível | `Skeleton` enquanto `isLoading`, `EmptyState` reutilizável quando vazia  |

## Tema (dark/light)

`next-themes` com `attribute="class"`, `defaultTheme="dark"`,
`enableSystem={false}` (o toggle só oferece claro/escuro, não "sistema").

- **Dark** é herdado 1:1 da paleta que já existe hoje em
  `nexus-frontend/src/main/resources/static/css/style.css`
  (`--nexus-primary/secondary/accent/bg-1/2/3/success/warning/info/danger`).
- **Light** foi desenhado nesta migração (não existia em lugar nenhum do
  produto) — mesmos matizes de marca, escurecidos o suficiente para contraste
  AA em fundo claro. Ambos vivem em `src/app/globals.css`, mapeados tanto nos
  tokens semânticos do shadcn (`--primary`, `--background`, ...) quanto
  expostos como utilities extras (`bg-success`, `text-info`,
  `bg-nexus-bg-2`, ...).

Mobile-first em toda classe Tailwind: layout parte do mobile, `sm:`/`md:`/`lg:`
expandem — nunca o inverso.

## Auth (BFF) — mecânica implementada no Prompt 0

- `POST /api/auth/login` → chama `POST {BACKEND_URL}/api/auth/login`, e só se
  o backend confirmar, planta o JWT retornado (`LoginResponseDTO.token`) num
  cookie `nexus_token` httpOnly (`maxAge` de 1h, espelhando o
  `TokenService#generateToken` do backend). A resposta pro client nunca inclui
  o token.
- `POST /api/auth/logout` → apenas apaga o cookie (o backend não tem endpoint
  de logout; JWT é stateless).
- `src/proxy.ts` (equivalente ao antigo `middleware.ts` — renomeado no
  Next 16) verifica a assinatura do JWT via `jose` usando `JWT_SECRET` (env
  var própria do Next, que precisa ser **a mesma string** do
  `api.security.token.secret`/`JWT_SECRET` do `nexus/.env`) e redireciona pra
  `/login` quem tentar acessar uma rota fora de `PUBLIC_PATHS` sem sessão
  válida. Isso é só o gate de UX — a autorização de verdade continua sendo
  feita pelo Spring Boot em cada chamada de API.
- `/login` e `/dashboard` nesta etapa são **placeholders mínimos**, só para
  exercitar a mecânica ponta a ponta (form sem `react-hook-form`/`zod`/toast
  completo, dashboard sem dado real). A UI definitiva das duas entra no
  próximo prompt.
- **Sem refresh token**: o backend não expõe um endpoint de refresh hoje — só
  login com expiração fixa de 1h. Quando o JWT expirar, a próxima chamada de
  API volta 401, e a próxima navegação protegida é redirecionada pra
  `/login` pelo proxy. Não há renovação silenciosa.
- **Login social (LinkedIn/GitHub) fica fora do ciclo nesta fase**: o backend
  redireciona pós-OAuth pra `nexus.frontend.base-url` (hoje
  `http://localhost:8082`, o `nexus-frontend` antigo) e este projeto não
  mexe no backend. Só volta a fechar o ciclo quando você apontar essa env
  var pro Next (ou expuser um endpoint próprio pra isso).

## Setup local

```bash
npm install
cp .env.local.example .env.local   # preencha BACKEND_URL e JWT_SECRET
npm run dev                        # http://localhost:3000
```

`JWT_SECRET` precisa ser **idêntico** ao `JWT_SECRET` de `nexus/.env`
(`api.security.token.secret`) — é a mesma chave HS256, só lida aqui pra
verificar assinatura sem bater no backend a cada navegação.

## Scripts

- `npm run dev` — dev server (Turbopack).
- `npm run build` / `npm run start` — build e serve de produção.
- `npm run lint` — ESLint (Prettier entra como regra `prettier/prettier`,
  então `next lint`/`eslint` já cobre formatação).

## Estado desta etapa (Prompt 0)

Feito: projeto rodando, shadcn inicializado, ESLint/Prettier passando,
TanStack Query plugado, dark/light com paletas completas e toggle
funcional, mecânica de auth (login/logout/proxy) validada ponta a ponta
contra o backend real. Faltam as telas de negócio de verdade (auth com
campos completos, app shell com sidebar/header, dashboard com dado real) —
isso é o próximo prompt desta mesma migração.
