# Calendário – Documentação da Página

> Gerado para: `apps/space-v0/app/(app-shell)/calendar/page.tsx`

## 1. Visão Geral

A página de Calendário é o hub central de agendamento e gestão de tempo para o psicólogo. Ela permite a visualização, criação e edição de diferentes tipos de eventos (sessões, supervisões, reuniões, bloqueios), integrando-se com o Google Calendar e oferecendo suporte a eventos recorrentes. O objetivo principal é fornecer uma interface intuitiva para gerenciar a agenda clínica e compromissos profissionais.

## 2. Funcionalidades Principais

- **Visualização Multi-Formato**: Suporte para visualizações de Mês, Semana, Dia e Agenda.
- **Gestão de Eventos**: Criação, edição e exclusão de sessões, supervisões, reuniões e bloqueios.
- **Eventos Recorrentes**: Suporte completo para séries de eventos com regras de recorrência (RRule) e edição/exclusão com escopo (este evento, este e seguintes, todos).
- **Integração Google Calendar**: Sincronização bidirecional de eventos e criação automática de links do Google Meet.
- **Filtros Dinâmicos**: Filtragem de eventos por tipo (calendários) e outros critérios através da barra de filtros.
- **Mini Calendário Lateral**: Navegação rápida entre datas e seleção de dia específico.

## 3. Fluxos do Usuário e do Sistema

### 3.1 Pontos de Entrada

- **Navegação Lateral**: Acesso direto pelo ícone de calendário no menu principal.
- **Deep Link**: Acesso via URL com parâmetros de data (`?date=...`) e visualização (`?view=...`).

### 3.2 Fluxos Principais

- **Criação de Evento (Modal)**:
  1. O usuário clica no botão "Agendar" ou em um espaço vazio no calendário.
  2. O modal de criação abre, permitindo escolher o tipo de evento (Sessão, Supervisão, etc.).
  3. Para Sessões e Supervisões, o fluxo é multi-etapa:
     - Etapa 1: Título, Data/Hora, Recorrência, Paciente (para sessões) ou Tipo (para supervisão).
     - Etapa 2: Detalhes específicos como Serviço, Local, Valor e Observações.
  4. O usuário salva e o evento é persistido no banco de dados e sincronizado com o Google (se conectado).
- **Edição de Evento**:
  1. O usuário clica em um evento existente.
  2. Um popover de visualização rápida aparece com opções de editar ou excluir.
  3. Ao editar, o modal de criação abre preenchido. Se for recorrente, o usuário escolhe o escopo da alteração.
- **Sincronização com Google Calendar**:
  1. O sistema verifica a conexão do usuário.
  2. Eventos criados ou alterados no Fluri são enviados para o Google.
  3. O sistema realiza sincronização em segundo plano para manter os dados atualizados.

### 3.3 Fluxos Secundários

- **Navegação por Data**: Uso das setas de navegação ou do mini calendário lateral para mudar o período visualizado.
- **Troca de Visualização**: Alternância entre Mês, Semana, Dia e Agenda através dos botões de cabeçalho.
- **Filtragem**: Ativação/Desativação de calendários específicos (ex: ocultar aniversários).

### 3.4 Casos de Borda e Tratamento de Erros

- **Conflitos de Horário**: O sistema valida se já existem eventos no mesmo horário (opcional, dependendo da configuração).
- **Falha de Sincronização**: Se a sincronização com o Google falhar, um toast de erro é exibido, orientando a reconexão se necessário.
- **Estado Vazio**: Exibição do calendário sem eventos, mantendo a estrutura de navegação.
- **Mobile**: Interface adaptada usando `Sheet` para modais e visualização simplificada.

## 4. Visão Geral Técnica

### 4.1 Arquitetura

- **Client Component**: A página principal usa `"use client"` para gerenciar o estado interativo do calendário.
- **Controller Pattern**: Toda a lógica de estado e mutações é encapsulada no hook `useCalendarPageController`.
- **Layout Compartilhado**: Usa `CalendarPageLayout` de `@workspace/ui` para garantir consistência visual.

### 4.2 Dependências

- **TanStack Query**: Gerenciamento de estado do servidor (queries de eventos, pacientes, locais, serviços).
- **Supabase**: Backend para persistência de dados e autenticação.
- **React Hook Form + Zod**: Validação e gestão de formulários no modal de criação.
- **date-fns**: Manipulação e formatação de datas.
- **Lucide React**: Biblioteca de ícones.

### 4.3 Estado e Fluxo de Dados

- **URL State**: A data e a visualização atual são sincronizadas com a URL (`view`, `date`).
- **Mutações**: Usa hooks customizados (`useCalendarEventMutations`, `useCalendarSeriesMutations`) para operações de escrita.
- **Cache Invalidation**: Após mutações bem-sucedidas, as queries do TanStack Query são invalidadas para refletir as mudanças.

## 5. Considerações para Testes

### 5.1 Testes Unitários

- **Mappers**: Validar `mapDbEventsToUiEvents` para garantir que os dados do banco são convertidos corretamente para a UI.
- **Validações**: Testar `validateEventData` com diferentes cenários (títulos vazios, horários invertidos, campos obrigatórios faltando).
- **Utils de Data**: Testar `combineDateAndTime` e cálculos de duração.

### 5.2 Testes de Integração

- **Fluxo de Criação**: Testar a interação entre o modal e o controller, garantindo que os dados corretos chegam às mutações.
- **Eventos Recorrentes**: Verificar se a lógica de escopo (Single vs Series) chama os endpoints corretos.
- **Filtros**: Garantir que a alteração nos filtros reflete nos eventos visíveis no calendário.

### 5.3 Testes E2E

- **Jornada de Agendamento**: Criar uma sessão do início ao fim e verificar sua aparição no calendário.
- **Edição e Arraste**: Testar a atualização de horário via drag-and-drop (se suportado pela lib de calendário) ou via modal.
- **Sincronização Google**: (Simulado) Verificar se o fluxo de sincronização é disparado após ações do usuário.
