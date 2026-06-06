# Tasks: Todo App

**Input**: specs/001-todo-app/plan.md + specs/001-todo-app/spec.md

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Inicializar projeto Next.js 14 com TypeScript e Tailwind CSS
- [x] T002 Configurar tsconfig.json com strict mode
- [x] T003 [P] Criar estrutura de pastas: src/components, src/hooks, src/types

---

## Phase 2: Fundação (Tipos e Hook)

- [x] T004 Criar tipos em src/types/todo.ts (Todo, FilterStatus)
- [x] T005 Implementar hook useTodos em src/hooks/useTodos.ts (addTodo, toggleTodo, deleteTodo, setFilter, persistência localStorage)

---

## Phase 3: User Story 1 - Gerenciar Tarefas (P1) 🎯 MVP

**Goal**: Usuário pode adicionar, completar e deletar tarefas

### Implementação US1

- [x] T006 [P] Criar componente TodoInput em src/components/TodoInput.tsx
- [x] T007 [P] Criar componente TodoItem em src/components/TodoItem.tsx
- [x] T008 Criar componente TodoList em src/components/TodoList.tsx (depende T006, T007)
- [x] T009 Integrar na página principal src/app/page.tsx (depende T005, T008)

**Checkpoint**: App funcional com CRUD básico de tarefas ✅

---

## Phase 4: User Story 2 - Filtrar Tarefas (P2)

**Goal**: Usuário pode filtrar por Todas/Pendentes/Concluídas

- [x] T010 [P] Criar componente TodoFilter em src/components/TodoFilter.tsx
- [x] T011 [P] Criar componente TodoCounter em src/components/TodoCounter.tsx
- [x] T012 Integrar TodoFilter e TodoCounter na página principal (depende T010, T011)

**Checkpoint**: Filtros funcionando, contador atualiza ✅

---

## Phase 5: User Story 3 - Persistência (P3)

**Goal**: Tarefas persistem entre sessões via localStorage

- [x] T013 Implementar persistência no useTodos.ts (leitura inicial + escrita reativa)
- [x] T014 Tratar erro de localStorage indisponível graciosamente

**Checkpoint**: Fechar e reabrir o browser mantém as tarefas ✅
