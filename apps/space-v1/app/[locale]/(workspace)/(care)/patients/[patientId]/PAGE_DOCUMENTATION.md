# Detalhes do Paciente – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/patients/[patientId]/page.tsx`

## 1. Overview

Esta página é o hub central de informações de um paciente específico no Fluri Space. Ela oferece uma visão 360º do prontuário, incluindo dados demográficos, histórico clínico, documentos anexados, sessões agendadas, controle financeiro e registros de evolução. O objetivo principal é permitir que o profissional de saúde gerencie todo o ciclo de atendimento do paciente em um único local.

## 2. Main Functionalities

- **Gestão de Prontuário**: Visualização e edição de dados pessoais, endereços e contatos.
- **Índice do Caso**: Um indicador visual (Gauge) que mede a completude do cadastro e o engajamento do paciente.
- **Gestão de Sessões**: Agendamento de novas sessões, visualização de estatísticas de comparecimento e histórico.
- **Documentação e Arquivos**: Upload de documentos externos e geração de documentos a partir de templates.
- **Registro Clínico**: Criação e gestão de notas de evolução e intervenções terapêuticas.
- **Indicadores Rápidos**: Acesso direto a contatos de emergência, WhatsApp e status de medicação.

## 3. User and System Flows

### 3.1 Entry Points

- **Lista de Pacientes**: O usuário clica em um paciente na listagem geral (`/patients`).
- **Busca Global**: Acesso direto via comando de busca no shell do app.
- **Links Diretos**: Deep links vindos de notificações ou do calendário.

### 3.2 Main Flows

- **Navegação por Abas**: O usuário alterna entre "Dados clínicos", "Documentos", "Sessões", "Responsáveis" (se aplicável) e "Registro Clínico". O estado da aba é persistido na URL (`?tab=...`).
- **Edição de Informações Pessoais**: Na aba "Dados clínicos", o usuário clica em "Editar", altera os campos (Nome, CPF, Data de Nascimento, etc.) e salva. O sistema valida os campos obrigatorios e formatos (CPF, e-mail, telefone).
- **Agendamento de Sessão**: Botão "Agendar sessão" no cabeçalho (e "Nova sessão" na aba Sessões) abre o mesmo modal de criação de sessão usado na página de Sessões, com o paciente já pré-selecionado.
- **Criação de Notas**: Botão "Nova nota" redireciona para o fluxo de criação de notas clínicas.

### 3.3 Secondary Flows

- **Contato Rápido**: Ícones de WhatsApp e Telefone (emergência) no cabeçalho permitem ação imediata.
- **Ações de Prontuário**: Menu "..." permite exportar dados, arquivar ou excluir o paciente.
- **Gestão de Contatos**: Adição/edição de contatos de emergência e contatos médicos via diálogos específicos.
- **Campos Faltantes**: Clicar em "Ver campos faltantes" no sidebar redireciona o usuário para a aba de dados clínicos para completar o cadastro.

### 3.4 Edge Cases and Error Handling

- **Paciente Não Encontrado**: Se o `patientId` for inválido ou o paciente não existir, exibe a página de 404.
- **Erro de Carregamento**: Caso a query do Supabase falhe, exibe um estado de erro com a mensagem correspondente.
- **Estado Vazio**: Seções como "Contatos de Emergência" ou "Documentos" exibem ilustrações e mensagens de "Nenhum item cadastrado" com botões de ação.
- **Menores de Idade**: A aba "Responsáveis" só é visível se o paciente for marcado como menor de idade ou exigir guardião legal.

## 4. Technical Overview

### 4.1 Architecture

- **Server Component**: `PatientDetailPage` (RSC) recebe os params e renderiza o container.
- **Client Container**: `PatientDetailContainer` gerencia o estado das abas, diálogos e busca os dados principais via TanStack Query.
- **View Pattern**: `PatientDetailView` separa a lógica de renderização do layout e sidebar.

### 4.2 Dependencies

- **Data Fetching**: `usePatient` (Supabase + React Query) para dados do paciente.
- **Mutations**: `usePatientMutations` para atualizações de prontuário.
- **UI Components**: `@workspace/ui` (Tabs, Buttons, Dialogs, Tooltips).
- **Icons**: `lucide-react` e ícones customizados (WhatsApp).
- **Utilities**: `date-fns` para formatação de datas, `calculateCaseIndexScore` para o gauge.

### 4.3 State and Data Flow

- **URL State**: `usePersistentTab` sincroniza a aba ativa com o parâmetro `tab` na URL.
- **Form State**: `react-hook-form` gerencia a edição de dados pessoais com validações manuais e tratamento de erros do servidor.
- **Query Cache**: O uso de TanStack Query garante que os dados sejam invalidados e atualizados após mutações (ex: ao salvar dados pessoais ou excluir paciente).

## 5. Considerations for Testing

### 5.1 Unit Tests

- **Mappers e Scores**: Testar `calculateCaseIndexScore` com diferentes níveis de preenchimento do objeto paciente.
- **Validações de Formulário**: Testar a lógica de `validateFormData` em `overview-tab.tsx` para garantir que CPF e datas inválidas sejam barrados.
- **Formatadores**: Testar `formatSince` e `formatNextSession`.

### 5.2 Integration Tests

- **Alternância de Abas**: Verificar se ao clicar em uma aba o conteúdo correspondente é renderizado e a URL é atualizada.
- **Fluxo de Edição**: Simular a edição de um campo, clique em salvar e verificar se a mutação é chamada e o toast de sucesso aparece.
- **Visibilidade de Abas**: Garantir que a aba "Responsáveis" apareça apenas para pacientes menores de idade.

### 5.3 E2E Tests

- **Jornada de Cadastro Completo**: Entrar em um paciente com cadastro insuficiente, completar os campos e verificar se o Índice do Caso (Gauge) aumenta.
- **Fluxo de Exclusão**: Abrir o diálogo de exclusão, confirmar e verificar o redirecionamento para a lista de pacientes.
- **Agendamento via Header**: Abrir o Sheet de agendamento a partir do botão no cabeçalho e completar o fluxo.
