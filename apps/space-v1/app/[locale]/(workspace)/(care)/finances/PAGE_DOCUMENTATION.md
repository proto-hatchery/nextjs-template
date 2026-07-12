# Finanças – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/finances/page.tsx`

## 1. Overview

Esta página é o centro de gestão financeira do workspace, permitindo que o usuário visualize o saldo do período, acompanhe receitas e despesas confirmadas, e gerencie cobranças em aberto. Ela oferece uma visão detalhada das movimentações financeiras organizadas por dia, com ferramentas robustas de filtragem e a capacidade de criar, editar ou remover transações manualmente.

## 2. Main Functionalities

- **Resumo Financeiro**: Cards informativos com saldo líquido, total de receitas, total de despesas e cobranças pendentes/em atraso.
- **Lista de Movimentações**: Visualização cronológica das transações agrupadas por dia.
- **Gestão de Transações**: Criação, edição e exclusão de receitas e despesas.
- **Filtragem Avançada**: Filtros por período (data), tipo (receita/despesa), status (confirmada, pendente, cancelada) e categoria.
- **Paginação Infinita**: Carregamento automático de mais transações conforme o usuário rola a página (infinite scroll).
- **Suporte Mobile**: Interface adaptada para dispositivos móveis com visualização simplificada.

## 3. User and System Flows

### 3.1 Entry Points

- **Navegação Lateral**: Acesso através do item "Resumo Financeiro" no menu lateral (sidebar).
- **Breadcrumbs**: Link "Finanças" disponível em subpáginas relacionadas.

### 3.2 Main Flows

- **Visualização de Saldo**: Ao entrar na página, o sistema busca o resumo financeiro do período selecionado (por padrão, todo o período até hoje) e exibe nos cards superiores.
- **Criação de Transação**:
  1. Usuário clica em "Nova transação".
  2. Um modal abre com a escolha entre "Receita" ou "Despesa".
  3. Após a escolha, o formulário solicita valor, data, categoria, método de pagamento e observações.
  4. Ao salvar, a transação é criada e a lista é atualizada.
- **Edição de Transação**:
  1. Usuário clica no menu de ações (três pontos) de uma transação e seleciona "Editar".
  2. O modal abre com os dados preenchidos.
  3. Usuário altera os campos e salva.
- **Exclusão de Transação**:
  1. Usuário seleciona "Remover" no menu de ações.
  2. Um diálogo de confirmação é exibido.
  3. Após confirmar, a transação é removida e o saldo é recalculado.

### 3.3 Secondary Flows

- **Filtragem**: O usuário pode combinar múltiplos filtros. A lista de movimentações e o resumo financeiro são atualizados em tempo real conforme os filtros são aplicados.
- **Sincronização (Consolidação)**: Transações marcadas como "Sincronizado" (geralmente originadas de outros módulos como Sessões ou Cobranças) possuem restrições de edição e exclusão para manter a integridade dos dados.

### 3.4 Edge Cases and Error Handling

- **Transações Sincronizadas**: Ao tentar editar ou excluir uma transação consolidada, o sistema exibe um toast informativo impedindo a ação.
- **Estado Vazio**: Se não houver transações para os filtros aplicados, uma ilustração e um botão de "Nova transação" são exibidos.
- **Erro de Carregamento**: Caso a API falhe, uma mensagem de erro é exibida no lugar da lista.
- **Data Futura**: O formulário de transação impede a seleção de datas futuras através de validação Zod.

## 4. Technical Overview

### 4.1 Architecture

- **Client-Side Route**: A rota principal é um Client Component que renderiza o `FinancesPage`.
- **Data Fetching**: Utiliza TanStack Query via hooks de domínio em `@workspace/supabase/hooks/finances` para buscar entradas paginadas, categorias e o resumo financeiro.
- **Infinite Scroll**: Implementado com `IntersectionObserver` e `useFinancialEntriesWithPagination`.

### 4.2 Dependencies

- **UI Components**: `@workspace/ui/components` (Button, Card, Table, Badge, etc.) e `@workspace/ui/custom-components` (FilterHeaderLayout, FluriFormDialogShell).
- **Forms & Validation**: `react-hook-form` com `zod` para validação e `zod-codec` para transformação de dados (ex: conversão de centavos para reais).
- **Date Handling**: `date-fns` para manipulação e formatação de datas.
- **Icons**: `lucide-react`.

### 4.3 State and Data Flow

- **Filter State**: Gerenciado pelo hook `useFinanceFilters`, que mantém o estado dos filtros na memória (não persistido na URL neste componente específico).
- **Dialog State**: Gerenciado pelo hook `useTransactionDialog` para controlar a abertura e o modo (create/edit) do modal.
- **Mutations**: Utiliza `useFinancialEntryActions` para operações de escrita (create, update, delete), que invalidam as queries relevantes para manter a UI sincronizada.

## 5. Considerations for Testing

### 5.1 Unit Tests

- **Codecs (`transaction-schema.ts`)**: Testar `amountCodec` para garantir conversão correta entre string formatada e número, e `dateCodec` para diferentes formatos de data.
- **Validation Schema**: Testar regras de negócio no `transactionSchema`, como a proibição de datas futuras.
- **Utils**: Testar `isConsolidatedEntry` para garantir que a lógica de bloqueio de edição funciona corretamente.

### 5.2 Integration Tests

- **Filtros e Lista**: Verificar se a alteração de um filtro (ex: mudar tipo para "Despesa") dispara uma nova busca com os parâmetros corretos.
- **Formulário de Transação**: Validar se o preenchimento do formulário envia os dados no formato esperado (centavos) para a mutation.
- **Resumo Financeiro**: Garantir que os cards de resumo refletem os dados retornados pela query `useFinancialSummary`.

### 5.3 E2E Tests

- **Fluxo Completo de Caixa**: Criar uma receita, verificar se ela aparece na lista e se o "Saldo do período" aumentou corretamente.
- **Restrição de Consolidação**: Tentar excluir uma transação sincronizada e verificar se o sistema impede a ação e mostra a mensagem correta.
- **Infinite Scroll**: Rolar a página até o fim e verificar se novas transações são carregadas e anexadas à lista.
