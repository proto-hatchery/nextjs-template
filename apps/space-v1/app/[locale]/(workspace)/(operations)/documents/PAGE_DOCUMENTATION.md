# Documentos – Page Documentation

> Generated for: `apps/space-v0/app/(app-shell)/documents/page.tsx`

## 1. Overview

Esta página serve como o catálogo central de modelos de documentos para psicólogos. Ela permite que o usuário visualize modelos disponíveis (como relatórios, laudos e declarações) e inicie o processo de geração de um novo documento a partir de um modelo selecionado, com preenchimento automático de variáveis baseadas nos dados do paciente e do profissional.

## 2. Main Functionalities

- **Catálogo de Modelos**: Exibição de cartões com os modelos de documentos disponíveis, categorizados por tipo (ex: Relatório Psicológico, Laudo, Declaração).
- **Geração de Documentos**: Fluxo para criar um novo documento a partir de um modelo, permitindo selecionar o paciente e definir um título personalizado.
- **Preenchimento Automático**: O sistema substitui variáveis no template (nome do paciente, CRP do psicólogo, etc.) antes de abrir o editor.
- **Responsividade**: Adaptação automática entre Modal (Desktop) e Sheet (Mobile) para o formulário de criação.

## 3. User and System Flows

### 3.1 Entry Points

- **Navegação Lateral**: Acessível através do item "Documentos" no menu principal do App Shell.
- **Deep Link**: Acesso direto via `/documents`.

### 3.2 Main Flows

- **Gerar Documento via Catálogo**:
  1. O usuário clica em um cartão de modelo na grade.
  2. O modal de criação abre com o modelo já pré-selecionado.
  3. O usuário seleciona o paciente e confirma o título.
  4. Ao clicar em "Gerar Documento", o sistema processa as variáveis e redireciona para a página de edição (`/documents/[id]/edit`).

- **Gerar Documento via Botão de Ação**:
  1. O usuário clica no botão "Gerar documento" no cabeçalho da página.
  2. O modal abre sem modelo selecionado.
  3. O usuário seleciona o modelo, o paciente e o título.
  4. O fluxo segue para a geração e redirecionamento.

### 3.3 Secondary Flows

- **Navegação por Breadcrumbs**: Atalhos para voltar à Home ou identificar a posição atual na hierarquia do app.

### 3.4 Edge Cases and Error Handling

- **Nenhum Modelo Disponível**: Exibe um estado vazio (_empty state_) com uma ilustração e mensagem orientando o usuário.
- **Erro na Geração**: Caso a substituição de variáveis falhe ou ocorra erro no banco, um toast de erro é exibido.
- **Avisos de Variáveis**: Se algumas variáveis do template não puderem ser preenchidas (ex: paciente sem CPF), o documento é criado, mas um toast de aviso informa quais campos precisam de atenção manual.

## 4. Technical Overview

### 4.1 Architecture

- **Server Component (`page.tsx`)**: Realiza o fetch inicial dos templates de documentos diretamente via Supabase no servidor.
- **Client Component (`DocumentsPageClient`)**: Gerencia o estado da UI, incluindo a abertura do modal/sheet e a lógica de responsividade.
- **SDF Pattern**: Utiliza o padrão Schema-Dialog-Form para a criação de documentos, com validação Zod e React Hook Form.

### 4.2 Dependencies

- **TanStack Query**: Utilizado via hooks customizados (`usePatients`, `useDocumentTemplates`) para carregar dados no modal de criação.
- **Supabase**: Fonte de dados para templates e documentos gerados.
- **Lexical Editor (Utils)**: Utilizado para codificar o conteúdo do documento após a substituição de variáveis.
- **Lucide React**: Ícones para navegação e representação visual.

### 4.3 State and Data Flow

- **Templates**: Carregados inicialmente via RSC e passados como props; atualizados via React Query no modal.
- **Form State**: Gerenciado pelo React Hook Form no `CreateDocumentModal`.
- **Mutations**: A criação do documento é feita via Server Action (`createGeneratedDocument`), que centraliza a lógica de substituição de variáveis no servidor.

## 5. Considerations for Testing

### 5.1 Unit Tests

- **Template Substitution**: Testar a lógica de `substituteTemplateVariables` com diferentes contextos (paciente menor de idade, psicólogo sem CRP, etc.).
- **Form Validation**: Validar o schema Zod para garantir que `templateId`, `patientId` e `title` sejam obrigatórios.

### 5.2 Integration Tests

- **Modal Responsiveness**: Verificar se o `useMediaQuery` alterna corretamente entre `CreateDocumentModal` e `CreateDocumentSheet`.
- **Data Loading**: Garantir que o `PatientPicker` e o `SelectField` de modelos carreguem as opções corretamente após o fetch.

### 5.3 E2E Tests

- **Happy Path de Geração**: Iniciar na página de documentos, selecionar um modelo, escolher um paciente, gerar e verificar se o redirecionamento para o editor ocorre com sucesso.
- **Empty State**: Simular um cenário sem templates para garantir que o componente de fallback seja exibido.
