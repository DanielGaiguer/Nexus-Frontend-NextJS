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
