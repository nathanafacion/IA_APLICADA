# Modulo 5 — IA para UX: Engenharia de Requisitos com Agentes

Foco na aplicação de IA no processo de **UX e engenharia de requisitos** — usando agentes do GitHub Copilot para transformar descrições de problemas de negócio em especificações técnicas completas e, agora com o **Spec Kit**, em código funcional.

---

## Projetos

### 📁 AgenteUX

Agente para o **GitHub Copilot Chat** que, dada uma descrição de problema ou cenário de UX, executa autonomamente uma pipeline de especificação técnica completa.

| Passo | O que gera |
|---|---|
| 🎯 Escopo | Resumo do entendimento do problema e proposta da solução |
| ⚙️ Requisitos Funcionais | Lista de RFs com verbos de ação, agrupados por módulo |
| 🔒 Requisitos Não-Funcionais | RNFs com métricas mensuráveis (performance, segurança, LGPD, etc.) |
| 📊 Diagrama Mermaid | Fluxograma do funcionamento da solução |
| 💾 Arquivo `.md` | Salva toda a especificação em um arquivo `especificacao-<tema>.md` |
| 🖼️ Imagem do diagrama | Gera e embute a imagem estática do diagrama via `mermaid.ink` |

- **Tecnologias:** GitHub Copilot Chat, VS Code, Mermaid

---

### 📁 TemplateReactComSpecDriven

Exemplo prático completo de **Spec-Driven Development (SDD)** usando o [Spec Kit](https://github.com/github/spec-kit) — toolkit open source do GitHub — para construir uma aplicação React/Next.js com TypeScript guiada por especificações.

- **Tecnologias:** Next.js 16, TypeScript, Tailwind CSS, Spec Kit (specify-cli v0.9.5), GitHub Copilot
- **Exemplo construído:** Todo App com CRUD, filtros, persistência localStorage e TypeScript strict

→ Veja o [README completo do projeto](./TemplateReactComSpecDriven/README.md) para detalhes do Spec Kit, estrutura de pastas e comandos disponíveis.
