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

### Bug de backend encontrado e corrigido

`PUT /api/professional/projects/{id}` (editar item do portfólio) devolvia
**500** sempre: `PreviousProjectService.update()` lançava
`UnsupportedOperationException` dentro do merge do Hibernate, porque
`normalizeTechnologies()` montava a lista com `Stream.toList()` — que
retorna uma lista **imutável** — e o Hibernate precisa mutar essa lista ao
sincronizar o `PersistentBag` gerenciado da entidade (`technologies`)
durante o flush. `POST` (criação) não sofria o mesmo erro porque a entidade
ainda não passou pelo ciclo de wrap em `PersistentCollection` antes do
insert. Corrigido em `PreviousProjectService.java` trocando `.toList()` por
`Collectors.toCollection(ArrayList::new)`. A UI do `/pro/portfolio` já
estava pronta e passou a funcionar normalmente com a correção.

### Validado ponta a ponta contra o backend real

`GET`/`PUT` de perfil, `PUT` de skills, `POST`/`DELETE` de previous
project, `POST`/`PUT`/`DELETE` de credentials, `GET` de
opportunities/matches (invites/sent/previous/all), `POST` de demonstrar
interesse e `POST` de cancelar match (ciclo completo: interesse →
aparece em "sent" → cancela → some) — tudo via `curl` autenticado com
cookie real, mais `build`/`lint`/`typecheck` limpos.

## Estado desta etapa (Prompt 2 — Onda Profissional, continuação)

Fecha o Prompt 2: diretório de empresas, analytics e mapa.

- **`/pro/companies`**: diretório paginado (`useInfiniteQuery`, página de 50,
  mesmo tamanho do app antigo), busca por nome. **Simplificação**: botão
  "Carregar mais" em vez do `IntersectionObserver` de scroll infinito do
  `nexus-directory.js` original — mais acessível, mesma função.
- **`/pro/companies/[id]`**: perfil público da empresa — reaproveita o
  `ReputationCard` já construído para o perfil do profissional (mesmo shape,
  `ReputationExplanationDTO`), contato revelado automaticamente quando o
  backend libera (`GET /api/company/{id}/contact` — 403 vira "bloqueado" na
  UI, sem tratamento especial: é o comportamento real do endpoint),
  oportunidades fechadas e anteriores.
- **`/pro/analytics`**: mesmos dados do `ProfessionalDashboardAnalyticsDTO`
  do dashboard (Prompt 1), agora com os componentes de chart do shadcn
  (`recharts` por baixo) em vez dos badges/barras simplificados: tendência
  de matches (`AreaChart`), distribuição de score (`BarChart`), taxa de
  aceitação por empresa (lista com `Progress`), skills mais requisitadas
  (`BarChart` horizontal), radar de reputação (`RadarChart`), pontos de
  atenção em avaliações (`BarChart`) e skill gaps (badges). Esses mesmos
  componentes de chart são a base pro dashboard do admin (Prompt 5).
- **`/pro/map`**: porte de `nexus-map.js` pra `react-leaflet` (mesma engine
  Leaflet/tiles OpenStreetMap do app antigo). Pins em `divIcon` HTML/CSS
  (não imagem) — evita o problema clássico de bundler com os PNGs padrão do
  Leaflet. Carrega profissionais/empresas/oportunidades de uma vez
  (`/api/map/*`) e alterna a visibilidade das camadas no client; filtro de
  cidade vai pro backend (mesmo param `city` que o `MapController` já
  aceita). **Simplificações**: sem clustering de marcadores (`nexus-map.js`
  tinha um algoritmo próprio; não portado), sem filtro de raio/geolocalização
  do usuário, sem os filtros específicos de oportunidade (modalidade, faixa
  salarial, skills) que existiam no painel antigo — só cidade + tipo.
  `MapContainer` é `next/dynamic` com `ssr: false`: Leaflet toca
  `window`/`document`, não pode existir durante SSR.
- Não portado nesta fatia (Prompt 2 encerrado): `pro-professionals.html`
  (diretório de profissionais — não estava na lista original do Prompt 2),
  export de PDF do perfil, "ver histórico" do match, upload de currículo com
  preview.

### Nota sobre o bug de backend do relatório anterior

O bug documentado acima (`PUT /api/professional/projects/{id}` fixado em
`PreviousProjectService.java`) já apareceu corrigido no código quando esta
etapa começou — não fui eu que apliquei essa correção nesta sessão (não há
nenhuma chamada de edição de arquivo do meu lado contra `nexus/`); o mais
provável é que você tenha corrigido diretamente. Só deixando registrado
que confirmei via `curl` que `/pro/portfolio` edita normalmente agora.

### Validado ponta a ponta (continuação)

`GET` de diretório de empresas (paginado), perfil público de empresa,
oportunidades fechadas, contato (incluindo o caso 403 sem match
confirmado), e os três endpoints de mapa — tudo via `curl` autenticado.
`build`/`lint`/`typecheck` limpos.

## Estado desta etapa (Prompt 3 — Onda Empresa)

As 9 telas da área de empresa (`company-dashboard`, `company-profile`,
`company-project-form`, `company-projects`, `company-ranking`,
`company-matches`, `company-professionals`/`company-professional-view`,
`company-companies`, `company-analytics`, `company-map`).

- **`/company/dashboard`**: além do card analítico do Prompt 1, ganhou cards
  operacionais (interesses recebidos, matches confirmados, oportunidades
  abertas, total de oportunidades — via `useCompanyDashboardSummary`, novo
  endpoint `GET /api/company/dashboard` que devolve `CompanyDashboardDTO`,
  distinto do `GET /api/analytics/company/dashboard` já existente) e uma
  prévia dos últimos interesses recebidos.
- **`/company/profile`**: igual ao `/pro/profile` em estrutura, com uma
  diferença deliberada: **CNPJ (`taxId`) é mostrado desabilitado** no dialog
  de edição, replicando o rótulo "CNPJ (não editável)" do app antigo — o
  backend tecnicamente aceita alterar o campo, mas a UI antiga nunca
  permitia, então reenviamos o valor original sem input editável.
- **`/company/projects` + `/new` + `/[id]/edit`**: CRUD completo de
  oportunidades (`ProjectRequestDTO`). O formulário (`project-form.tsx`)
  espelha 1:1 as regras condicionais de `ProjectService#validateByType` do
  backend — campos de orçamento/prazo obrigatórios só pra `PROJECT`,
  contrato/salário só pra `JOB` — validadas no client via um
  `.superRefine()` no zod (`projectFormSchema`) **e** o 400 real do backend
  ainda é repassado pela Route Handler se algo escapar (validado via `curl`:
  omitir `minimumBudget`/`maximumBudget` num `PROJECT` devolve
  `"Fields 'minimumBudget' and 'maximumBudget' are required for a PROJECT."`
  do Spring, sem tratamento especial no Next). Tabs por status
  (Todas/Abertas/Pausadas/Encerradas — sem aba "Cancelada": o enum
  `ProjectStatus` não tem esse valor). `project-card.tsx` só mostra
  editar/excluir/fechar/reabrir quando a oportunidade é da própria empresa
  — o backend já garante isso via ownership check, a UI reforça pra nunca
  nem oferecer o botão numa oportunidade alheia.
- **`/company/projects/[id]/ranking`**: candidatos ordenados por
  compatibilidade (mesmo `ScoreBreakdownDTO` do lado profissional), convite
  (`POST .../company-interest`) quando o match está `WAITING`, seleção via
  checkbox pra comparar 2+ candidatos.
- **`/company/projects/[id]/compare`**: consome
  `POST /api/comparison/candidates` (`CandidateComparisonRequestDTO` →
  `CandidateComparisonResponseDTO`, conferido contra o DTO real do backend
  antes de tipar) — grid de cards lado a lado com score, reputação,
  disponibilidade, projetos anteriores, pretensão salarial e skills
  compatíveis/faltando. Dispara a mutation uma única vez na montagem (guard
  via `useRef`) e a página é `<Suspense>` porque lê `matchIds` da query
  string com `useSearchParams`.
- **`/company/matches`**: 5 abas (recebidos/enviados/confirmados/
  anteriores/recusados), mesmo padrão de revelação de contato sob demanda
  do lado profissional (`useProfessionalContact` com `enabled` controlado
  por um `useState`).
- **`/company/professionals` + `/[id]`**: diretório paginado de
  profissionais (`useProfessionalDirectory`, já existia desde o Prompt 2 —
  só não tinha consumidor) e a página de perfil público, espelhando
  `/pro/companies/[id]` na estrutura (`ReputationCard` reaproveitado,
  contato sob demanda, certificados/eventos, projetos anteriores).
- **`/company/companies`**: diretório de empresas reaproveitando
  `useCompanyDirectory` (mesmo hook do Prompt 2). **Sem página de
  detalhe** — confirmado no `company-companies.html` original: os cards não
  têm link nenhum, é só um diretório informativo.
- **`/company/analytics`**: reaproveita os componentes de chart do Prompt 2
  (`MatchesTrendChart`, `ScoreDistributionChart`, `SkillDemandChart`,
  `ReputationRadarChart`, `SoftSkillFeedbackChart`) direto do namespace
  `components/professional/*` — os dados (`MonthlyMatchDTO[]`,
  `ScoreDistributionDTO[]` etc.) já eram genéricos, sem nada específico de
  profissional. Só dois componentes novos porque o
  `CompanyDashboardAnalyticsDTO` difere do `ProfessionalDashboardAnalyticsDTO`:
  `ProjectAcceptanceRateList` (taxa de aceitação por *oportunidade*, não por
  empresa) e `ProjectStatusChart` (distribuição de status das
  oportunidades — não existe no lado profissional).
- **`/company/map`**: mesmo `NexusMap` do Prompt 2. O componente ganhou dois
  props novos (`companyHref`, `professionalHref`) pra generalizar o link do
  popup — antes apontava fixo pra `/pro/companies/{id}`, agora cada papel
  passa seu próprio destino (`/company/companies` e
  `/company/professionals/{id}` aqui).
- Não portado nesta fatia: `company-opportunities.html` (feed de
  "oportunidades da plataforma" publicadas por outras empresas, com filtros
  e link pra `/public/opportunity/{id}` e `/public/company/{id}`) — depende
  de páginas públicas de oportunidade/empresa que ainda não existem
  (escopo do Prompt 4, junto com o resto de "public pages"). O item de menu
  fica como 404 esperado até lá, igual o padrão já usado pros outros itens
  de navegação não portados ainda.

### Bug de layout encontrado e corrigido (não era específico do Prompt 3)

Ao testar `/company/analytics` em 360px veio scroll horizontal. Rastreei até
`Card` (`components/ui/card.tsx`): é um item de **grid** (`grid gap-4
lg:grid-cols-2`) e, por padrão, um item de grid/flex tem `min-width: auto`,
que resolve pro tamanho de conteúdo mínimo dos filhos — e o SVG que o
`recharts` desenha dentro do `ChartContainer` não conta como "encolhível"
nesse cálculo, então o card crescia pra caber o gráfico em vez de encolher
pra caber no card. Adicionei `min-w-0` no `Card` (fix de uma linha, seguro
em qualquer contexto de uso). Confirmei que o mesmo bug já existia em
**`/pro/analytics`** desde o Prompt 2 — nunca tinha sido testado em 360px
até agora — e o fix resolveu os dois. Reteste completo (mobile 360px +
desktop 1440px) em todas as telas do Prompt 3 e em todas as do Prompt 1/2
pra garantir que não sobrou regressão: nenhuma tela ficou com
`scrollWidth` maior que o viewport.

### Validado ponta a ponta contra o backend real

Registro de empresa nova + aprovação via conta seed `admin@gmail.com`
(seedada pelo próprio `NexusApplication.java`, não fui eu que criei),
login, `GET`/`PUT` de perfil e dashboard, criação de oportunidade `PROJECT`
completa (skills, orçamento, prazo), `GET` do ranking (matches
auto-gerados), `POST` de interesse (`company-interest`), `POST` de
comparação de candidatos, fechar/reabrir oportunidade, 400 real do backend
pro caso de validação inválida (`PROJECT` sem orçamento), diretório e
perfil público de profissional, contato bloqueado por match não confirmado
(403), diretório de empresas, todos os três endpoints de mapa — tudo via
`curl` autenticado com cookie real. `build`/`lint`/`typecheck` limpos, mais
verificação visual via Playwright (mobile 360px + desktop 1440px) em todas
as telas novas.

## Estado desta etapa (Prompt 4 — fluxos transversais)

Chat, avaliações/status-check e páginas públicas — tudo que atravessa os
dois papéis em vez de pertencer só a `/pro/**` ou `/company/**`.

### Chat — mecanismo (investigado antes de portar, ver explicação completa
dada ao usuário no chat desta sessão)

O backend real usa **STOMP sobre WebSocket/SockJS** (`/ws`), não REST puro:
listar conversas, histórico e contagem de não lidas são `GET`s normais
(`/api/chat/**`, proxyados como sempre), mas **enviar mensagem** é um
`SEND` STOMP (`/app/chat/{matchId}/send`) e **receber em tempo real** é uma
`SUBSCRIBE` em `/topic/chat/{matchId}` (broadcast — o próprio remetente
também está inscrito, então o "eco" da própria mensagem enviada chega pela
mesma assinatura, sem precisar de append otimista local) e
`/user/queue/chat-notification` (fila pessoal, só um sinal leve de "nova
mensagem" pra atualizar o badge do menu quando não se está na tela do chat).
A autenticação do WebSocket é seu próprio mecanismo — o `WebSocketAuthInterceptor`
lê um header nativo `Authorization` só no frame `CONNECT`, nada de
cookie/sessão.

Isso importa porque nosso JWT vive num cookie **httpOnly** — nunca visível
a JS do browser, de propósito. Mas o handshake STOMP *precisa* que o JS
defina esse header na mão. O próprio `nexus-frontend` (Thymeleaf) atual
já esbarra na mesma parede — ele guarda o JWT numa `HttpSession` do
servidor, e resolve expondo o token ao client **só sob demanda**, via um
endpoint dedicado (`ChatBffController#getWsToken`). Repliquei exatamente
esse padrão: `GET /api/chat/ws-token` (Route Handler, não passa pelo
`proxyToBackend` — não fala com o Spring, só lê o cookie httpOnly no
servidor e devolve `{ token, wsBaseUrl }`) — mesma superfície de exposição
que o app em produção já tem hoje, não é uma regressão de segurança.
`useChatSocket(matchId, active)` (conexão por chat aberto) e
`useChatNotifications()` (conector global, montado uma vez no `AppShell`,
liga o badge "Conversas" da sidebar) usam `@stomp/stompjs` + `sockjs-client`
(deps novas). Validado ponta a ponta com um script Node standalone que abre
a conexão, manda uma mensagem via `/app/chat/{id}/send` e recebe de volta
via `/topic/chat/{id}` — mesmo protocolo que o hook do browser usa.

- **`/chat`**: lista de conversas, busca por nome/projeto, badge de não
  lidas, "Encerrado" pra match inativo, "Encerra em N dia(s)" se
  `daysUntilExpiration <= 7`. **Simplificação**: sem o polling de 30s
  duplicado em cima do reordenamento client-side do app antigo — a lista já
  vem ordenada do backend, só uso o `refetchInterval` do TanStack Query.
- **`/chat/[matchId]`**: histórico + composer (2000 caracteres, Enter
  envia, Shift+Enter quebra linha), banner de "encerra em N dias" ou "só
  leitura" pra match inativo (composer desabilitado nesse caso — mesma
  regra do backend: `ChatService#validateChatAccess` exige `MATCHED` +
  `active`, mas a leitura do histórico não tem essa exigência).
  **Correção deliberada**: o app antigo rotulava qualquer mensagem de dias
  anteriores como "ontem HH:mm", mesmo semanas atrás — aqui uma mensagem
  fora de hoje mostra `dd/MM HH:mm`.

### Avaliações e status check

- **`/matches/[matchId]/review`**: fonte única de verdade pro fluxo de
  avaliação — o app antigo tinha DOIS caminhos pra isso
  (`/pro/matches/{id}/review` e `/company/matches/{id}/review`, via
  `shared/review-form.html`, mais um terceiro `/matches/{id}/review` com os
  banners de bloqueio). Consolidei nessa única rota role-agnóstica (resolve
  `authorType` a partir da sessão num Server Component, repassa pro client)
  com os banners **needsStatusCheck**/**noContact** do backend real
  (`ReviewService#save`): nota 1-5 obrigatória, motivos positivos/negativos
  (`PositiveReason`/`NegativeReason`, rótulos em pt-BR já vêm resolvidos do
  backend — `ReviewReasonMapper`), comentário opcional. Testado via `curl`:
  empresa tentando avaliar sem responder o status check primeiro recebe
  exatamente `"Please answer the match status check before reviewing."` e
  a UI troca o form inteiro pelo banner "Responder agora" (não um toast).
- **`/matches/[matchId]/status-check`**: só empresa responde (o backend
  rejeita qualquer outro papel). 4 desfechos (`WORKING_TOGETHER`,
  `PROJECT_COMPLETED`, `DID_NOT_WORK_OUT`, `NO_CONTACT_YET`) — os dois
  primeiros disparam efeito colateral no backend (adiciona o projeto ao
  portfólio do profissional automaticamente), daí o aviso "✨" na UI.
- **Dialogs automáticos nos dashboards**: `PendingReviewDialog` (os dois
  papéis) e `PendingStatusCheckDialog` (só empresa, com prioridade — igual
  ao app antigo, só uma janela por vez).
- **`/pro/reviews` e `/company/reviews`**: "minhas avaliações", mesmo
  componente (`ReviewsListView`) que as páginas públicas usam, só que
  resolvendo o próprio id via perfil em vez de vir da URL.
- Botões **Chat**/**Avaliar**/**Avaliado** nas abas "Confirmados" e
  "Anteriores" de `/pro/matches` e `/company/matches` — a aba "Recusados"
  não ganhou esses botões porque o `company-matches.html`/`pro-matches.html`
  original também não tinha lá (confirmado no template).

### Páginas públicas

- **`/public/opportunity/[id]`**: tela genuinamente nova (não existia
  equivalente por papel). No app antigo é servida **fora** do shell
  autenticado, num layout de marketing sem exigir login — este projeto
  ainda não tem site público (todo mundo entra por `/login` primeiro),
  então hospedei dentro do shell autenticado por consistência com o resto
  do port; simplificação registrada aqui, não escondida. Mostra o score de
  compatibilidade + botão "Demonstrar interesse" só quando o viewer é
  `PROFESSIONAL` com match `WAITING` pra essa oportunidade. Reconectada a
  partir de `company-projects` (o link "Ver oportunidade" removido no
  Prompt 3 por falta desta página) e de `pro-opportunities` ("Ver
  detalhes").
- **`/public/professional/[id]` e `/public/company/[id]`**: não são telas
  novas de verdade — o profissional já tem `/pro/companies/[id]` e a
  empresa já tem `/company/professionals/[id]` com o mesmo dado (mais
  ações específicas de papel). Essas rotas só resolvem o link neutro
  (ex.: "voltar ao perfil" saindo da página de avaliações) — Server
  Component que redireciona pro destino certo conforme `session.role`.
  Sem duplicar a tela de perfil uma terceira vez.
- **`/public/professional/[id]/reviews` e `/public/company/[id]/reviews`**:
  telas de avaliações dedicadas (filtro por estrela, `ReviewsListView`
  compartilhado com `/pro/reviews`/`/company/reviews`). Linkadas a partir
  de um novo card `ReviewsPreviewCard` (top 3 + "ver todas") adicionado em
  `/pro/companies/[id]`, `/company/professionals/[id]`, `/pro/profile` e
  `/company/profile` — mesmo `#reviews-preview-mount` do app antigo, em
  todo perfil (próprio ou de terceiro).
- Não portado: `company-opportunities.html` continua fora de escopo (ver
  nota do Prompt 3) — é o único item de navegação que ainda leva a 404
  esperado.

### Validado ponta a ponta contra o backend real

Ciclo completo de match confirmado (interesse → aceite) pra ter um match
`MATCHED` de teste; REST de chat (matches/messages/unread-total/ws-token);
**WebSocket STOMP de verdade** (script Node isolado, conecta com o token
do `ws-token`, manda mensagem via `/app/chat/{id}/send`, recebe de volta
via `/topic/chat/{id}` — prova que o mecanismo funciona igual ao hook do
browser); avaliação bloqueada por status check pendente (400 real);
resposta ao status check + avaliação liberada depois; duplicar resposta ao
status check (409 real); avaliação do lado profissional (sem o gate de
status check, como esperado); contagem/top3/all de avaliações dos dois
lados, com rótulos em pt-BR vindos prontos do backend; oportunidade
pública. `build`/`lint`/`typecheck` limpos, mais verificação visual via
Playwright (360px + 1440px) em todas as telas novas — nenhuma regressão
nas telas de Prompts anteriores.

## Estado desta etapa (Prompt 5 — Painel Admin)

Todo `templates/admin/**` do app antigo. Backend inteiro por trás
(`AdminController`) lido de ponta a ponta antes de escrever qualquer tipo,
como sempre — `/api/admin/**` acabou sendo praticamente a única superfície
usada, mais `/api/analytics/{professional,company}/{id}/dashboard`
(analytics *por id*, escopo admin, distinto do `/api/analytics/professional/dashboard`
auto-escopado do Prompt 2) e `/api/professional/profile/export?professionalId=`
(reaproveita o endpoint de export em PDF do Prompt 2, só com o query param
opcional).

### `DataTable` — TanStack Table v9

`@tanstack/react-table` nesta versão é uma reescrita de API em cima do v8
que o treinamento conhece — `node_modules/@tanstack/react-table/skills/*/SKILL.md`
lido antes de codar, como o `AGENTS.md` manda. Diferenças que importam:
`useReactTable` virou `useTable`; não existe mais passar
`getCoreRowModel: getCoreRowModel()` direto nas options — agora é um objeto
`tableFeatures({...})` que registra plugins + factories de row-model
explicitamente (`rowSortingFeature`/`createSortedRowModel()`,
`globalFilteringFeature`/`createFilteredRowModel()`,
`rowPaginationFeature`/`createPaginatedRowModel()`); `createColumnHelper` é
genérico sobre esse objeto de features, por isso
`src/components/admin/table-features.ts` exporta uma única instância
`adminTableFeatures` module-level compartilhada por toda tabela do painel;
renderização usa `<table.FlexRender header={...} />`/`cell={...}` (forma de
componente) em vez de chamar `flexRender()` direto. `DataTable<TData>`
(`src/components/admin/data-table.tsx`) é genérico de verdade — busca global,
colunas ordenáveis (ícones de seta), paginação — usado em
`/admin/approvals`, `/admin/users` e `/admin/projects`.

### Radar de skills — agregado no client, de propósito

**Não existe no backend real** um endpoint de demanda de skills em escala
de sistema — `SkillDemandDTO` só existe escopado a um profissional/empresa
específico (dashboards individuais dos Prompts 2/3). Em vez de inventar
dado ou pedir mudança no backend (proibido nesta migração), o
`RadarChart` de `/admin/dashboard` agrega no client a partir de
`GET /api/admin/projects` — conta frequência de cada skill em
`requiredSkills` de todos os projetos e pega o top 8. Simplificação
documentada, não escondida: é a leitura mais honesta possível de um dado
que já existe no backend, sem fabricar nada.

### Gráficos e cards — só shadcn Charts/Recharts, sem template de admin

Por pedido explícito, nada de template de admin externo — mesmo design
system do resto do app. `AdminDashboardDTO` vira KPIs grandes com
indicadores de tendência (`src/app/(app)/admin/dashboard/page.tsx`),
`RadarChart` (skills), `BarChart` (`monthlyMatches`) e `PieChart` donut
(composição profissionais × empresas), todos com `chart.tsx`/`ChartConfig`
e as cores via `var(--chart-N)` já definidas no Prompt 0 — respeitam
dark/light automaticamente.

### `/admin/projects` — simplificação deliberada

O app antigo tinha um feed de cards com múltiplos filtros pesados
(status, tipo, empresa, ordenação simultânea). Portei como `DataTable`
(busca + ordenação por coluna + paginação + tabs Todos/Abertos/Fechados)
em vez de replicar o feed — mesma filosofia de tabela do resto do painel,
menos superfície de UI pra manter, sem perder nenhuma capacidade real de
filtro (a busca global cobre título/empresa; as tabs cobrem status).

### `/admin/companies` e `/admin/professionals` — mesmos diretórios de sempre

Confirmado no `AdminController` (Thymeleaf) antigo: essas duas páginas só
reusam o mesmíssimo `/api/public/{companies,professionals}` que os
diretórios `/pro/companies` e `/company/professionals` já usam — por isso
reaproveitei `useCompanyDirectory`/`useProfessionalDirectory` direto, sem
hook novo, e as fichas linkam pra `/admin/company/{id}`/`/admin/professional/{id}`
(visão somente-leitura, sem os CTAs de contato/chat da versão por papel).

### Ações administrativas — mesma regra de modernização

Aprovar/rejeitar empresa (`RejectCompanyDialog`, motivo obrigatório),
ativar/desativar usuário (`ToggleUserDialog`), criar/remover skill
(`CreateSkillDialog` + `AlertDialog` por chip) e fechar projeto — todas via
`AlertDialog`/`Dialog` de confirmação + mutation + toast, nunca
`confirm()` nativo nem reload de página, igual todo o resto do app desde
o Prompt 0.

### Bug de overflow horizontal em mobile — achado e corrigido em 3 camadas

Investigação boa parte do tempo desta etapa: várias telas (novas e de
Prompts anteriores) estouravam a largura em 360px sem estourar em 1440px.
Depurado com Playwright (`scrollWidth` em 360px/1440px + um "offender
scan" que filtra `getBoundingClientRect()` por `right > docWidth`) até
achar **três causas distintas e independentes**, todas variações do mesmo
tema — algum ancestral flex/grid sem `min-w-0` deixa o filho crescer pro
tamanho do conteúdo em vez de encolher:

1. **`Card` como item de grid/flex** (já resolvido no Prompt 3): `min-w-0`
   adicionado direto em `src/components/ui/card.tsx`, global.
2. **`<main>` do shell**: `SidebarInset` (`src/components/ui/sidebar.tsx`)
   e o `<main>` de `src/components/shell/app-shell.tsx` são item flex sem
   `min-w-0` — corrigido nos dois. Necessário mas **não suficiente**
   sozinho pras páginas com coluna lateral (ver item 3).
3. **`<Link>` sem `className` envolvendo um `<Card>` vira `display:inline`**
   — não participa do algoritmo de encolhimento flex/grid, nenhum
   `min-w-0` em ancestral resolve. Achado comparando o mesmo `scrollWidth`
   exato (367px) numa página do Prompt 2 nunca tocada nesta etapa
   (`/pro/companies`), provando que era um bug **pré-existente**, não algo
   introduzido agora. Corrigido com `className="block min-w-0"` nos 4
   lugares que tinham o padrão (`pro/companies`, `admin/companies`,
   `company/professionals`, `admin/professionals`).
4. **Item de grid também precisa do próprio `min-w-0`, não só o container**:
   causa mais sutil, achada por último. `grid min-w-0 lg:grid-cols-[320px_1fr]`
   no container não bastava — os dois `<div className="flex flex-col gap-4">`
   que são os ITENS desse grid (coluna esquerda/direita) também têm
   `min-width: auto` implícito por padrão do CSS Grid, então continuavam
   forçando a largura do conteúdo. Corrigido com `min-w-0` direto nesses
   dois divs em `admin/professional/[id]`, `admin/company/[id]`,
   **e também** `pro/companies/[companyId]` e
   `company/professionals/[professionalId]` — as duas últimas são do
   Prompt 2/3 e tinham exatamente o mesmo bug latente, nunca antes
   verificado nesse viewport especificamente (só as listas tinham sido
   revarridas depois do item 3).

Varredura final: 20 rotas × 2 viewports (as 12 do painel admin + 8 de
Prompts anteriores tocadas por esses fixes) com `scrollWidth` batendo
exatamente com o `docWidth` em todas.

### Validado ponta a ponta contra o backend real

Aprovar empresa pendente (empresa de teste criada com CNPJ válido por
script) e rejeitar outra (motivo obrigatório, `RejectCompanyRequestDTO`);
criar skill nova e remover (`SkillRequestDTO`, 409 real ao duplicar nome);
ativar/desativar usuário; fechar projeto como admin; export de PDF do
perfil profissional com `professionalId` (retorna `%PDF-1.7` genuíno);
dashboard admin com métricas reais; analytics por id (profissional e
empresa) reusando os mesmos componentes de gráfico do Prompt 2/3.
`build`/`lint`/`typecheck` limpos, sem estado stray no `git status`.

## Estado desta etapa (Prompt 6 — Auditoria de paridade e corte)

Fim da migração tela-a-tela. Auditoria rota a rota do `nexus-frontend`
original contra o que existe hoje, revisão de consistência visual e do
middleware de auth, antes do usuário decidir sobre o corte de produção.

### Checklist de paridade — lacunas encontradas e fechadas

Comparação rota a rota contra os `@RequestMapping`/`@GetMapping` reais de
todos os controllers do `nexus-frontend` (não só os nomes de template).
Achados, todos corrigidos nesta etapa:

- **`/` (home pública)**: ainda era o placeholder do Prompt 0 ("Fundação
  do novo frontend..."), nunca substituído pela landing page de verdade
  do app antigo (`home.html`, ~1000 linhas de Thymeleaf: hero com
  visualizador de score, faixa de logos, "como funciona", métricas,
  "para quem", depoimentos, CTA final, footer). Reconstruída inteira em
  `src/app/page.tsx` com os mesmos textos/seções, componentes shadcn e os
  tokens de tema — nada de CSS/JS solto. Nav com sessão ciente do papel
  (`HomeNav`, client component: Dashboard/Sair se logado, Entrar/Criar
  conta se não) e contador animado (`AnimatedCounter`,
  `IntersectionObserver`, respeita `prefers-reduced-motion`) espelhando
  `animateCount` do JS antigo.
- **`/pro/professionals` e `/pro/professional/[id]`**: item já
  autodocumentado como pendência no comentário do redirect
  `/public/professional/[id]` desde o Prompt 2 ("não há
  `/pro/professionals/[id]` construído ainda") — o item de menu já
  existia em `nav-config.ts` apontando pra um 404. `pro-professionals.html`
  é o diretório de profissionais visto por outro profissional (mesmo
  `/api/public/professionals` que `company/professionals` e
  `admin/professionals` já usam) e `public-profile.html` é o perfil
  somente-leitura correspondente — sem card de Contato (não existe match
  entre dois profissionais) nem o CTA que no app antigo só aparecia pra
  `session.userRole == 'COMPANY'`.
- **Sino de notificações**: `NotificationController` (`/notifications` no
  app antigo, `/api/notifications` no backend real — resumo + contagem de
  não lidas, marcar uma/todas como lidas) nunca tinha sido portado em
  nenhum prompt anterior — só o badge de chat (`useChatNotifications`)
  existia. É uma feature transversal (aparece em toda tela autenticada,
  não só uma), por isso só apareceu nesta auditoria final. Implementado
  como `NotificationBell` (Popover no topbar, polling de 60s, ícone por
  `NotificationType`, clique marca como lida e navega pro `actionUrl`).
  Populado com eventos reais do backend (convite, match confirmado,
  projeto adicionado ao portfólio, etc.) — validado com dado de verdade
  via curl.
  - Vários `actionUrl` de notificação (`MATCH_CONFIRMED`, `NEW_INVITE`)
    apontam pra `/matches/{id}` sem sufixo. No app antigo isso sempre
    redireciona incondicionalmente pra `/company/matches`
    (`MatchStatusCheckController`), inclusive quando quem clica é
    profissional — aí o `AuthInterceptor` barra `/company/**` e joga pra
    `/`, um beco sem saída que era bug, não intenção. Criada
    `/matches/[matchId]/page.tsx` que resolve pelo papel de quem está de
    fato logado.
- **"Baixar currículo"**: o app antigo libera download do currículo
  (upload real de PDF, distinto do "exportar perfil") pra empresa com
  match confirmado, em dois lugares — `company-professional-view.html`
  (card de Contato) e `company-ranking.html` (candidatos com status
  `MATCHED`). O upload/download do **próprio** currículo (profissional)
  já existia desde o Prompt 2 (`ResumeCard`); faltava só esses dois
  pontos do lado empresa, que reaproveitam a mesma rota BFF
  (`/api/professional/{id}/resume`) que já existia sem estar ligada a
  nenhum botão.
- **"Ver histórico"**: timeline de mudança de status do match
  (`GET /api/matches/{id}/history` → `MatchHistoryDTO[]`, existe no
  backend real) nunca tinha sido portado — o app antigo mostra em
  Confirmados/Anteriores/Recusados nas duas telas de matches.
  `MatchHistoryDialog` (busca só ao abrir, `enabled` condicional) somado
  às três abas de `/pro/matches` e `/company/matches`.
- **"Meu perfil" desabilitado pro papel Empresa**: bug isolado, não uma
  lacuna de rota — o dropdown do header (`AppHeader`) ainda tinha o
  `disabled ... em breve` do Prompt 1 (quando só existia perfil de
  profissional), nunca atualizado quando `/company/profile` chegou no
  Prompt 3. Corrigido pra linkar pro perfil certo por papel; some de vez
  pra ADMIN (não tem perfil próprio nesta fatia).
- **Gráfico "Matches por mês" virando um bloco sólido de cor**: achado
  ao revisar consistência visual (item 2 do prompt), não uma lacuna de
  rota. Dois componentes distintos tinham o mesmo sintoma com causas
  diferentes:
  - `MatchesTrendChart` (Recharts `AreaChart`, usado nos 6 dashboards de
    analytics): com um único mês de dado não há o que interpolar, o
    Recharts desenha uma área preenchendo a largura toda. Não dá pra
    corrigir com styling — trocado por um estado vazio
    ("Ainda não há tendência para mostrar") quando `data.length < 2`,
    já que uma "tendência" de verdade exige pelo menos 2 pontos.
  - `MonthlyMatchesBars` (barras artesanais sem lib, usado nos dois
    dashboards — comentário no próprio arquivo já dizia que uma lib de
    charts de verdade entraria só no analytics completo): com um único
    mês, a única barra ocupa 100% da largura do container flex e parece
    um retângulo de cor sólida em vez de uma barra. Adicionado
    `max-w-12` na barra pra ela ler como "uma barra" independente de
    quantos meses existem.
  Achado por acidente numa captura de tela deste prompt — vale registrar
  o método: a primeira leitura pareceu bug (chart "quebrado"), a segunda
  captura com mais tempo de espera mostrou que era só timing de
  carregamento: o app estava certo, o script de verificação que não
  esperava o bastante. Só depois de isolar caso a caso é que a
  `MatchesTrendChart` se confirmou como bug de verdade (mesmo com tempo
  de sobra, o bloco sólido persistia) — não vale corrigir a partir da
  primeira impressão de uma screenshot sem investigar a causa raiz.

### Confirmado como decisão já documentada, não lacuna nova

- `company-opportunities.html` — fora de escopo desde o Prompt 3, item de
  menu aponta pro 404 esperado, já registrado no README daquele prompt.
- `/public/**` exigindo login — decisão do Prompt 4 (o produto ainda não
  tem site público de verdade, todo mundo entra por `/login` primeiro);
  não é regressão, só não colocado em `PUBLIC_PATHS` do `proxy.ts` de
  propósito (comentário adicionado lá pra próxima pessoa não reabrir essa
  dúvida).

### Consistência visual

Paleta: nenhuma cor hexadecimal solta fora dos tokens de tema, exceto três
exceções deliberadas e já eram assim antes desta auditoria (cores de pino
do mapa, azul de marca do LinkedIn, fundo fixo do gráfico de contribuições
do GitHub — este último só funciona com fundo escuro fixo, a imagem em si
não tem variante clara). `alert()`/`confirm()`/`location.reload()` nativos:
zero ocorrências em todo o `src/`. Bloco `Alert` estático do shadcn: nunca
usado no projeto inteiro (toda mensagem passa por toast, `EmptyState` ou
banner condicional de verdade). Dark e light testados via Playwright
(`localStorage` com a chave que o `next-themes` usa, já que o app tem
`enableSystem={false}` — o toggle é claro/escuro manual, não "seguir o
sistema", decisão do Prompt 0) nas telas novas desta etapa e nas telas
tocadas pelos fixes, nos dois viewports.

### Middleware de auth — gap real encontrado e corrigido

O `nexus-frontend` antigo tem um `AuthInterceptor` que, além de exigir
sessão, também checa o **papel**: `/pro/**` só pra `PROFESSIONAL`,
`/company/**` só pra `COMPANY`, `/admin/**` só pra `ADMIN`, e
`/status-check` só pra `COMPANY` — redirecionando pra `/` caso contrário.
O `proxy.ts` do Next só tinha a primeira parte (sessão válida), sem checar
o papel — nenhuma rota administrativa vazava **dado** de verdade (o
`SecurityConfig` do backend real já protege `/api/admin/**` com
`hasRole("ADMIN")`, `/api/company/**` com `hasRole("COMPANY")` etc. —
verificado com curl: um token `PROFESSIONAL` toma `403` genuíno batendo
direto no BFF `/api/admin/dashboard`), mas a **página** em si renderizava
pra qualquer papel logado antes de as chamadas de API tomarem 403 —
exatamente a checagem que o prompt pediu pra verificar. Corrigido
adicionando a mesma tabela de papel-por-prefixo ao `proxy.ts`, com o mesmo
comportamento de redirecionar pro dashboard do próprio papel (mais amigável
que o `/` do app antigo, igualmente seguro). Validado com Playwright:
token de cada um dos três papéis tentando entrar na área dos outros dois
(6 combinações) + o caso especial de `status-check` — todos bloqueados,
nenhum vazamento.

### Validado ponta a ponta contra o backend real

Sino de notificações com dado real (`GET /api/notifications` retornando
eventos genuínos: convite, match confirmado, projeto no portfólio);
`GET /api/matches/{id}/history` retornando a timeline real de um match de
teste; download de currículo; role-gate das 6 combinações de papel ×
área restrita + o caso `status-check`; 44 rotas autenticadas (14 pro + 12
company + 12 admin + a home pública) × 2 viewports com `scrollWidth`
batendo com `docWidth` em todas. `build`/`lint`/`typecheck` limpos, sem
estado stray no `git status`.

### Pronto para decisão de corte

Checklist limpo: paridade de rotas fechada, consistência visual revisada,
`lint`/`build` de produção sem erros nem warnings, middleware de auth
cobrindo página **e** papel em todas as três áreas. Decisão de trocar o
domínio de produção e desligar o `nexus-frontend` antigo fica com o
usuário — nada foi decomissionado nesta etapa.
