# Todo App Constitution

## Core Principles

### I. Componentes Reutilizáveis

Cada elemento de UI deve ser um componente React independente e reutilizável. Componentes devem ter responsabilidade única, aceitar props tipadas com TypeScript e ser testáveis de forma isolada.

### II. TypeScript Estrito (NON-NEGOTIABLE)

Todo o código deve ser escrito em TypeScript com strict mode habilitado. Nenhum `any` explícito. Tipos devem representar fielmente o domínio da aplicação.

### III. Estado Local Primeiro

O estado da aplicação vive no cliente via `localStorage` para persistência entre sessões. Não há backend. O estado é gerenciado com hooks React (useState, useEffect, useReducer quando necessário).

### IV. Acessibilidade e UX

Todos os elementos interativos devem ter atributos ARIA adequados, suporte a navegação por teclado e feedback visual claro de estado (loading, empty, error).

### V. Simplicidade (YAGNI)

Não adicionar funcionalidades além do especificado. Sem bibliotecas externas de UI (apenas Tailwind CSS). Sem backend, autenticação ou banco de dados nessa fase.

## Padrões de Código

- Componentes: PascalCase, um por arquivo
- Hooks customizados: `use` prefix, em `src/hooks/`
- Tipos e interfaces: em `src/types/`
- Nenhum `console.log` em produção

## Governança

Esta constituição rege todas as decisões de implementação. Qualquer desvio deve ser justificado e documentado.

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
