# TemplateReactComSpecDriven

Exemplo prático de **Spec-Driven Development (SDD)** usando o [Spec Kit](https://github.com/github/spec-kit) para guiar a construção de uma aplicação React/Next.js com TypeScript.

---

## O que é o Spec Kit?

O **Spec Kit** é um toolkit open source criado pelo GitHub que implementa a metodologia de **Desenvolvimento Orientado a Especificações**. A ideia central é simples e poderosa: **a especificação vem antes do código**.

Em vez de começar a programar direto (vibe coding), você passa por etapas estruturadas onde a IA te ajuda a pensar, documentar e planejar antes de escrever uma linha de código. O resultado é software mais previsível, com menos retrabalho e mais alinhado com o que realmente precisa ser entregue.

> "Spec-Driven Development flips the script: specifications become executable, directly generating working implementations rather than just guiding them."

---

## Por que isso é bom para o seu sistema?

| Problema comum                                     | Como o SDD resolve                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| "A IA gerou código que não era isso que eu queria" | Você aprova a spec antes — a IA implementa o que está escrito           |
| Código difícil de manter                           | A spec serve como documentação viva do que o sistema faz                |
| Retrabalho por requisitos mal definidos            | User stories com critérios de aceite explícitos antes de implementar    |
| Falta de rastreabilidade                           | Cada tarefa de código é ligada a uma user story da spec                 |
| Onboarding lento                                   | Novos devs leem `specs/` e entendem o sistema sem precisar ler o código |

---

## O que foi feito neste repositório (exemplo)

Este repositório demonstra o fluxo completo do SDD aplicado à criação de um **Todo App** em Next.js + TypeScript. Tudo dentro de `specs/001-todo-app/` e `todo-app/` serve como exemplo didático do processo.

---

## Estrutura de pastas gerada

```
TemplateReactComSpecDriven/
│
├── .github/
│   ├── copilot-instructions.md       # Contexto global do projeto para o Copilot
│   └── prompts/                      # Comandos /speckit.* instalados pelo specify init
│       ├── speckit.constitution.prompt.md
│       ├── speckit.specify.prompt.md
│       ├── speckit.clarify.prompt.md
│       ├── speckit.plan.prompt.md
│       ├── speckit.tasks.prompt.md
│       ├── speckit.implement.prompt.md
│       ├── speckit.analyze.prompt.md
│       ├── speckit.checklist.prompt.md
│       └── speckit.git.*.prompt.md   # Comandos de git integrado
│
├── .specify/                         # Configuração interna do Spec Kit
│   ├── templates/                    # Templates base de constitution, spec, plan, tasks
│   ├── extensions/                   # Extensões instaladas
│   ├── scripts/                      # Scripts auxiliares do toolkit
│   └── workflows/                    # Workflows bundled (ex: bug triage)
│
├── specs/                            # 📋 ARTEFATOS DE ESPECIFICAÇÃO (gerados pelo processo)
│   └── 001-todo-app/
│       ├── constitution.md           # Princípios e regras que governam o projeto
│       ├── spec.md                   # User stories com critérios de aceite
│       ├── plan.md                   # Plano técnico: stack, estrutura, contratos
│       └── tasks.md                  # Lista de tarefas de implementação
│
└── todo-app/                         # 💻 CÓDIGO GERADO (Next.js + TypeScript)
    └── src/
        ├── app/
        │   ├── layout.tsx            # Root layout
        │   ├── page.tsx              # Página principal (orquestra os componentes)
        │   └── globals.css
        ├── components/
        │   ├── TodoInput.tsx         # Campo para adicionar nova tarefa
        │   ├── TodoItem.tsx          # Item individual (checkbox + delete)
        │   ├── TodoList.tsx          # Lista com estado vazio
        │   ├── TodoFilter.tsx        # Filtros: Todas / Pendentes / Concluídas
        │   └── TodoCounter.tsx       # Contador de tarefas pendentes
        ├── hooks/
        │   └── useTodos.ts           # Lógica de estado + persistência localStorage
        └── types/
            └── todo.ts               # Tipos TypeScript: Todo, FilterStatus
```

---

## Fluxo do Spec-Driven Development

```
1. /speckit.constitution   →  Define os princípios do projeto
       ↓
2. /speckit.specify        →  Descreve O QUE construir (user stories)
       ↓
3. /speckit.clarify        →  (opcional) Pergunta para eliminar ambiguidades
       ↓
4. /speckit.plan           →  Define COMO construir (stack, estrutura, contratos)
       ↓
5. /speckit.analyze        →  (opcional) Verifica consistência entre spec e plan
       ↓
6. /speckit.tasks          →  Gera lista de tarefas ordenada por prioridade
       ↓
7. /speckit.implement      →  Executa as tarefas e gera o código
```

---

## Principais comandos disponíveis

Após o `specify init`, estes slash commands ficam disponíveis no **GitHub Copilot Chat**:

### Comandos principais

| Comando                 | O que faz                                                      |
| ----------------------- | -------------------------------------------------------------- |
| `/speckit.constitution` | Cria ou atualiza os princípios e regras que governam o projeto |
| `/speckit.specify`      | Descreve o que você quer construir em forma de user stories    |
| `/speckit.plan`         | Cria o plano técnico com stack e arquitetura escolhidos        |
| `/speckit.tasks`        | Gera a lista de tarefas de implementação                       |
| `/speckit.implement`    | Executa as tarefas e constrói a feature                        |

### Comandos opcionais (qualidade)

| Comando              | O que faz                                                           |
| -------------------- | ------------------------------------------------------------------- |
| `/speckit.clarify`   | Faz perguntas estruturadas para eliminar ambiguidades antes do plan |
| `/speckit.analyze`   | Verifica consistência entre spec, plan e tasks antes de implementar |
| `/speckit.checklist` | Gera checklists de qualidade para validar completude dos requisitos |

### Comandos Git integrados

| Comando                 | O que faz                                                     |
| ----------------------- | ------------------------------------------------------------- |
| `/speckit.git.feature`  | Cria branch para a feature com convenção de nomenclatura      |
| `/speckit.git.commit`   | Gera mensagem de commit semântica baseada nas tasks           |
| `/speckit.git.validate` | Valida se o código está alinhado com a spec antes de commitar |

---

## Como instalar e usar em um novo projeto

### Pré-requisitos

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (gerenciador de pacotes Python)
- Git

### Instalação do uv (Windows)

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
$env:Path = "C:\Users\$env:USERNAME\.local\bin;$env:Path"
```

### Instalação do Specify CLI

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.9.5
```

### Inicializar em um projeto

```bash
cd meu-projeto
specify init . --integration copilot
```

### Verificar updates

```bash
specify self check      # verifica se há nova versão disponível
specify self upgrade    # atualiza para a versão mais recente
```

---

## Rodando o exemplo (Todo App)

```bash
cd todo-app
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Referências

- [Repositório oficial do Spec Kit](https://github.com/github/spec-kit)
- [Documentação completa](https://github.github.io/spec-kit/)
- [Metodologia Spec-Driven Development](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Video overview](https://www.youtube.com/watch?v=a9eR1xsfvHg)
