# Aula 2 — LangChain, LangGraph e Agentes de IA

Esta aula aprofunda o uso de **LangChain** e **LangGraph** para construção de pipelines de IA, agentes com memória, guardrails de segurança e RAG avançado.

---

## 📂 Estrutura

```
Aula 2/
├── Exemplos da Aula/          # Exemplos práticos demonstrados em aula
│   ├── 01-smart-model-router-gateway/
│   ├── 02-langchain-intro/
│   ├── 03-medical-appointment-template/
│   ├── 03-medical-appointment-z/
│   ├── 04-song-highlights-template/
│   ├── 04-song-highlights-z/
│   ├── 05-safeguard-prompt-injection-template/
│   ├── 05-safeguard-prompt-injection-z/
│   ├── 06-rag-neo4j-students-template/
│   ├── 06-rag-neo4j-students-z/
│   └── 07-doc-analysis/
└── Modulo 1,2,3,4,5/
    └── WeeklyScheduler/       # Projeto prático dos módulos
```

---

## 🧪 Exemplos da Aula

### 01 — Smart Model Router Gateway

Gateway HTTP construído com **Fastify** que roteia requisições de chat para diferentes modelos via OpenRouter com base em critérios configuráveis.

- **Stack:** Node.js, TypeScript, Fastify, OpenRouter SDK
- **Conceito:** Roteamento inteligente de modelos LLM

### 02 — LangChain Intro

Introdução ao LangChain com um servidor HTTP simples que expõe um endpoint de chat. Demonstra a integração básica entre Fastify e uma chain de LangChain.

- **Stack:** Node.js, TypeScript, Fastify, LangChain, LangGraph
- **Conceito:** Primeiros passos com LangChain e grafos de estado

### 03 — Medical Appointment (Prompt Chaining)

Pipeline de geração de artigos técnicos em três etapas (Plan → Draft → Review) usando **prompt chaining** com **outputs estruturados via Zod** e reenvio automático até qualidade ≥ 8/10.

- **Stack:** Node.js, TypeScript, LangGraph, Zod, OpenRouter
- **Conceito:** Prompt chaining, structured outputs, conditional edges
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 04 — Song Highlights (LangGraph Memory)

Recomendador de músicas conversacional com **memória persistente entre turnos** usando `MemorySaver` do LangGraph. A IA aprende preferências do usuário ao longo do diálogo.

- **Stack:** Node.js, TypeScript, LangGraph, OpenRouter
- **Conceito:** Thread-based sessions, conversation history, memory persistence
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 05 — Safeguard & Prompt Injection

Demonstração educacional de **ataques de prompt injection** e defesas com **guardrails**. Mostra lado a lado o comportamento com e sem proteção usando o mesmo system prompt.

- **Stack:** Node.js, TypeScript, LangGraph, OpenRouter
- **Conceito:** Segurança em LLMs, guardrails, role-based access control
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 06 — RAG com Neo4j e Alunos

Pipeline RAG completo usando **Neo4j como banco vetorial** para recuperar dados de alunos e gerar respostas contextualizadas. Inclui Docker Compose para o Neo4j.

- **Stack:** Node.js, TypeScript, LangGraph, Neo4j, OpenRouter
- **Conceito:** RAG pipeline, vector search, graph database
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 07 — Doc Analysis

Análise de documentos com LLM. Referências e links de estudo sobre Large Language Models.

- **Stack:** Node.js, TypeScript, LangGraph
- **Conceito:** Document processing, LLM analysis

---

## 🗓️ Módulos 1–5 — Projeto Prático

### WeeklyScheduler — Agenda Semanal com IA

Aplicação web de gerenciamento de agenda semanal com assistente de IA conversacional, guardrails de segurança e exportação de PDF.

- **Stack:** Next.js 15, TypeScript, LangGraph, Ollama (`llama3.2`), jsPDF, CSS Grid
- **Funcionalidades:**
  - Chat em linguagem natural para adicionar e remover eventos
  - Calendário semanal visual (07h–20h) com grade CSS
  - Detecção de conflitos de horário com modal de confirmação
  - Nó de guardrails que classifica e bloqueia mensagens fora do escopo
  - Exportação do calendário para PDF em landscape
  - Suporte a markdown na resposta do LLM
- **Arquitetura LangGraph:**
  ```
  START → guardrails_check → chat (safe) → END
                           → blocked (unsafe) → END
  ```

---

## 🔑 Pré-requisitos Comuns

- **Node.js 18+** e npm/yarn
- **Docker + Docker Compose** (exemplos 06 e WeeklyScheduler)
- **Ollama** com o modelo `llama3.2` (WeeklyScheduler)
- **Conta no [OpenRouter](https://openrouter.ai)** com créditos (exemplos 01–06)

Configure o arquivo `.env` de cada projeto a partir do `.env.example` correspondente.

---

_Materiais desenvolvidos como parte da Pós-Graduação em IA Aplicada — Aula 2_
