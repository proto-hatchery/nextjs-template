# Atividades – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/activities/page.tsx`

## 1. Overview

Esta página serve como o catálogo central de atividades clínicas e terapêuticas disponíveis para o psicólogo. O objetivo principal é permitir que o profissional visualize, filtre e atribua atividades (como exercícios de respiração, diários de humor ou protocolos de mindfulness) para seus pacientes, facilitando o acompanhamento terapêutico fora das sessões.

## 2. Main Functionalities

- **Catálogo de Atividades**: Visualização de todas as atividades em um grid único com carregamento por rolagem infinita.
- **Card de Atividade**: Novo design estilo blog post com imagem, título, descrição e identificação do criador.
- **Detalhes da Atividade**: Visualização expandida com descrição, tags, duração estimada e formato (individual, remoto, etc.).
- **Download de PDF**: Acesso direto ao material de apoio da atividade em formato PDF via Supabase Storage.
- **Atribuição a Pacientes**: Fluxo guiado para enviar uma atividade a um paciente específico, com definição de prazos e instruções personalizadas.
- **Associação com Sessões**: Possibilidade de vincular uma atividade a uma sessão clínica já realizada.

## 3. User and System Flows

### 3.1 Entry Points

- **Navegação Lateral**: Acessível através do item "Atividades" no menu principal do Space.
- **Breadcrumbs**: Permite retornar ao "Início" a partir da página de atividades.

### 3.2 Main Flows

- **Visualização e Seleção**:
  1. O usuário navega pelo grid de atividades.
  2. Clica em um card para abrir o diálogo de detalhes.
  3. Visualiza informações técnicas e descrição da atividade.
- **Atribuição de Atividade (Fluxo Multi-etapa)**:
  1. **Etapa 1 (Paciente)**: Seleção do paciente que receberá a atividade (usando `FluriPatientFieldV2`).
  2. **Etapa 2 (Prazo)**: Definição opcional de uma data de entrega (com atalhos para +1, +3 ou +7 dias).
  3. **Etapa 3 (Sessão)**: Vínculo opcional com uma sessão existente do paciente selecionado.
  4. **Etapa 4 (Instruções)**: Adição de notas ou orientações personalizadas para o paciente.
  5. **Etapa 5 (Confirmação)**: Revisão dos dados e finalização do envio.

### 3.3 Secondary Flows

- **Download Direto**: Botão de download disponível tanto no card (grid) quanto no diálogo de detalhes.
- **Atribuição Direta**: Botão "Atribuir atividade" no cabeçalho da página que abre o diálogo já no fluxo de seleção de atividade/paciente.

### 3.4 Edge Cases and Error Handling

- **PDF não disponível**: O botão de download fica desabilitado e exibe uma mensagem informativa.
- **Nenhum paciente cadastrado**: O seletor de pacientes no formulário de atribuição exibe um estado vazio.
- **Erro no Supabase Storage**: Toasts de erro são exibidos caso o link assinado do PDF não possa ser gerado.
- **Sessões não encontradas**: O seletor de sessões informa se o paciente selecionado não possui sessões registradas.

## 4. Technical Overview

### 4.1 Architecture

- **Server Component (`page.tsx`)**: Realiza o fetch inicial do catálogo de atividades (`fetchActivitiesCatalog`) no servidor.
- **Client Component (`ActivitiesPageClient`)**: Gerencia o estado da UI, incluindo a abertura de diálogos e a atividade selecionada.
- **SDF Pattern**: Segue o padrão Schema-Dialog-Form para o fluxo de atribuição (`create-activity-schema.ts`, `activity-details-dialog.tsx`, `activity-assign-form.tsx`).

### 4.2 Dependencies

- **Data Fetching**: TanStack Query (`usePatients`, `usePatientSessions`, `useActivities`).
- **Form Management**: React Hook Form com Zod (`zodResolver`).
- **UI Components**: Radix UI (Dialog, Sheet), Lucide React (ícones), Framer Motion (animações de transição entre etapas).
- **Storage**: Utilitários do `@/compat/supabase/utils/storage` para lidar com arquivos privados.

### 4.3 State and Data Flow

- **URL State**: O catálogo utiliza carregamento infinito (`useActivitiesInfinite`). Filtros globais estão sendo refatorados para integrar com o novo layout de lista única.
- **Mutations**: Utiliza `useMutation` para a Server Action `assignActivity`, que insere registros na tabela `patient_activity_assignments`.
- **Invalidation**: O sucesso da atribuição dispara um toast informativo; a invalidação de cache de atribuições deve ocorrer nas páginas de detalhes do paciente.

## 5. Considerations for Testing

### 5.1 Unit Tests

- **Schemas**: Validar o `createActivitySchema` com diferentes inputs (datas válidas/inválidas, IDs obrigatórios).
- **Formatters**: Testar a função `formatDate` e `formatDateToString` para garantir a máscara correta de data brasileira.

### 5.2 Integration Tests

- **Fluxo de Atribuição**: Verificar se a seleção de um paciente carrega corretamente as sessões relacionadas via TanStack Query.
- **Storage**: Simular o comportamento de download de PDF com diferentes estados de permissão/existência do arquivo.

### 5.3 E2E Tests

- **Jornada Crítica**:
  1. Abrir catálogo.
  2. Selecionar atividade "Análise de Custo-Benefício".
  3. Completar as 5 etapas de atribuição para um paciente de teste.
  4. Verificar se o toast de sucesso aparece.
- **Responsividade**: Validar se o `ActivityDetailsDialog` alterna corretamente entre `Dialog` (Desktop) e `Sheet` (Mobile).
