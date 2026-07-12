# Cobranças (Billing) – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/billing/page.tsx`

## 1. Overview

Esta página é o centro de gestão financeira para o psicólogo no `flurispace`. Ela permite visualizar, criar, atualizar e excluir cobranças associadas a pacientes e sessões. A interface oferece uma visão tabular das transações, com suporte a paginação infinita e estados específicos para dispositivos móveis.

## 2. Main Functionalities

- **Listagem de Cobranças**: Visualização de todas as cobranças com detalhes de data, paciente, serviço, valor, meio de pagamento e status.
- **Criação de Cobranças (Multi-step)**: Fluxo guiado em 3 etapas para criar novas cobranças vinculadas a pacientes, sessões ou serviços específicos.
- **Gestão de Status**: Atualização rápida do status de pagamento (Pendente, Pago, Cancelado) diretamente da lista ou via detalhes.
- **Edição e Exclusão**: Ajuste de valores, métodos de pagamento e remoção de registros de cobrança.
- **Paginação Infinita**: Carregamento automático de mais registros conforme o usuário rola a página.

## 3. User and System Flows

### 3.1 Entry Points

- **Navegação Lateral**: Acessível pelo item "Cobranças" no menu "Financeiro".
- **Deep Link**: Acesso direto via `/billing`.

### 3.2 Main Flows

- **Visualização de Cobranças**:
  1. O sistema busca as cobranças via `useChargesWithPagination`.
  2. Os dados são transformados para o formato de linha (`BillingRow`) e exibidos em uma tabela (Desktop) ou lista de cards (Mobile).
- **Criação de Nova Cobrança**:
  1. Usuário clica em "+ Nova cobrança".
  2. **Etapa 1**: Seleção do Paciente, Sessão (opcional) e Serviço (opcional).
  3. **Etapa 2**: Definição do Valor (preenchido automaticamente se houver serviço/sessão), Data de Vencimento e Status Inicial.
  4. **Etapa 3**: Confirmação dos dados e criação via mutation `addCharge`.
- **Atualização de Status**:
  1. Usuário altera o status em um dropdown na linha da tabela.
  2. O sistema realiza um _optimistic update_ no cache do TanStack Query.
  3. A mutation `updateCharge` é disparada para persistir a mudança no Supabase.

### 3.3 Secondary Flows

- **Detalhes da Cobrança**:
  1. Clique em uma linha abre o `ChargeDetailsDialog`.
  2. Permite editar o valor, método de pagamento e status.
  3. Oferece a opção de excluir a cobrança.
- **Filtros e Busca**: (A ser implementado/validado se presente nos componentes de UI, mas a estrutura base suporta).

### 3.4 Edge Cases and Error Handling

- **Estado Vazio**: Exibe `BillingEmptyState` com um call-to-action para criar a primeira cobrança.
- **Erro de Carregamento**: Exibe mensagem de erro com botão de "Tentar novamente" (refetch).
- **Falha na Mutação**: Reverte o _optimistic update_ e exibe um toast de erro via `sonner`.
- **Sessão sem Cobrança Padrão**: O formulário de criação detecta se a sessão selecionada já possui uma cobrança vinculada.

## 4. Technical Overview

### 4.1 Architecture

- **Container Pattern**: `BillingContainer` gerencia o estado complexo, busca de dados e orquestração de diálogos.
- **View/Component Separation**: `BillingView` foca apenas na renderização condicional (Desktop vs Mobile, Loading, Error, Empty).
- **Data Fetching**: Utiliza TanStack Query v5 com `useChargesWithPagination` (Infinite Query).
- **SDF Pattern**: Implementado nos formulários de criação e detalhes (`*-schema.ts`, `*-form.tsx`, `*-dialog.tsx`).

### 4.2 Dependencies

- **@workspace/supabase**: Hooks de domínio (`useChargesWithPagination`, `useBillingActions`, `usePatients`, `usePatientSessions`).
- **@workspace/ui**: Componentes de layout (`PageContentHeader`), formulários (`Field`, `Input`), e feedback (`toast`).
- **Lucide React**: Ícones para ações e navegação.
- **date-fns**: Manipulação e formatação de datas.

### 4.3 State and Data Flow

- **Server State**: Gerenciado pelo TanStack Query com chaves hierárquicas `queryKeys.financial.chargesPaginated`.
- **Local State**: Controle de abertura de modais (`isCreateOpen`, `detailsState`) e etapa atual do formulário.
- **Optimistic Updates**: Aplicados na atualização de status para garantir uma UI responsiva.

## 5. Considerations for Testing

### 5.1 Unit Tests

- **Transformadores**: Testar `transformBillingToRow` para garantir que datas e valores monetários são formatados corretamente (BRL).
- **Schemas**: Validar `createChargeSchema` e `chargeDetailsSchema` com inputs válidos e inválidos.
- **Codecs**: Testar `dueDateCodec` para conversão entre string de data e formato de persistência.

### 5.2 Integration Tests

- **Fluxo de Criação**: Simular a seleção de um paciente e verificar se o valor padrão da sessão é carregado no campo de valor.
- **Paginação Infinita**: Verificar se o `fetchNextPage` é chamado quando o elemento sentinela entra no viewport.
- **Sincronização de Estado**: Garantir que após fechar o diálogo de detalhes, a lista reflete as alterações feitas.

### 5.3 E2E Tests

- **Caminho Feliz**: Criar uma cobrança completa, verificar sua aparição na lista e alterar seu status para "Pago".
- **Exclusão Segura**: Abrir detalhes, solicitar exclusão, confirmar e verificar a remoção da linha na tabela.
- **Responsividade**: Validar que em telas pequenas a `BillingMobileList` é renderizada em vez da `BillingTable`.
