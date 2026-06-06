# Feature Specification: Todo App

**Feature Branch**: `001-todo-app`

**Created**: 2026-06-06

**Status**: Draft

**Input**: Criar um aplicativo de Todo em Next.js com TypeScript

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Gerenciar Tarefas (Priority: P1)

O usuário pode adicionar novas tarefas, visualizar a lista completa, marcar tarefas como concluídas e excluir tarefas que não são mais necessárias.

**Why this priority**: É o núcleo da aplicação. Sem CRUD de tarefas, nada mais funciona. Entrega valor imediato.

**Independent Test**: Pode ser testado completamente abrindo a página, digitando uma tarefa, pressionando Enter, marcando como concluída e deletando — tudo sem recarregar a página.

**Acceptance Scenarios**:

1. **Given** a página está aberta e o campo de input está vazio, **When** o usuário digita "Estudar Next.js" e pressiona Enter, **Then** a tarefa aparece na lista com status pendente
2. **Given** uma tarefa pendente existe na lista, **When** o usuário clica no checkbox da tarefa, **Then** a tarefa aparece com texto tachado e marcada como concluída
3. **Given** uma tarefa existe na lista, **When** o usuário clica no botão de deletar, **Then** a tarefa é removida da lista permanentemente
4. **Given** o campo de input está vazio, **When** o usuário pressiona Enter, **Then** nenhuma tarefa é adicionada e o campo permanece vazio

---

### User Story 2 - Filtrar Tarefas (Priority: P2)

O usuário pode filtrar a lista de tarefas para ver apenas as pendentes, apenas as concluídas ou todas as tarefas.

**Why this priority**: Melhora a usabilidade quando há muitas tarefas. Não bloqueia o MVP mas agrega valor significativo.

**Independent Test**: Com tarefas pendentes e concluídas na lista, clicar em "Pendentes" mostra apenas as pendentes; clicar em "Concluídas" mostra apenas as concluídas; clicar em "Todas" mostra todas.

**Acceptance Scenarios**:

1. **Given** existem tarefas pendentes e concluídas, **When** o usuário clica no filtro "Pendentes", **Then** apenas tarefas não concluídas são exibidas
2. **Given** o filtro "Pendentes" está ativo, **When** o usuário clica em "Todas", **Then** todas as tarefas voltam a ser exibidas
3. **Given** qualquer filtro ativo, **When** não há tarefas correspondentes, **Then** uma mensagem "Nenhuma tarefa encontrada" é exibida

---

### User Story 3 - Persistência entre Sessões (Priority: P3)

As tarefas do usuário devem ser salvas no `localStorage` e recuperadas ao reabrir o navegador.

**Why this priority**: Garante que o trabalho do usuário não é perdido ao fechar o browser. Importante para usabilidade mas não bloqueia as outras histórias.

**Independent Test**: Adicionar tarefas, fechar o navegador, reabrir — as tarefas devem estar presentes.

**Acceptance Scenarios**:

1. **Given** o usuário criou 3 tarefas, **When** o usuário fecha e reabre o navegador, **Then** as 3 tarefas aparecem com os mesmos estados
2. **Given** o usuário marcou uma tarefa como concluída, **When** a página é recarregada, **Then** a tarefa ainda aparece como concluída

---

### Edge Cases

- O que acontece quando o texto da tarefa tem apenas espaços em branco? → Não deve ser adicionada
- O que acontece quando `localStorage` está indisponível? → A app funciona normalmente sem persistência
- O que acontece com tarefas com texto muito longo? → Texto é truncado com ellipsis no layout

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Sistema DEVE permitir adicionar tarefas com texto não vazio
- **FR-002**: Sistema DEVE exibir todas as tarefas em lista ordenada por data de criação (mais recentes primeiro)
- **FR-003**: Usuário DEVE poder alternar o estado de uma tarefa entre pendente e concluída
- **FR-004**: Usuário DEVE poder deletar uma tarefa individualmente
- **FR-005**: Sistema DEVE persistir as tarefas no `localStorage`
- **FR-006**: Sistema DEVE permitir filtrar tarefas por status: Todas, Pendentes, Concluídas
- **FR-007**: Sistema DEVE exibir contagem de tarefas pendentes
- **FR-008**: Sistema DEVE ignorar tarefas com texto vazio ou somente espaços
