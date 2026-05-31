# Aula 3 — MCPs, Skills, Agents e Personalização do Copilot

Esta aula foca na construção e uso de **MCPs (Model Context Protocol)**, **Skills**, **Agents personalizados** e integração com **LangChain**, explorando o ecossistema de ferramentas para agentes de IA.

---

## 📂 Estrutura

```
Aula 3/
├── Exemplos de Aula/
│   ├── 01-multiple-mcp-tools-template/
│   ├── 01-multiple-mcp-tools-z/
│   ├── 02-google-trends-agent/
│   ├── 03-dev-instructions-agents/
│   ├── 04-skills/
│   ├── 05-mcps-do-zero-template/
│   ├── 05-mcps-do-zero-z/
│   ├── 06-your-legacy-api-as-mcp/
│   ├── 07-api-security-auth-rate-limiting-template/
│   ├── 07-api-security-auth-rate-limiting-z/
│   ├── 08-publishing-mcps-private-npm/
│   └── 09-using-mcp-with-langchain/
└── Módulo 1,2,3/
    └── content-trends-analyzer/
```

---

## 🧪 Exemplos de Aula

### 01 — Multiple MCP Tools

Agente LangGraph que conecta múltiplos MCPs (CSV, filesystem, MongoDB) como tools, demonstrando como orquestrar diferentes fontes de dados via MCP Adapters.

- **Stack:** Node.js, TypeScript, LangGraph, LangChain, MCP Adapters, Fastify, MongoDB
- **Conceito:** Composição de múltiplos MCPs, tool orchestration
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 02 — Google Trends Agent

Agente LangGraph que utiliza SerpAPI Google Trends como ferramenta LangChain para responder questões sobre estratégia de conteúdo para vídeos.

- **Stack:** Node.js, TypeScript, LangGraph, LangChain, MCP Adapters, SerpAPI
- **Conceito:** Transformar serviços externos em tools para agentes

### 03 — Dev Instructions & Agents

Exemplos de configuração de agentes personalizados para o GitHub Copilot usando arquivos `.agent.md`. Inclui agentes para desenvolvimento, geração de testes Playwright, e healer de testes.

- **Stack:** Markdown (configuração de agentes)
- **Conceito:** Customização de agentes no VS Code via `.github/agents/`

### 04 — Skills

Demonstração de Skills para o GitHub Copilot — pacotes de conhecimento reutilizáveis que ampliam as capacidades do agente (ffmpeg, Neo4j Cypher, find-skills).

- **Stack:** Markdown, JSON (configuração de skills)
- **Conceito:** Criação e instalação de skills para agentes

### 05 — MCPs do Zero

Construção de um MCP server do zero usando o SDK oficial `@modelcontextprotocol/sdk`, implementando um servidor de criptografia AES-256-CBC com Tools, Resources e Prompts.

- **Stack:** Node.js, TypeScript, MCP SDK, Zod
- **Conceito:** Pilares do MCP (Tools, Resources, Prompts), criação de servidores MCP
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 06 — Your Legacy API as MCP

Transformação de uma API REST legada (Fastify + MongoDB CRUD de clientes) em um MCP server, permitindo que agentes de IA interajam com APIs existentes.

- **Stack:** Node.js, Fastify, MongoDB, MCP SDK
- **Conceito:** Migração de APIs legadas para MCP, bridge entre REST e MCP

### 07 — API Security: Auth & Rate Limiting

Adição de camadas de segurança (JWT authentication e rate limiting) ao MCP server e à API REST de clientes.

- **Stack:** Node.js, Fastify, MongoDB, MCP SDK, `@fastify/jwt`, `@fastify/rate-limit`
- **Conceito:** Segurança em MCPs, autenticação JWT, rate limiting
- Sufixo `-template`: código base fornecido; sufixo `-z`: solução completa

### 08 — Publishing MCPs (Private NPM)

Publicação de MCP servers como pacotes npm, tanto em registros privados (Verdaccio) quanto públicos (npmjs.org), permitindo distribuição via `npx`.

- **Stack:** Node.js, npm, Verdaccio (Docker), MCP SDK
- **Conceito:** Distribuição e versionamento de MCPs via npm

### 09 — Using MCP with LangChain

Integração de MCP servers como ferramentas de agentes LangChain/LangGraph, demonstrando como consumir MCPs programaticamente via `@langchain/mcp-adapters`.

- **Stack:** Node.js, TypeScript, LangGraph, LangChain, MCP Adapters, Fastify, MongoDB
- **Conceito:** Consumo de MCPs em pipelines LangChain

---

## 📦 Módulos 1–3 — Projeto Prático

### Content Trends Analyzer

Aplicação Next.js que analisa títulos e descrições de conteúdo usando dados do Google Trends, retornando um score de potencial viral (0-100), feedback, palavras-chave sugeridas e sugestões de títulos otimizados gerados por IA local (Ollama).

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI, Zustand, Recharts, Ollama (`llama3.2`), SearchApi, Vitest
- **Funcionalidades:**
  - Análise de potencial viral de títulos e descrições
  - Score de 0 a 100 com feedback detalhado e palavras-chave em alta
  - Sugestões de títulos otimizados gerados via LLM local
  - Dashboard de tendências com termos em alta no Brasil
  - Gráficos interativos de interesse ao longo do tempo
  - 85 testes unitários e de integração
- **Arquitetura:** Screaming Architecture organizada por features

---

Desenvolvido com ❤️ para o curso de IA Aplicada
