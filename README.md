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
contra o backend real.

## Estado desta etapa (Prompt 1)

Fatia fina completa: auth + shell + tema + responsivo + dado real, numa
área pequena, pra validar o padrão antes de replicar pras dezenas de telas
restantes.

- **Auth completo**: `/login`, `/register/professional`, `/register/company`,
  `/register/company/linkedin` (alcançável hoje só via link direto — o
  callback do LinkedIn ainda aponta pro `nexus-frontend` antigo, ver seção
  Auth acima) e `/register/success`, todos em `Form`/`Input`/`Card` do
  shadcn, `react-hook-form` + `zod`, toasts de erro com a mensagem exata que
  o backend devolve (e-mail duplicado, CNPJ duplicado, credencial inválida).
  Zero `alert()`/reload — cada form é uma `useMutation`.
- **App shell**: `src/app/(app)/layout.tsx` (route group) monta
  `AppShell` (`SidebarProvider` + `Sidebar` do shadcn — colapsa em `Sheet`
  no mobile automaticamente) com navegação condicionada a
  `session.role` (`src/components/shell/nav-config.ts`, espelhando
  `fragments/app-shell.html`). Header com toggle de tema e menu de usuário
  (avatar, e-mail, papel, logout).
- **Dashboard real**: `/pro/dashboard` e `/company/dashboard` consomem
  `/api/analytics/professional|company/dashboard` (dado real, via hook de
  query — `useProfessionalDashboard`/`useCompanyDashboard`), com `Skeleton`
  durante o carregamento. **Não é** o mesmo dashboard do `pro-dashboard.html`
  antigo (que compõe várias chamadas — convites, matches confirmados,
  portfólio, review pendente — sem endpoint único hoje); é o dashboard
  analítico (`ProfessionalDashboardAnalyticsDTO`/
  `CompanyDashboardAnalyticsDTO`), decisão tomada explicitamente nesta etapa
  para manter a fatia fina a um hook por página.
- `/admin/dashboard` é um placeholder — só prova que o gate de sessão e a
  navegação por papel também funcionam para ADMIN; a área de admin em si
  ainda não foi portada.
- Redirecionamento por papel: login (e o `proxy`, para quem já está
  autenticado e tenta voltar em `/login`/`/register/**`) manda
  `PROFESSIONAL` → `/pro/dashboard`, `COMPANY` → `/company/dashboard`,
  `ADMIN` → `/admin/dashboard`.
- Itens de navegação da sidebar que ainda não têm página própria (Matches,
  Oportunidades, Chat, Portfólio, ...) aparecem porque são a navegação real
  do produto — cada um vira 404 esperado até o prompt que o portar.

Faltam: as próprias telas atrás de cada item de navegação, perfil do
usuário (o menu "Meu perfil" está desabilitado de propósito), e o
dashboard "operacional" (convites/matches recentes) do antigo
pro-dashboard.html — isso é trabalho dos próximos prompts.

## Estado desta etapa (Prompt 2 — Onda Profissional, núcleo)

Sequenciamento combinado com o usuário (Prompt 2 é bem maior que os
anteriores): núcleo primeiro — perfil, portfólio, oportunidades, matches,
dashboard operacional. Diretório de empresas, analytics (recharts) e mapa
(react-leaflet) ficam para a continuação.

- **`/pro/profile`**: view + edição completa (`Dialog`, não modal Bootstrap)
  — dados pessoais, CEP→cidade/UF resolvido pelo backend no PUT, nível de
  experiência, tipos de oportunidade, pretensão salarial, LinkedIn/GitHub
  (como campo de URL simples — sem o fluxo de "salvar e já disparar o OAuth"
  do app antigo, que não fecha o ciclo aqui mesmo). Skills via combobox
  (`Command`+`Popover`) contra o catálogo completo
  (`GET /api/professional/skills`), cruzando por nome com o perfil pra saber
  o que já está selecionado — mesma técnica que o controller Spring MVC
  antigo usava. Certificados/eventos como CRUD completo. Reputação detalhada
  vem de `GET /api/public/professional/{id}` (o `ProfessionalProfileDTO`
  "privado" só tem a nota geral, não o breakdown).
  - **Simplificação deliberada**: upload de foto sem o corte client-side
    (cropperjs) que o app antigo tinha — envia o arquivo selecionado direto,
    o backend não exige proporção quadrada.
  - Score simulado (widget do modal de edição) é um porte 1:1 de
    `nexus-score-simulator.js` (`src/lib/score-simulator.ts`) — uma
    estimativa client-side com pesos fixos, não a fórmula real de matching;
    nunca é enviada pra API.
- **`/pro/portfolio`**: CRUD de `PreviousProject` (`Dialog` de
  criar/editar, `AlertDialog` de excluir). Tecnologias como campo de texto
  separado por vírgula, em vez do widget de chips dinâmico do app antigo.
- **`/pro/opportunities`**: lista de `MatchResponseDTO` em `WAITING`, busca
  por título/empresa + filtro de tipo (vaga/projeto) client-side, botão
  "Demonstrar interesse". **Simplificação**: só isso — o painel de 9 filtros
  do app antigo (modalidade, faixa salarial, skills, data, ...) não foi
  portado nesta passada.
- **`/pro/matches`**: 5 abas (Convites, Enviados, Confirmados, Anteriores,
  Recusados). Aceitar é direto; recusar é sempre via `AlertDialog` com
  motivo obrigatório (nunca `confirm()`) — grid de checkboxes
  (`ProfessionalRejectionReason`) + descrição opcional, botão de confirmar
  só habilita com ≥1 motivo marcado. Contato da empresa (matches
  confirmados) é revelado sob demanda (`GET /api/company/{id}/contact`).
  "Ver histórico" (timeline de status cross-changed) do app antigo não foi
  portado nesta passada.
- **`/pro/dashboard`** upgrade: além do dashboard analítico do Prompt 1,
  ganhou os cards operacionais do `pro-dashboard.html` original — convites
  pendentes, matches confirmados, vagas disponíveis (`/api/professional/stats`),
  projetos no portfólio, e as listas de "últimos convites"/"matches
  confirmados".
- Menu "Meu perfil" no header agora linka pra `/pro/profile` (só para
  `PROFESSIONAL` — `COMPANY` continua desabilitado até `/company/profile`
  existir).

### Bug de backend encontrado (não corrigido — fora do escopo deste projeto)

`PUT /api/professional/projects/{id}` (editar item do portfólio) devolve
**500** sempre: `PreviousProjectService.update()` (linha 81) lança
`UnsupportedOperationException` dentro do merge do Hibernate
(`CollectionType.replaceElements` tentando `.clear()` numa lista imutável
associada ao campo `technologies`). Confirmado batendo direto no backend
(`curl` sem passar pelo Next) — não é um problema de contrato/formato vindo
do frontend. `POST`/`DELETE` de portfólio e todo o CRUD de
credentials (`/api/professional/credentials/{id}`) funcionam normalmente; só
a edição de um `PreviousProject` já existente quebra. A UI do
`/pro/portfolio` já está pronta pra quando isso for corrigido no backend —
o botão de editar existe e monta o payload certo, só vai receber o toast de
erro (`error.message` do 500) até lá.

### Validado ponta a ponta contra o backend real

`GET`/`PUT` de perfil, `PUT` de skills, `POST`/`DELETE` de previous
project, `POST`/`PUT`/`DELETE` de credentials, `GET` de
opportunities/matches (invites/sent/previous/all), `POST` de demonstrar
interesse e `POST` de cancelar match (ciclo completo: interesse →
aparece em "sent" → cancela → some) — tudo via `curl` autenticado com
cookie real, mais `build`/`lint`/`typecheck` limpos.
