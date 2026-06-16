# 🎯 TEMPLATE V9 - JORNADA COMERCIAL FYNESS (ENXUTO)

## 📋 Visão Geral

Template enxuto criado do zero com **TODAS as 7 raias corretas** conforme especificado pelo usuário. Este é um template limpo para ser expandido com os detalhes de cada fluxo.

## ✅ 7 Raias Implementadas

### 1. 🎓 EDUCAÇÃO - Alunos (6 Meses Grátis)
- **Cor**: Verde (`#51cf66` / `#e0ffe0`)
- **Característica Principal**: Alunos ganham 6 MESES GRÁTIS (não trial)
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Educacao → Task_Edu_Placeholder → LinkThrow_Educacao

### 2. 🤝 INDICAÇÃO - Parceiro (Ativo + Passivo)
- **Cor**: Vermelho (`#ff6b6b` / `#ffe0e0`)
- **Característica Principal**: 2 caminhos
  - **Ativo**: Parceiro entrega o contato do lead
  - **Passivo**: Lead procura por indicação do parceiro
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Indicacao → Task_Ind_Placeholder → LinkThrow_Indicacao

### 3. 📱 PRODUÇÃO CONTEÚDO - Instagram (SaaS + Perfis)
- **Cor**: Roxo (`#9775fa` / `#f0e0ff`)
- **Característica Principal**: Dividido em 2 caminhos
  - **Instagram SaaS**: Leads do perfil oficial do SaaS
  - **Perfis Pessoais**: Leads dos perfis pessoais da equipe
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Conteudo → Task_Cont_Placeholder → LinkThrow_Conteudo

### 4. 🎯 PROSPECÇÃO ATIVA - Redes Sociais
- **Cor**: Vermelho escuro (`#fa5252` / `#ffe0e0`)
- **Característica Principal**: Prospecção ativa via redes sociais (LinkedIn, etc.)
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Prospeccao → Task_Prosp_Placeholder → LinkThrow_Prospeccao

### 5. 🔍 GOOGLE ADS - Alta Intenção
- **Cor**: Azul (`#4dabf7` / `#e0f0ff`)
- **Característica Principal**: Leads com alta intenção de compra
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Google → Task_Google_Placeholder → LinkThrow_Google

### 6. 📘 META ADS - Descoberta
- **Cor**: Roxo Meta (`#cc5de8` / `#f3e0ff`)
- **Característica Principal**: Leads em fase de descoberta
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: Start_Meta → Task_Meta_Placeholder → LinkThrow_Meta

### 7. 💰 NÚCLEO FINANCEIRO - Gateway Asaas
- **Cor**: Cinza (`#868e96` / `#f0f0f0`)
- **Característica Principal**: Gateway de pagamento unificado
- **Status**: ⚪ Enxuto - aguardando detalhes para expandir
- **Elementos atuais**: LinkCatch_Merge → Gateway_Checkout → End_Cliente

## 🔗 Link Events

O template usa **Link Events** para organizar as conexões entre raias:

- **6 Link Throw Events**: Um em cada raia de origem (Educação, Indicação, Conteúdo, Prospecção, Google, Meta)
- **1 Link Catch Event**: Na raia Núcleo Financeiro que recebe todos os fluxos
- **Benefício**: Elimina linhas cruzadas e mantém o diagrama organizado

```
[Lane 1] → LinkThrow ⚡
[Lane 2] → LinkThrow ⚡
[Lane 3] → LinkThrow ⚡
[Lane 4] → LinkThrow ⚡  → ⚡ LinkCatch → [Núcleo]
[Lane 5] → LinkThrow ⚡
[Lane 6] → LinkThrow ⚡
```

## 📊 Estrutura Atual

Cada raia de origem tem a estrutura básica:
1. **Start Event** - Ponto de entrada
2. **Task Placeholder** - Marcado com `[EXPANDIR]` para ser detalhado
3. **Link Throw Event** - Conecta ao Núcleo Financeiro

Raia Núcleo tem:
1. **Link Catch Event** - Recebe todos os fluxos
2. **Gateway Checkout** - Decisão de pagamento
3. **End Event** - Cliente Ativo

## 📝 Próximos Passos

O usuário irá fornecer os detalhes de cada raia para expansão:

### Para Lane_Educacao:
- [ ] Fluxo completo de 6 meses grátis
- [ ] Pontos de contato durante os 6 meses (M1, M3, M5, etc.)
- [ ] Processo de conversão após período gratuito
- [ ] Nurturing se não converter

### Para Lane_Indicacao:
- [ ] Fluxo Ativo (parceiro entrega contato)
- [ ] Fluxo Passivo (lead procura parceiro)
- [ ] Processo de qualificação
- [ ] Split de comissão (30% mencionado anteriormente)

### Para Lane_Conteudo:
- [ ] Fluxo Instagram SaaS
- [ ] Fluxo Perfis Pessoais
- [ ] Ponto de merge/qualificação
- [ ] Ofertas e educação

### Para Lane_Prospeccao:
- [ ] Mineração de CNPJ
- [ ] Conexão via LinkedIn
- [ ] Sequência de contato
- [ ] Qualificação

### Para Lane_Google:
- [ ] Landing Page
- [ ] Formulário de captura
- [ ] Speed to Lead
- [ ] Trial e follow-ups

### Para Lane_Meta:
- [ ] Página de filtro
- [ ] WhatsApp
- [ ] Educação
- [ ] Trial e follow-ups

### Para Lane_Nucleo:
- [ ] Processamento de pagamento
- [ ] Gateway Asaas
- [ ] Onboarding pago
- [ ] Dunning/Anti-recusa

## 🎨 Cores e Visualização

- ✅ Cores aplicadas via `bioc:stroke` e `bioc:fill` no XML
- ✅ CSS adicional para garantir visibilidade
- ✅ JavaScript no BpmnEditor aplica cores programaticamente
- ✅ Labels das lanes ficam por cima das cores (SVG reordering)

## 🚀 Como Usar

1. O template já está ativo em `src/utils/comercialTemplate.js`
2. Acesse http://localhost:3002/
3. Crie um novo fluxo ou abra "Comercial"
4. O template V9 será carregado
5. Todas as 7 raias estarão visíveis com cores

## 📌 Arquivos Modificados

- ✅ `src/utils/comercialTemplateV9Complete.js` - Template enxuto criado
- ✅ `src/utils/comercialTemplate.js` - Import atualizado para V9
- ✅ `src/index.css` - Cores das novas lanes adicionadas
- ✅ `src/components/BpmnEditor.jsx` - Arrays de lanes atualizados

---

**Data**: 09/02/2026
**Versão**: V9 Completo Enxuto
**Status**: ⚪ Pronto para expansão
**Autor**: Claude Sonnet 4.5
