# Implementation Plan: Todo App

**Branch**: `001-todo-app` | **Date**: 2026-06-06 | **Spec**: specs/001-todo-app/spec.md

## Summary

Aplicação de gerenciamento de tarefas (Todo) construída com Next.js 14 (App Router) e TypeScript. Interface simples com CRUD de tarefas, filtragem por status e persistência via localStorage. Sem backend.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Primary Dependencies**: Next.js 14 (App Router), Tailwind CSS 3

**Storage**: localStorage (client-side)

**Testing**: N/A nesta fase

**Target Platform**: Web browser (client-side rendering para a página principal)

**Project Type**: Web application (frontend only)

**Performance Goals**: Interações < 16ms (60fps), carregamento inicial < 2s

**Constraints**: Sem dependências de UI externas além de Tailwind. Sem backend. Zero `any` em TypeScript.

**Scale/Scope**: Aplicação single-page, ~5 componentes, ~2 hooks customizados

## Constitution Check

- [x] Componentes reutilizáveis: cada componente tem responsabilidade única
- [x] TypeScript estrito: strict mode no tsconfig.json
- [x] Estado local: useState + localStorage, sem servidor
- [x] Acessibilidade: labels, aria-\*, keyboard navigation
- [x] Simplicidade: apenas Next.js + Tailwind, sem libs extras

## Project Structure

### Documentation

```text
specs/001-todo-app/
├── constitution.md
├── spec.md
├── plan.md          ← este arquivo
└── tasks.md
```

### Source Code

```text
src/
├── app/
│   ├── layout.tsx          # Root layout com metadata
│   ├── page.tsx            # Página principal (entry point)
│   └── globals.css         # Estilos globais + Tailwind directives
├── components/
│   ├── TodoInput.tsx       # Input para adicionar nova tarefa
│   ├── TodoItem.tsx        # Item individual da lista
│   ├── TodoList.tsx        # Lista de tarefas filtradas
│   ├── TodoFilter.tsx      # Botões de filtro (Todas/Pendentes/Concluídas)
│   └── TodoCounter.tsx     # Contador de tarefas pendentes
├── hooks/
│   └── useTodos.ts         # Hook com toda a lógica de estado
└── types/
    └── todo.ts             # Tipos: Todo, FilterStatus
```

## Data Model

```typescript
// src/types/todo.ts
export type FilterStatus = "all" | "pending" | "completed";

export interface Todo {
  id: string; // crypto.randomUUID()
  text: string; // texto da tarefa (trimmed)
  completed: boolean; // false por padrão
  createdAt: number; // Date.now()
}
```

## Component Contracts

### `useTodos` hook

- Retorna: `{ todos, filteredTodos, filter, addTodo, toggleTodo, deleteTodo, setFilter }`
- `addTodo(text)`: ignora strings vazias/somente espaços
- `toggleTodo(id)`: alterna `completed`
- `deleteTodo(id)`: remove da lista
- Persiste no localStorage na chave `"todos"`

### `TodoInput`

- Props: `{ onAdd: (text: string) => void }`
- Submete via Enter ou botão
- Limpa o campo após submissão bem-sucedida

### `TodoItem`

- Props: `{ todo: Todo; onToggle: (id: string) => void; onDelete: (id: string) => void }`
- Checkbox para toggle, botão X para delete

### `TodoFilter`

- Props: `{ current: FilterStatus; onChange: (f: FilterStatus) => void }`
- 3 botões: Todas, Pendentes, Concluídas

### `TodoCounter`

- Props: `{ count: number }`
- Exibe: "X tarefa(s) pendente(s)"
