# Plano: P.O. (Prospecção Outbound) - Mapa Interativo do Brasil

## Visão Geral

Criar uma nova aba **"P.O."** dentro da página de **Geração de Lista** (`/crm/prospects`) com um mapa interativo do Brasil. O vendedor pode visualizar estados/cidades e gerenciar a prospecção de parceiros para visitas presenciais.

## Arquitetura

### Abordagem: SVG Interativo (sem dependência externa)
- Mapa do Brasil em SVG com todos os 27 estados (26 + DF)
- Zero novas dependências - usa apenas React + Tailwind + Lucide
- Cada estado é clicável, com hover effects e color coding
- Painel lateral mostra detalhes do estado selecionado com cidades

### Estrutura de Arquivos

```
src/modules/crm/
├── pages/
│   └── CrmProspectsPage.jsx          ← MODIFICAR (adicionar tabs P.O. vs Gerador)
├── components/
│   ├── po/
│   │   ├── BrazilMap.jsx             ← NOVO (SVG interativo do mapa)
│   │   ├── BrazilMapPaths.js         ← NOVO (paths SVG dos 27 estados)
│   │   ├── StateDetailPanel.jsx      ← NOVO (painel lateral com cidades)
│   │   ├── ProspectingDashboard.jsx  ← NOVO (KPIs + mapa + lista)
│   │   └── CityProspectCard.jsx      ← NOVO (card de cidade com status)
├── data/
│   └── brazilStates.js               ← NOVO (dados geográficos BR)
```

## Implementação - Passo a Passo

### 1. Dados Geográficos (`brazilStates.js`)
- Array com todos 27 estados: sigla, nome, região, capital, coordenadas do label
- Top 10-15 cidades por estado com população
- Regiões: Norte, Nordeste, Centro-Oeste, Sudeste, Sul (com cores distintas)

### 2. SVG do Mapa (`BrazilMapPaths.js`)
- Paths SVG simplificados dos 27 estados brasileiros
- Otimizados para renderização web (não precisam ser cartograficamente perfeitos)

### 3. Mapa Interativo (`BrazilMap.jsx`)
- SVG responsivo com viewBox correto
- Hover: estado destaca com brilho/elevação
- Click: seleciona estado e abre painel lateral
- Color coding por região (5 cores) ou por status de prospecção
- Labels com sigla do estado
- Tooltip no hover com nome + número de prospecções
- Animações suaves com CSS transitions
- Dark mode completo

### 4. Painel de Detalhes (`StateDetailPanel.jsx`)
- Aparece ao clicar um estado (slide-in da direita)
- Header: nome do estado, bandeira/ícone, região
- Filtro de cidades (search)
- Lista de cidades principais com:
  - Nome, população estimada
  - Status de prospecção (Não iniciado / Em andamento / Parceiro fechado)
  - Botão de ação (Agendar visita, Ver detalhes)
- Contador: X cidades prospectadas / Y total

### 5. Dashboard de KPIs (`ProspectingDashboard.jsx`)
- Cards no topo:
  - Estados com parceiros
  - Cidades prospectadas
  - Visitas agendadas
  - Taxa de conversão
- Mapa no centro (componente principal)
- Lista de prospecções recentes embaixo (opcional)

### 6. Card de Cidade (`CityProspectCard.jsx`)
- Card compacto com nome da cidade
- Ícone de status (cores: cinza/amarelo/verde)
- Responsável (avatar + nome)
- Data da última atividade
- Ações: agendar visita, adicionar nota

### 7. Modificar CrmProspectsPage.jsx
- Adicionar sistema de tabs no topo: "Gerador de Lista" | "P.O."
- Tab "Gerador de Lista" = conteúdo atual
- Tab "P.O." = novo ProspectingDashboard

## Design Visual

### Paleta por Região
| Região | Cor Light | Cor Dark |
|--------|-----------|----------|
| Norte | emerald-300 | emerald-700 |
| Nordeste | amber-300 | amber-700 |
| Centro-Oeste | sky-300 | sky-700 |
| Sudeste | violet-300 | violet-700 |
| Sul | rose-300 | rose-700 |

### Estados do Prospecting
| Status | Cor | Ícone |
|--------|-----|-------|
| Sem prospecção | slate-200 | Circle |
| Em prospecção | amber-400 | Clock |
| Visita agendada | blue-400 | Calendar |
| Parceiro fechado | emerald-500 | CheckCircle |

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Gerador de Lista]  [P.O.]              (tabs)        │
├─────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│ │ KPI1 │ │ KPI2 │ │ KPI3 │ │ KPI4 │    (KPI cards)    │
│ └──────┘ └──────┘ └──────┘ └──────┘                   │
├─────────────────────────────────┬───────────────────────┤
│                                 │                       │
│       MAPA DO BRASIL            │   PAINEL DO ESTADO    │
│       (SVG interativo)          │   - Header estado     │
│                                 │   - Busca cidades     │
│       [hover + click states]    │   - Lista de cidades  │
│                                 │   - Status parceiro   │
│                                 │   - Ações             │
│                                 │                       │
├─────────────────────────────────┴───────────────────────┤
│  Legenda: ● Sem prospecção  ● Em andamento  ● Fechado   │
└─────────────────────────────────────────────────────────┘
```

## Dados Mock (v1 - sem banco)
- Primeira versão usa dados mock em memória
- Estrutura pronta para migrar para Supabase depois
- Mock de prospecções por estado/cidade

## Fora do Escopo (v1)
- Tabelas no banco de dados (faremos depois)
- CRUD real de prospecções (mock por enquanto)
- Integração com pipeline de deals
- Geolocalização real das cidades
