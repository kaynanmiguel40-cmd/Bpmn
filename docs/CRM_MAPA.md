# Mapa de Arquitetura — Módulo CRM (Fyness)

> Sintetizado em 2026-06-11 a partir do estudo de 8 domínios + 3 lentes transversais (duplicação, estado/queries, estrutura). Todos os achados citados têm evidência `arquivo:linha` verificada. Caminhos relativos à raiz do repo.

---

## 1. Visão geral

O CRM é um "app dentro do app": ~34 mil linhas em 112 arquivos sob `src/modules/crm/`, montadas como 23 rotas lazy sob `/crm` dentro do `CrmLayout` (sidebar própria com 14 links, topbar, realtime global). O padrão arquitetural é consistente — **página/modal → hook React Query (`useCrmQueries.js`) → service (`crm*Service`) → `supabase.from('crm_*')`** — com duas camadas transversais: um realtime global (`useCrmRealtime`, montado no layout, assina 7 tabelas e invalida cache por prefixo) e uma factory CRUD genérica (`src/lib/serviceFactory.ts`) com fallback offline em IndexedDB usada nas escritas de contatos/empresas/deals/goals/traffic/calls. O problema central não é o padrão — é que ele está concentrado num god-file de hooks (1.340 linhas, 100 exports, 36 consumidores), cercado de uma quantidade incomum de código morto que parece feature (~17 hooks sem consumidor, componentes inteiros órfãos, edge function nunca invocada, fluxos desligados por flag), regras de negócio reimplementadas com divergência entre páginas (receita/conversão calculadas de 6 jeitos), e um contrato de erro que transforma falha em toast de sucesso. O módulo funciona, mas mente para quem o lê.

## 2. Números do módulo

| Métrica | Valor |
|---|---|
| Linhas / arquivos | 34.118 / 112 (top 17 arquivos >600 linhas concentram ~40%) |
| Rotas sob `/crm` | 23 (5 sem link na sidebar) |
| Tabelas `crm_*` | 15 (+ compartilhadas: `team_members`, `agenda_events`, bucket `crm-whatsapp-media`) |
| Services | 16 (15 `.js` + 1 ilha `.ts`: `crmDealsService.ts`) |
| Hooks React Query | 100 exports em `useCrmQueries.js` — **17 sem nenhum consumidor** |
| Edge functions | `evolution-send`, `evolution-webhook`, `send-email` (vivas); `search-leads` (morta) |

Tabelas: `crm_companies`, `crm_contacts`, `crm_pipelines`, `crm_pipeline_stages`, `crm_deals`, `crm_deal_stage_history`, `crm_activities`, `crm_goals`, `crm_paid_traffic`, `crm_prospects`, `crm_calls`, `crm_messages`, `crm_whatsapp_instances`, `crm_automations`, `crm_automation_logs`. Atenção: **não existe DDL de `crm_contacts`/`crm_companies` no repo** (`database/crm/` vazia; migrations CRM só a partir da 036/044) — o shape só é inferível pelos transformers dos services.

## 3. Domínios: páginas → services → tabelas

| Domínio | Páginas | Services | Tabelas principais |
|---|---|---|---|
| **Pipeline/Negócios** | CrmPipelinePage (kanban, 1.218 linhas, 9 componentes inline), CrmDealsPage, CrmDealDetailPage | `crmDealsService.ts` (única em TS), `crmPipelinesService.js` (a query do kanban mora aqui, não no de deals) | crm_deals, crm_pipelines, crm_pipeline_stages, crm_deal_stage_history |
| **Cadastros** | CrmCadastrosPage (wrapper de abas) + CrmContactsPage/CrmCompaniesPage (embedded E rotas standalone) + 2 detalhes | `crmContactsService.js`, `crmCompaniesService.js` (escrita via serviceFactory, leitura via query direta) | crm_contacts, crm_companies |
| **Prospecção** | CrmProspectsPage (1.598 linhas; aba "P.O." = mapa em `components/po/`) | `crmProspectsService.js` (Casa dos Dados direto do browser), `src/lib/googlePlacesService.js` (fora do módulo!), `geoService.js`; `placesService.js` morto | crm_prospects (**vestigial** — buscas não persistem), crm_companies, crm_deals |
| **Discador/Calls** | CrmDialerPage (867 linhas), CrmCallHistoryPage | `crmCallsService.js` (fila 4 fontes + saga createCrmCall) | crm_calls, crm_contacts, crm_deals, crm_activities, crm_prospects |
| **Daily** | CrmDailyPage (nova, untracked no git — `useCrmQueries.js:15` já depende dela) | `crmDailyService.js` (novo, untracked) | crm_calls, crm_messages, crm_activities, crm_deals, crm_goals, team_members |
| **Inbox/WhatsApp** | CrmInboxPage, CrmWhatsAppSetupPage | `crmMessagesService.js`, `crmWhatsAppInstanceService.js` + edges `evolution-send`/`evolution-webhook` | crm_messages, crm_whatsapp_instances, crm_contacts, crm_prospects, bucket crm-whatsapp-media |
| **Dashboards/Relatórios** | CrmDashboardPage, CrmReportsPage (4 tabs num arquivo), CrmForecastPage (sem service próprio), CrmGoalsPage, CrmTrafficPage | `crmDashboardService.js` (~19 queries paralelas), `crmReportsService.js`, `crmGoalsService.js`, `crmTrafficService.js` — **toda agregação no client** | crm_deals, crm_goals, crm_paid_traffic, crm_deal_stage_history, team_members |
| **Atividades** | CrmActivitiesPage + ActivityFormModal | `crmActivitiesService.js` (sync bidirecional com Agenda/Google Calendar) | crm_activities, agenda_events (via `src/lib/agendaService`) |
| **Automações** | CrmAutomationsPage (3 abas; também embedada inteira no Settings) | `crmAutomationsService.js` (motor: só dispara em `moveDealToStage`) + edges `send-email`/`evolution-send` | crm_automations, crm_automation_logs |
| **Shell/Settings** | CrmLayout, CrmSidebar, CrmTopbar, CrmSettingsPage (4 abas) | `lib/workspaceSettings.js` (localStorage!), `lib/dialerGoals.js` (localStorage), `src/lib/teamService` | team_members + 3 chaves de localStorage |
| **UI kit** | — | `components/ui/`: CrmModal, CrmConfirmDialog, CrmDataTable, CrmPageHeader, CrmBadge, CrmKpiCard, CrmPanel, CrmEmptyState, CrmAvatar, CrmFormField (morto) | — |

## 4. Rotas (`src/App.jsx:103-127`)

| Rota | Página | Sidebar? |
|---|---|---|
| `/crm` | Dashboard | sim |
| `/crm/daily` | Daily do Time | sim (falta no mapa de títulos do topbar) |
| `/crm/pipeline`, `/crm/pipeline/:pipelineId` | Kanban | sim |
| `/crm/deals`, `/crm/deals/:dealId` | Lista/detalhe de negócios | **não** (só via dashboard/cliques) |
| `/crm/cadastros` | Abas Contatos/Empresas | sim (único link de cadastros) |
| `/crm/contacts`, `/crm/contacts/:id` | Contatos standalone | **não** (órfã; destino dos botões "voltar") |
| `/crm/companies`, `/crm/companies/:id` | Empresas standalone | **não** (órfã) |
| `/crm/activities` | Atividades | sim |
| `/crm/discador`, `/crm/discador/historico` | Discador / histórico | sim / **não** (link interno) |
| `/crm/inbox` | Inbox WhatsApp | sim |
| `/crm/whatsapp` | Setup de instâncias | **não** (só via banner do Inbox) |
| `/crm/reports`, `/crm/forecast`, `/crm/goals`, `/crm/traffic` | Analítico | sim |
| `/crm/prospects` | "Gerador de Lista" (label ≠ rota ≠ arquivo) | sim |
| `/crm/settings` | Configurações | sim |
| `/crm/automations` | Automações | sim (agrupada sob "Prospecção", mas dispara no Pipeline) |

## 5. Fluxos de dados principais

1. **Padrão geral**: página → hook (`useQuery`/`useMutation` em `useCrmQueries.js`) → service → `supabase.from('crm_*')`. Mutação invalida keys por prefixo no `onSuccess` (com toast disparado de dentro da camada de dados). Em paralelo, `useCrmRealtime` (montado em `CrmLayout.jsx:112`) assina `postgres_changes` de 7 tabelas (deals, activities, contacts, companies, calls, messages, whatsapp_instances) e invalida prefixos amplos a cada evento — de qualquer usuário, inclusive eco do próprio.

2. **Kanban**: `CrmPipelinePage` → `useCrmPipelineWithDeals` → `getCrmPipelineWithDeals` (`crmPipelinesService.js:52` — 4 queries: pipeline+stages, deals, stage_history p/ dias na etapa, activities p/ selo de cadência; monta um shape de deal **próprio**, diferente do `dbToCrmDeal`). Drag → `useMoveCrmDeal` (update otimista + rollback por snapshot) → `moveDealToStage` (`crmDealsService.ts:293`: auto-win se `is_win_stage`, history, `triggerAutomationsForDeal`). O realtime invalida `pipelineDeals` logo em seguida, desfazendo o patch manual de cache.

3. **Ganhar/perder deal — 3 caminhos divergentes**: (a) drag pra win stage = completo (won + probability 100 + closed_at + history + automações); (b) troféu da CrmDealsPage = `markDealAsWon` (won + closed_at, **sem** mover stage/history/automações); (c) select de status no DealFormModal = `updateCrmDeal` genérico (**sem closed_at** — o deal some dos relatórios que filtram won por `closed_at`). Perder: `markDealAsLost` (`crmDealsService.ts:372`) tem 3 estratégias encadeadas (stage `ilike 'exclu%'` → config de localStorage → pipeline "Nurturing" hardcoded por nome).

4. **Prospecção (Google-first, único modo acessível)**: filtros → `searchProspectsByGoogle` (`src/lib/googlePlacesService.js`, Places API New REST, cache 7d em localStorage) → resultados acumulados **em memória** (nunca gravados em `crm_prospects`) → loop de enriquecimento via Casa dos Dados (`lookupCnpjByName`, API key exposta no bundle, cache 30d) → "Enviar para Pipeline" → `sendToPipeline` (`crmProspectsService.js:1033`): dedup por CNPJ → cria `crm_companies` + `crm_deals` (probability 10, **não cria contato** — dados ficam desnormalizados no deal). O modo legado CD-first é inacessível pela UI (`setSearchSource` nunca é chamado) mas ocupa metade do código.

5. **Discador**: fila com 4 fontes normalizadas (`getDialerQueue` → contatos | deals parados 7+ dias | ligações agendadas | prospects) → botão Ligar abre `tel:` + cronômetro local → PostCallModal → `createCrmCall` (`crmCallsService.js:617`): saga não-transacional de até ~7 roundtrips (promove prospect→contato, insere call, completa activity de origem, espelha activity na timeline, agenda follow-up) com falhas parciais silenciosas.

6. **Inbox WhatsApp**: envio: MessageComposer → `sendCrmMessage` → edge `evolution-send` (resolve instância, INSERT `crm_messages` 'pending', chama gateway WAHA **ou** Evolution conforme secret `EVOLUTION_PROVIDER`, default 'waha', UPDATE sent/failed). Recebimento: gateway → edge `evolution-webhook` (normaliza payload WAHA→Evolution, dedup por `evolution_message_id`, vincula contato por sufixo de telefone ou cria prospect inbound, espelha mídia no bucket) → INSERT → Realtime invalida inbox/conversation. A invalidação manual pós-envio é um no-op (limit 100 vs 200 na key) — a UI depende 100% do realtime.

7. **Atividades → Agenda**: `createCrmActivity` (`crmActivitiesService.js:161-180`) → insert `crm_activities` + import dinâmico de `createAgendaEvent` (`src/lib/agendaService`) → `agenda_events` + Google Calendar. Cadência outbound cria 5 follow-ups por deal.

8. **Automações**: disparam **exclusivamente** em `moveDealToStage` (`crmDealsService.ts:339`) → `triggerAutomationsForDeal` → filtra regras ativas da stage (match de segmento por igualdade exata) → edges `send-email`/`evolution-send` → log em `crm_automation_logs`. Criar deal já na etapa, marcar ganho pelo troféu ou perdido **não disparam nada**.

9. **Dashboards**: `getCrmDashboardKPIs` = Promise.all de ~19 queries agregadas em JS (4 delas nunca lidas); Forecast não tem service — costura 5 hooks, incluindo o dashboard inteiro só para 1 campo (`revenueByMonth`). Relatórios/metas/daily não são cobertos pelo realtime nem invalidados por mutações de deal — só atualizam por staleTime (60-120s).

## 6. Dependências fora do módulo

- `src/lib/serviceFactory.ts` — CRUD genérico com **fallback offline silencioso** (compartilhado com BPMN); origem do gotcha "sucesso mas registro some" (sessão Supabase expirada).
- `src/lib/supabase.js` — re-exporta o client **e** define um CRUD da tabela `companies` do BPMN (`:140-185`); o client puro está em `src/lib/supabaseClient.ts`. Três "Company" no codebase.
- `src/lib/agendaService` + `googleCalendarService` — espelho de atividades; `useCrmQueries` invalida a key `['agendaEvents']` de outro módulo em 4 lugares.
- `src/lib/googlePlacesService.js` e `src/lib/usageTracker.js` — consumidos **exclusivamente** pelo CRM, mas moram na lib global.
- `src/components/layout/Sidebar.jsx:92-113` — o shell global do app consulta `crm_pipeline_stages`/`crm_deals` direto (bypass de services) pro badge de leads, com key `['crmNewLeadsCount']` fora do prefixo `['crm']`.
- `src/contexts/ToastContext` — importado por **todos os 14 services + useCrmQueries** (UI acoplada à camada de dados, ~40 toasts dentro de mutações).
- `team_members` — fonte de vendedores; join sempre via `auth_user_id` ↔ `crm_deals.created_by`.
- Env: `VITE_GOOGLE_MAPS_API_KEY`/`VITE_GOOGLE_PLACES_API_KEY`, `VITE_CASA_DOS_DADOS_API_KEY` (exposta no client), `VITE_EVOLUTION_*` (frontend) + secrets `EVOLUTION_*` (edges). `.env.example:36` sugere instância 'default'; o código usa fallback 'fyness-principal'.

---

## 7. Por que está confuso — diagnóstico

### 7.1 (ALTA) Um god-file no centro de tudo: `useCrmQueries.js`

1.340 linhas, 100 hooks, importa 16 services (`:1-19`), 36 arquivos consumidores. Toda mudança em qualquer subdomínio passa por ele. O nome mente ("queries" contém dezenas de mutações com toasts e optimistic updates). O mapa `crmQueryKeys` (`:23-70`) é furado: existem duas keys quase idênticas pro mesmo kanban (`pipelineDeals` `:29` viva vs `dealsByPipeline` `:31` fantasma — só alimenta hook morto mas é invalidada em mutações vivas `:360,451` e no realtime `useCrmRealtime.js:25`); 21 ocorrências do literal `['crm','pipelineDeals']` hardcoded; a key `recentCalls` casa por string interna diferente do nome do método (`:62` vs `:725,741,752`) — renomear o mapa quebraria invalidações em silêncio; `dealActivities`/`dealStageHistory` nem estão no mapa (`:591,600`). **Fix**: split mecânico por feature (consumidores já importam por nome) mantendo só um `queryKeys.js` central com prefixos base exportados.

### 7.2 (ALTA) ~20-25% do módulo é código morto que parece feature

Tudo verificado por grep (zero consumidores):
- **17 hooks exportados sem uso** em `useCrmQueries.js` (`:258,280,290,301,312,333,617,735,768,833,1017,1025,1225,1266,1276,1287,1332`), arrastando ~18 funções de service órfãs (editar stages, star/spam de mensagens, ranking de vendas...) e até colunas de banco (`is_spam`/`is_starred`, `database/046:104-105`). +1 hook vivo só dentro de componente morto (`useProspectsAnalytics` → ProspectsInsightsPanel). + `useCrmRealtimePipeline` morto (`useCrmRealtime.js:89`) e import morto `cleanAllCrmTestData` (`:7`).
- **Componentes inteiros sem importador**: `WhatsAppMessagesTab.jsx`, `ProspectsInsightsPanel.jsx` (382 linhas), `BrazilMapPaths.js`, `CrmFormField.jsx` (só no barrel `ui/index.js:11`).
- **Edge function `search-leads` nunca invocada** — existia pra proteger a API key da Casa dos Dados, que hoje vai exposta no bundle (`crmProspectsService.js:13`); ainda duplica todos os mapeamentos CNAE/porte.
- **Cadeia `_triggersMeeting` morta ponta-a-ponta**: `moveDealToStage` seta `false` incondicional (`crmDealsService.ts:336`) → ScheduleMeetingModal nunca abre (`CrmPipelinePage.jsx:949`) → `schedulePartnerMeeting`/`updateDealMeeting` inalcançáveis → ninguém mais escreve `crm_deals.meeting_date` → **os pins de reunião do mapa P.O. rodam sobre coluna que nada alimenta** (`crmDealsService.ts:638`, `BrazilMap.jsx:611`).
- **Aba P.O. é uma casca**: stubs sempre-zero (`brazilStates.js:298-324`), busca de parceiros desligada por `PLACES_ENABLED=false` (`usePlacesSearch.js:23`) matando `placesService` + 2 componentes; KPIs mostram 0.
- **Modo CD-first inacessível** (`setSearchSource` nunca chamado, `CrmProspectsPage.jsx:449`) mas ocupa metade da página e do service; filtro `clientRange` sem UI (`:48,464`).
- **Mídia outbound construída e inalcançável**: menu de anexo + `uploadCrmMedia.js` + branch da edge prontos, mas o clipe está hard-disabled com tooltip "requer WAHA Plus" de uma era anterior (`MessageComposer.jsx:156-163`) — o commit 4588d350 migrou pra Evolution justamente pra liberar mídia e esqueceram de religar.
- **Queries mortas rodando**: dashboard desperdiça 4 roundtrips/load (`leadsRes` nunca lido, `crmDashboardService.js:72,93`; `getSalesRanking` 54 linhas mortas `:644-703`); Daily computa `sellers`/`tasks` que a página descarta (`crmDailyService.js:41-95` vs `CrmDailyPage.jsx:100-101`); schemas Zod nunca usados (`crmValidation.js:171,184`); `crmTypes.js` com 1 referência.

**Fix**: deletar em lote (git preserva histórico). Reduz `useCrmQueries.js` em ~250 linhas e elimina a pergunta constante "isso é usado onde?".

### 7.3 (ALTA) Falha vira "sucesso": contrato de erro quebrado + fallback offline

A raiz do gotcha conhecido "salvou mas sumiu":
- Services **engolem erro**: getters retornam `{data:[],count:0}`/`[]` com toast interno (`crmContactsService.js:93-96`, `crmCallsService.js:168-171`...) — a query nunca entra em estado `error`; mutações retornam `null`/`false`/`{ok:false}` em vez de lançar (`crmMessagesService.js:206-217`).
- **`onSuccess` incondicional** nos hooks: toasta "criado com sucesso" e fecha modal mesmo com retorno null (`useCrmQueries.js:146-156`); `useSendCrmMessage` tem `if (!res?.ok) return;` dentro do onSuccess (`:1242`) — falha da edge vira sucesso mudo. Só 6 de ~36 mutações têm `onError`; não há `mutationCache.onError` global (`src/main.jsx:48-57`).
- **serviceFactory** em erro (inclusive sessão expirada) salva no IndexedDB e retorna como sucesso (`serviceFactory.ts:240-247`), mas as leituras só leem do Supabase — registro fantasma.
- Casos concretos: "Novo Contato" na página da empresa dispara UPDATE com id `undefined` e toasta sucesso (`CrmCompanyDetailPage.jsx:210` + `ContactFormModal.jsx:124` — `isEdit = !!contact` com objeto de defaults); editar/excluir prospect de busca é no-op com toast (ids `api_`/`gpl_` não existem em `crm_prospects`, `crmProspectsService.js:1009-1024`); três contratos de erro diferentes no mesmo domínio de deals (factory finge sucesso / move lança / createPipeline retorna null).

**Fix**: services sempre lançam; `onError` global no QueryClient; toasts decididos pelo chamador; `isEdit = !!contact?.id`.

### 7.4 (ALTA) Cada página calcula as próprias métricas — números divergentes

Receita, conversão e funil reimplementados em **6 services com regras diferentes** para o mesmo período:
- Dashboard escopa "pipelines de venda" por **regex no nome** (`/nurturing|nutri/i`, `/^parceiros$/i` — `crmDashboardService.js:46-50`): renomear um pipeline muda receita silenciosamente. Nenhum outro service usa essa classificação.
- `getSalesReport` não escopa pipeline e exclui deals de R$0 do valor mas não do count (`crmReportsService.js:18-21,43`); `getGoalsProgress`, `getBonificacaoProgress` e `crmDailyService` somam won de todas as pipelines (`crmGoalsService.js:145-151`, `crmDashboardService.js:555-561`, `crmDailyService.js:47-55`).
- **Dois funis**: o do dashboard conta deals soft-deletados (join aninhado sem `deleted_at`, `:120-125`) e conversão sem cap; o de Relatórios filtra e capa em 100% (`crmReportsService.js:62-118`).
- Atribuição de vendedor por `created_by` ignorando o `owner_id` que existe (`crmDealsService.ts:72`) — deal reatribuído continua creditado ao criador em metas/medalhas.
- **3 sistemas de "meta"** (dialerGoals em localStorage / tabela `crm_goals` / override hardcoded), **3 definições de "reunião agendada"** e **2 de "atendeu"** (`crmCallsService.js:126-128` vs `crmDailyService.js:18`).
- **Números de demo cravados no código** na visão default da CrmDailyPage (`:107-124`: 57 mensagens, R$2.412, meta "12 clientes") e "Contratos fechados" sempre 0.
- Forecast: filtros do header se aplicam a subconjuntos diferentes da página; trend compara período vs all-time (`CrmForecastPage.jsx:425-428`); `probability || 50` trata 0% explícito como 50% (`crmReportsService.js:145`).

**Fix**: coluna `kind` em `crm_pipelines` (sales/partners/nurturing); uma função/view única "won do período" com escopo como parâmetro; helper único de atribuição (owner_id com fallback); remover o override da Daily.

### 7.5 (ALTA) Transições de deal: 3 caminhos com efeitos colaterais diferentes

Detalhado no fluxo 3 acima. Consequências práticas: deal ganho via form **some dos relatórios** (sem `closed_at`); ganho via troféu não dispara automações nem grava history; `markDealAsLost` (`crmDealsService.ts:372-505`, 133 linhas) depende de magic strings de nomes de pipeline/stage e de config em **localStorage por dispositivo** (`workspaceSettings.js:15-21`) — "no meu PC o lead foi pra Nurturing, no dela não". Automações só disparam no drag (`crmDealsService.ts:331-340`). Bônus: dois shapes de deal (kanban monta na mão em `crmPipelinesService.js:145-164` sem `segment` → badge nunca aparece no kanban, `CrmPipelinePage.jsx:165`; `dbToCrmDeal` descarta `contact.phone` que a query busca, `crmDealsService.ts:107-112,240`). **Fix**: funções únicas `winDeal`/`loseDeal`/`reopenDeal` chamadas por todos os caminhos; config de roteamento no banco; kanban reusa `dbToCrmDeal`.

### 7.6 (ALTA) Cache: realtime, otimista e invalidação brigando sem regra

- O realtime global invalida `['crm','pipelineDeals']` em **qualquer** evento de `crm_deals` — inclusive o próprio move que o `useMoveCrmDeal` acabou de patchar na mão pra evitar refetch (`useCrmQueries.js:453-462` vs `useCrmRealtime.js:19-33`). Dois mecanismos de consistência sobrepostos, sem filtro de eco.
- **Invalidação assimétrica**: ganhar um deal não invalida `goalsProgress`, `bonificacao`, `salesReport`, `forecastReport`, `dailyScoreboard` — nenhuma key analítica aparece em qualquer `invalidateQueries` ou no realtime (auditadas as 100+ chamadas). "Fechei o deal e a meta não mexeu" = staleTime de 60-120s + refocus.
- **Invalidação no-op no Inbox**: `useSendCrmMessage` invalida a conversa com `limit:100` cravado na key, mas o consumidor vivo usa 200 (`useCrmQueries.js:1244-1251` vs `MessageThread.jsx:84`) — o comentário "invalidamos manualmente pra UX instantânea" descreve algo que não acontece; a thread só atualiza pelo realtime, sem optimistic update.
- Helpers otimistas existem (`:485-516`) mas 2 dos 3 hooks os reimplementam inline com drift (`:404-408,472-476,554-562`).
- **Estado local duplicando cache**: `accumulated` na Prospecção nunca remove itens (excluído continua na tela, `CrmProspectsPage.jsx:549-572`); `currentIndex` posicional no Discador → **um contato pulado a cada registro** (`CrmDialerPage.jsx:229` + refetch que remove o item) e a fila pode reordenar no meio da chamada via realtime; `notes` do detalhe do deal sobrepõe o cache pra sempre (`CrmDealDetailPage.jsx:100,142`).
- 9 staleTimes ad hoc (5s a 10min) sem constantes; mesma row de instância WhatsApp buscada 2x sob keys diferentes com polling duplo (`CrmInboxPage.jsx:22` vs `WhatsAppStatusBanner.jsx:10`).

**Fix**: grupos de invalidação por entidade (`invalidateDealDerived(qc)`), confiar no realtime e simplificar onSuccess (ou filtrar eventos próprios), identificar contato da fila por id estável, constantes de staleTime nomeadas.

### 7.7 (ALTA) WhatsApp: saga de 4 providers sob o nome "evolution"

O código passou por Evolution v2 → WAHA → Evolution v1.8.6 → patch v2.3+ (commits c4953290, 43fa7fb1, 4588d350, e9760fe6) e nenhuma era foi removida: a edge se chama `evolution-send` mas o **provider default é 'waha'** (`index.ts:44`); o branch Evolution usa payload v1 enquanto o docker-compose do repo sobe v2.1.1 (incompatível, `infra/docker-compose.evolution.yml:19`); é impossível saber o gateway de produção lendo o repo (depende do secret `EVOLUTION_PROVIDER`). Agravantes: heurística "@lid" duplicada 2x na mesma edge (`index.ts:79` e `:158-159`) e LIDs opacos viram `phone` de prospect atravessando o stack; **automações enviam WhatsApp sem `instanceName` → 400 garantido** (validação `index.ts:209` roda antes do fallback `:224-237`; `crmAutomationsService.js:271`); instância default resolvida em 3 camadas com 3 valores (`crmMessagesService.js:202` / `crmWhatsAppInstanceService.js:19` / edge; `.env.example:36` sugere um quarto); UI promete QR in-app que nunca chega com WAHA (`evolution-webhook/index.ts:524,603`); motor de automações ignora `delay_minutes`, mídia e o status 'delivered' que o form/UI prometem (`crmAutomationsService.js:338-409`, `AutomationFormModal.jsx:97-98`). **Fix**: escolher UM provider, deletar o outro branch (ou adapter com nome neutro), tornar `instanceName` opcional no server e remover defaults do frontend, alinhar compose/docs.

### 7.8 (MÉDIA-ALTA) Duplicação massiva com drift — que já virou bug de negócio

- **5 listas de segmentos divergentes** (`DealFormModal.jsx:49` com 'Construcao Civil' vs `AutomationFormModal.jsx:24` com 'Construcao'...) + filtro do motor por igualdade exata (`crmAutomationsService.js:352-355`) = **automação segmentada que nunca dispara, sem log**. A aba Segmentos do Settings salva em localStorage que ninguém lê (`CrmSettingsPage.jsx:134-160`).
- `formatCurrency` definido em **16 arquivos** (sendo que `src/lib/formatters.js:14` já exporta um); `useDebounce` copiado em 5 páginas; `EntityCombobox` 3x; STATUS_MAP 6x; 4 implementações de cálculo de período; helpers de telefone/wa.me 3x; normalizador de acentos 5x; fórmulas ROAS 3x.
- `DEFAULT_STAGES` duplicado entre modal e service **com drift**: pipeline criada sem stages explícitos fica **sem win stage** (`CrmPipelinePage.jsx:467` tem `isWinStage:true`, `crmPipelinesService.js:202-215` não).
- **CrmConfirmDialog**: a API é `onCancel` mas 7 páginas passam `onClose` — botão Cancelar/ESC/backdrop **mortos** nessas telas (`CrmConfirmDialog.jsx:39` + Activities/Contacts/Companies/Goals/Traffic/Prospects/CallHistory). UI kit ignorado dentro do próprio módulo (CrmAutomationsPage reimplementa tabela/badge/KPI; Settings constrói 2 confirm-modals na mão).
- Ordenação quebrada por mismatch de nomes: páginas mandam `sortDir`, services leem `sortOrder` (`CrmContactsPage.jsx:87` vs `crmContactsService.js:64`), e keys camelCase vão cruas pro PostgREST (`createdAt`/`startDate` → erro 42703 e lista vazia); sort de Atividades também tem stale closure (`CrmActivitiesPage.jsx:58-62,94-100`); sort da Prospecção é 100% fake (service nunca lê).

**Fix**: `crm/shared/` (formatters, periods, useDebounce, EntityCombobox, constantes de segmento/outcome) + corrigir os contratos de sort num tipo único + 1 linha no CrmConfirmDialog.

### 7.9 (MÉDIA) Navegação e estrutura que desorientam

- **3 páginas pro mesmo conteúdo**: CrmCadastrosPage embute Contacts/Companies, mas as rotas standalone seguem vivas e são o destino dos "voltar" — usuário cai em página sem highlight no menu; as abas embedded compartilham os params de URL (buscar na aba Contatos vaza pra Empresas). Settings embeda a CrmAutomationsPage **inteira** como aba (header duplo, `?tab=` conflitante) enquanto `/crm/automations` segue na sidebar (`CrmSettingsPage.jsx:13,674`).
- Título do topbar mostra "Dashboard" em todas as 22 subpáginas (bug de iteração, `CrmLayout.jsx:45-52`) — ninguém notou porque há dois sistemas de título.
- Nomes que mentem: "Daily" nomeia duas features sem relação (placar do time vs metas do discador — `DailyGoalProgress` fica no Discador); a Prospecção tem 4 nomes (arquivo Prospects / rota prospects / label "Gerador de Lista" / aba "P.O." servida pela pasta críptica `po/`); `ScheduleMeetingModal` é específico de parceiros do Pipeline; `ImportLeadsModal` mora junto da prospecção mas é feature do kanban; rotas em dois idiomas (`cadastros`/`discador` vs `deals`/`reports`).
- Fronteiras: domínio CRM em `src/lib` (googlePlacesService, usageTracker), sidebar global com query direta em tabelas crm_*, `src/lib/supabase.js` carregando CRUD do BPMN junto do client, ilha única de TypeScript (`crmDealsService.ts`) que não protege nenhum caller `.js`.

### 7.10 (MÉDIA) Regra de negócio e estado por dispositivo (localStorage)

Roteamento de deal perdido (`workspaceSettings.js` — muda destino de dados **compartilhados** por navegador), metas do discador (`dialerGoals.js`), contador de custo/saldo de API (`usageTracker.js` + `window.prompt()` pra ajustar saldo), 'crm-segments' e 'crm-currency' **write-only** (ninguém lê), caches de busca da prospecção. Com mais de um vendedor, comportamento e números divergem por máquina. Painel "Integrações de Envio" do Settings mostra "Não configurado" hardcoded contradizendo a realidade (`CrmSettingsPage.jsx:604-621`).

### 7.11 Bugs pontuais verificados (consertos cirúrgicos)

| Bug | Onde |
|---|---|
| PostCallModal reseta formulário a cada segundo (cronômetro segue rodando e o useEffect depende de `elapsedSeconds`) | `CrmDialerPage.jsx:155-189`, `PostCallModal.jsx:58-68` |
| "Pular registro" não pula — deixa preso no estado "Em chamada" | `PostCallModal.jsx:112-118` |
| Checkbox "pular chamados 24h" ignorado em 2 das 4 fontes da fila; filtro client-side depois do `.limit(50)` | `crmCallsService.js:398-505,300-312` |
| `getCrmCompanies` sem filtros retorna soft-deletadas (dual-path factory vs query direta) — dropdowns mostram excluídas | `crmCompaniesService.js:60-100` |
| CSV: import com `split(',')` ingênuo, headers assimétricos ao export; export só exporta a página atual (25 linhas) | `crmContactsService.js:159-224`, `CrmContactsPage.jsx:126-135` |
| Reset de página no mount apaga o deep-link `?page=N` que a própria página implementa | `CrmContactsPage.jsx:100`, `CrmCompaniesPage.jsx:85` |
| Filtro de tráfego exige registro contido na janela (campanha que cruza o mês some dos dois meses) | `crmTrafficService.js:73-74` |
| Fallback silencioso da busca CD devolve a própria carteira como "leads novos" (pseudo-prospects `crm_c_*`) e pode gerar duplicados no envio | `crmProspectsService.js:715-834` |
| Mídia inbound da Evolution fica com URL `.enc` quebrada (mirror só cobre WAHA); falha de mirror descarta a mensagem | `evolution-webhook/index.ts:363-372` |
| Webhook devolve conteúdo de mensagens no HTTP response e a auth por secret é opcional | `evolution-webhook/index.ts:171-176,233` |
| CrmCallHistoryPage: primeiro fetch sem filtro de usuário (flash de dados do time) até a session resolver | `CrmCallHistoryPage.jsx:69-96` |
| Tipos de atividade: filtro "Follow-up" que o schema não aceita; 'lunch' sem label/ícone | `crmValidation.js:106`, `CrmActivitiesPage.jsx:15-31` |

## 8. Para onde ir (estrutura-alvo resumida)

Reorganizar por feature, espelhando a sidebar: `crm/app/` (layout, rotas, realtime) · `crm/shared/` (ui kit + formatters/useDebounce/EntityCombobox + `queryKeys.js`) · `crm/pipeline/` · `crm/prospecting/` (trazendo googlePlacesService e usageTracker de `src/lib`) · `crm/dialer/` · `crm/inbox/` · `crm/cadastros/` (rota única) · `crm/analytics/` (com UM cálculo compartilhado de receita/conversão) · `crm/daily/` · `crm/automations/` · `crm/data/`. Regras de fronteira: services não importam ToastContext; supabase via `supabaseClient.ts`; query keys só do módulo central; nada de CRM em `src/lib`. O split do `useCrmQueries.js` é o primeiro passo e destrava o resto — os 36 consumidores já importam por nome.
