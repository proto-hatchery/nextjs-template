# Pacientes – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/patients/page.tsx`

## 1. Overview

Esta página é a central de gerenciamento de pacientes do workspace Fluri Space. Ela permite que o profissional visualize sua lista de pacientes, acompanhe o status de completude dos perfis e inicie novos cadastros através de diferentes fluxos de entrada (rápido, completo ou convite).

## 2. Main Functionalities

- **Listagem de Pacientes**: Exibição em cartões com informações básicas (nome, telefone, idade, gênero) e status.
- **Busca e Filtro (Implícito)**: A listagem é atualizada em tempo real via TanStack Query.
- **Criação de Paciente**:
  - **Criação Rápida**: Apenas nome e telefone para agilidade.
  - **Formulário Completo (Wizard)**: Fluxo passo a passo (Identificação, Endereço, Emergência).
  - **Enviar Convite**: Permite que o próprio paciente preencha seus dados.
- **Indicadores de Status**: Badges visuais que indicam se o perfil está incompleto, se falta contato ou se está ativo.
- **Ações Rápidas**: Atalhos para WhatsApp e chamadas telefônicas diretamente do cartão do paciente.

## 3. User and System Flows

### 3.1 Entry Points

- Navegação principal através do menu lateral ("Pacientes").
- Redirecionamento após login (se configurado como página inicial).
- Deep links para `/patients`.

### 3.2 Main Flows

- **Visualização da Lista**:
  1. O usuário acessa a página.
  2. O servidor busca os dados iniciais via RSC (`getPatientsPageData`).
  3. O cliente assume com `usePatients` para manter os dados atualizados.
  4. Os pacientes são exibidos em ordem, com animações de entrada.

- **Cadastro de Novo Paciente (Wizard Completo)**:
  1. Usuário clica em "Novo Paciente" e escolhe "Formulário Completo".
  2. **Passo 1 (Identificação)**: Preenche dados básicos. Se for menor de idade (calculado automaticamente pela data de nascimento), um campo para "Responsável" é exibido.
  3. **Passo 2 (Endereço)**: Busca de CEP integrada e campos de endereço.
  4. **Passo 3 (Emergência)**: Dados de contato para casos de necessidade.
  5. **Finalização**: O sistema cria o paciente e, se necessário, vincula o responsável.

### 3.3 Secondary Flows

- **Acesso ao Perfil**: Clicar em um cartão redireciona para `/patients/[id]`.
- **Contato Direto**: Clicar no ícone de WhatsApp abre o link `wa.me`; clicar em "Ligar" inicia uma chamada `tel:`.
- **Seleção de Fluxo de Cadastro**: Um diálogo intermediário permite escolher entre as três modalidades de criação.

### 3.4 Edge Cases and Error Handling

- **Lista Vazia**: Exibe a mensagem "Nenhum paciente encontrado" com orientações.
- **Erro na Criação**: Toasts de erro (via `sonner`) informam falhas na mutação.
- **Menor de Idade**: Lógica no Wizard que exige ou sugere o nome do responsável baseado na `date_of_birth`.
- **Sessão Expirada**: Redirecionamento automático para `/login` se o `userId` não for encontrado no servidor.

## 4. Technical Overview

### 4.1 Architecture

- **Server Component (`page.tsx`)**: Realiza o fetch inicial de dados (RSC) para SEO e performance (LCP).
- **Client Component (`PatientsPageView`)**: Gerencia a interatividade, animações (`motion/react`) e sincronização de estado via TanStack Query.
- **SDF Pattern**: Separação clara entre Schemas (Zod), Diálogos (Shells) e Formulários (React Hook Form).

### 4.2 Dependencies

- **Data Fetching**: `@workspace/supabase` (hooks e queries).
- **UI Components**: `@workspace/ui` (Button, Badge, Avatar, Breadcrumb, DialogV2).
- **Form Handling**: `react-hook-form` + `zod`.
- **Icons**: `lucide-react`.
- **Animations**: `motion/react` (AnimatePresence para transições de lista).

### 4.3 State and Data Flow

- **Query Cache**: `usePatients` utiliza a chave `["patients"]` para cache e invalidação.
- **Wizard State**: `usePatientWizard` encapsula a lógica de passos, validação parcial por passo e submissão final.
- **URL State**: Navegação via `next/navigation`.

## 5. Considerations for Testing

### 5.1 Unit Tests

- **`usePatientWizard`**: Testar cálculo de idade, lógica de "isMinor" e navegação entre passos.
- **Schemas**: Validar regras de CPF, telefone e campos obrigatórios em `full-patient-schema.ts` e `quick-create-patient-schema.ts`.
- **Formatters**: Testar `formatPhoneDisplay` e `deriveCountryFromNumber`.

### 5.2 Integration Tests

- **Fluxo de Criação**: Simular preenchimento do Wizard e verificar se a mutação do Supabase é chamada com o payload correto.
- **Renderização da Lista**: Verificar se os badges de status ("Perfil incompleto", "Ativo") aparecem corretamente baseados nos dados do paciente.

### 5.3 E2E Tests

- **Jornada de Cadastro Rápido**: "Novo Paciente" -> "Criação Rápida" -> Preencher -> Salvar -> Verificar se aparece na lista.
- **Navegação de Perfil**: Clicar em um paciente da lista e garantir que a URL muda para o ID correto.
- **Responsividade**: Garantir que o botão de "Ligar" e o layout da lista se adaptam corretamente em dispositivos móveis.
