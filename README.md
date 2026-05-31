# Pós-Graduação em IA Aplicada

## Sobre este Repositório

Este repositório contém os projetos e exercícios práticos desenvolvidos durante a Pós-Graduação em Inteligência Artificial Aplicada.

**Objetivo:** Aplicar os conhecimentos adquiridos ao longo do curso, consolidando conceitos teóricos através de implementações práticas e projetos hands-on.

## Sobre o Curso

Pós-Graduação em IA Aplicada oferecida pela UNIP.

🔗 [Mais informações sobre o curso](https://unipds.com.br/gads_pos_ia/?utm_source=google&utm_medium=cpc&utm_campaign=[Leads-Search]_[IA]_[01]&utm_content=exata&utm_term=pos%20em%20ia&gad_source=1&gad_campaignid=23319256454&gbraid=0AAAABCB3wCaD7E8_jfLkBz-bEfzxrlnXo&gclid=CjwKCAiAzOXMBhASEiwAe14SaWiG4REWm2rfzcZDg50co5UfiDfddK9sI_fTvEkhhygCq97rpbRSahoCce0QAvD_BwE)

## Estrutura do Repositório

### Modulo 1 / Aula 2 - Detecção de Imagens

#### 📁 DetectarCartasComTeachablemachine

Projeto de detecção de cartas utilizando Teachable Machine e TensorFlow.js.

- Tecnologias: Next.js, React, TypeScript, TensorFlow.js
- Funcionalidade: Reconhecimento e análise de cartas de baralho

#### 📁 DetectarFrutasTensorflow

Projeto de classificação de frutas utilizando TensorFlow.

- Tecnologias: Next.js, React, TensorFlow
- Funcionalidade: Identificação e classificação de diferentes tipos de frutas

### Modulo 1 / Aula 3 - Sistemas de Recomendação

#### 📁 RecomendaBoardgame

Sistema de recomendação de jogos de tabuleiro (board games) utilizando TensorFlow.js.

- Tecnologias: Next.js, React, TypeScript, TensorFlow.js, Tailwind CSS, Web Workers
- Funcionalidade: Recomendações inteligentes baseadas em similaridade de cosseno
- Características: Treinamento no navegador, persistência com IndexedDB, interface com autocomplete

### Modulo 1 / Aula 4 - Detecção de Objetos em Tempo Real

#### 📁 DetectaObjetos

Sistema de detecção de objetos em tempo real em vídeos utilizando COCO-SSD e TensorFlow.js.

- Tecnologias: Next.js, React, TypeScript, TensorFlow.js, Tailwind CSS, Web Workers
- Funcionalidade: Detecção de 80 classes de objetos (pessoas, animais, veículos, móveis, etc.)
- Características: Processamento a 2 FPS, interface responsiva, estatísticas em tempo real, arquitetura modular

### Modulo 1 / Aula 5, 6 e 7 - Quiz de Matemática com IA

#### 📁 Quiz

O objetivo principal deste módulo foi aprender sobre Large Language Models (LLMs) e como criar bons prompts para agentes de IA. Como prática, desenvolvemos uma aplicação web de quiz de matemática com geração de questões por IA local (Ollama + Genkit), validação matemática robusta e gráficos interativos.

- Tecnologias: Next.js, React, TypeScript, Tailwind CSS, Chart.js, Genkit, Ollama, mathjs
- Funcionalidades: Geração automática de questões, 3 níveis de dificuldade, tópicos personalizáveis, validação rigorosa, gráficos de desempenho, explicações didáticas, arquitetura modular e integração com Genkit

### Modulo 1 / Aula 8 - Gestor de Tarefas com FastMCP

#### 📁 gestor_tarefas

Sistema completo de gestão de tarefas construído com FastMCP (Model Context Protocol).

- Tecnologias: Python, FastMCP
- Funcionalidades: Demonstração dos pilares MCP (Tools, Resources, Prompts), API para adicionar, listar, atualizar e remover tarefas, persistência automática das tarefas, documentação detalhada e exemplos de uso

### Modulo 1 / Aula 9 e 10 - Busca RAG de Carros

#### 📁 car-search

Aplicação de busca de carros por linguagem natural usando RAG (Retrieval-Augmented Generation), Neo4j, embeddings e LLM via OpenRouter.

- Tecnologias: Next.js, React, TypeScript, Neo4j, OpenRouter
- Funcionalidades: Busca vetorial por similaridade, geração de resposta contextualizada por LLM, pipeline completo de RAG

### Modulo 2 — LangChain, LangGraph e Agentes de IA

#### 📁 Exemplos da Aula

Série de exemplos práticos demonstrados em aula, cobrindo os principais conceitos de LangChain e LangGraph:

| Exemplo                           | Descrição                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------ |
| **01-smart-model-router-gateway** | Gateway Fastify que roteia requisições para diferentes modelos via OpenRouter  |
| **02-langchain-intro**            | Introdução ao LangChain com servidor HTTP e chain básica                       |
| **03-medical-appointment**        | Prompt chaining com outputs estruturados via Zod (Plan → Draft → Review)       |
| **04-song-highlights**            | Recomendador de músicas com memória persistente via `MemorySaver` do LangGraph |
| **05-safeguard-prompt-injection** | Demonstração de ataques de prompt injection e defesas com guardrails           |
| **06-rag-neo4j-students**         | Pipeline RAG completo com Neo4j como banco vetorial                            |
| **07-doc-analysis**               | Análise de documentos com LLM                                                  |

> Cada exemplo possui versão `-template` (código base) e `-z` (solução completa).

- Tecnologias: Node.js, TypeScript, LangChain, LangGraph, Fastify, Neo4j, Zod, OpenRouter

#### 📁 LeitorRSS

Leitor de feeds RSS com assistente de IA integrado. O assistente conversa com o usuário, gerencia feeds, resume notícias e faz recomendações personalizadas baseadas nos interesses do usuário.

- Tecnologias: Next.js, React, TypeScript, LangGraph, LangChain, Ollama (llama3.2), better-sqlite3, Zod
- Funcionalidades: Gerenciamento de feeds via chat ou interface, sincronização automática de artigos (RSS 2.0 e Atom), resumo de notícias por IA, recomendações personalizadas, summary automático de interesses, guardrails contra prompt injection, proteção anti-SSRF
- Arquitetura: Grafo de estados `START → guardrails_check → (chat | blocked) → END`

#### 📁 WeeklyScheduler

Aplicação de agenda semanal com assistente conversacional em português, guardrails de segurança e exportação de PDF. Demonstra o uso de LangGraph para orquestração de agentes com roteamento condicional.

- Tecnologias: Next.js, React, TypeScript, LangGraph, Ollama (llama3.2), jsPDF, CSS Grid
- Funcionalidades: Chat em linguagem natural para adicionar/remover eventos, grade semanal visual (07h–20h), detecção de conflitos de horário, nó de guardrails que filtra mensagens fora do escopo, exportação do calendário para PDF
- Arquitetura: Grafo de estados `START → guardrails_check → (chat | blocked) → END`

### Modulo 3 — MCPs, Skills, Agents e Personalização do Copilot

#### 📁 Exemplos de Aula

Série de exemplos práticos cobrindo o ecossistema MCP (Model Context Protocol), Skills e Agents personalizados:

| Exemplo                                | Descrição                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| **01-multiple-mcp-tools**              | Agente LangGraph que orquestra múltiplos MCPs (CSV, filesystem, MongoDB)                  |
| **02-google-trends-agent**             | Agente que usa SerpAPI Google Trends como tool para estratégia de conteúdo                |
| **03-dev-instructions-agents**         | Agentes personalizados para o Copilot via `.github/agents/` (dev, Playwright)             |
| **04-skills**                          | Skills reutilizáveis para o Copilot (ffmpeg, Neo4j Cypher, find-skills)                   |
| **05-mcps-do-zero**                    | MCP server do zero com SDK oficial — criptografia AES-256-CBC (Tools, Resources, Prompts) |
| **06-your-legacy-api-as-mcp**          | Transformação de API REST legada (Fastify + MongoDB) em MCP server                        |
| **07-api-security-auth-rate-limiting** | Segurança em MCPs com JWT authentication e rate limiting                                  |
| **08-publishing-mcps-private-npm**     | Publicação de MCPs como pacotes npm (Verdaccio privado e npmjs.org)                       |
| **09-using-mcp-with-langchain**        | Consumo de MCP servers como tools em pipelines LangChain/LangGraph                        |

> Cada exemplo possui versão `-template` (código base) e `-z` (solução completa).

- Tecnologias: Node.js, TypeScript, LangGraph, LangChain, MCP SDK, MCP Adapters, Fastify, MongoDB, Verdaccio

#### 📁 Content Trends Analyzer

Aplicação Next.js que analisa títulos e descrições de conteúdo usando dados do Google Trends, retornando um score de potencial viral (0-100), feedback, palavras-chave sugeridas e sugestões de títulos otimizados gerados por IA local (Ollama).

- Tecnologias: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI, Zustand, Recharts, Ollama (llama3.2), SearchApi, Vitest
- Funcionalidades: Análise de potencial viral de títulos, score 0-100 com feedback, sugestões de títulos otimizados por LLM, dashboard de tendências, gráficos interativos, 85 testes unitários e de integração
- Arquitetura: Screaming Architecture organizada por features

### Modulo 4 — Agentes Autônomos: do Contrato ao Runtime

Foco na construção de **agentes autônomos orientados a contratos** — o comportamento do agente é definido inteiramente por arquivos Markdown/YAML, e o runtime Python é agnóstico ao domínio. A aula cobre 13 módulos evolutivos (aula03 a aula15), partindo de contratos declarativos até memória semântica, reflexão evolutiva e evals mensuráveis.

#### 📁 CriaLLM

Runtime de agentes autônomos baseado em contratos YAML declarados em arquivos Markdown. Criar um novo agente é apenas escrever arquivos `.md` — sem tocar no código do runtime. Inclui o `rota-monitor-agent`, que monitora rotas de navegação em projetos Jekyll, Next.js e React Router.

- **Tecnologias:** Python, OpenAI GPT-4o-mini (modo mock disponível sem chave de API)
- **Conceito central:** Contract-Driven Agents — runtime agnóstico, contrato declarativo
- **Funcionalidades:** Ciclo perceber → planejar → agir → avaliar, circuit breaker, telemetria, CLI completa (`rodar`, `validar`, `rastreamento`, `replay`, `analisar`, `benchmark`, `tool-eval`, `memory-eval`)

#### 📁 aula04-agentes-autonomos

Evolução incremental do runtime ao longo de 13 módulos:

| Módulo     | Tema                                                               |
| ---------- | ------------------------------------------------------------------ |
| **aula03** | Os 9 contratos Markdown que definem um agente                      |
| **aula04** | Por dentro do runtime — 6 módulos Python e como cada YAML é lido   |
| **aula05** | Observabilidade em 4 níveis com o agente `trace-analyzer`          |
| **aula06** | 4 tipos de agente + agente `backlog-decomposer` (goal_oriented)    |
| **aula07** | Arquiteturas cognitivas como contrato + ReAct                      |
| **aula08** | Plan-Execute e Reflection — duas novas arquiteturas                |
| **aula09** | Evals, benchmark comparativo e equivalências LangChain/LangGraph   |
| **aula10** | Padrão Adapter + tools REST reais (FastAPI local)                  |
| **aula11** | Adapter de banco de dados, MCP e segurança declarativa no contrato |
| **aula12** | Tool selection eval com gabarito explícito e 4 métricas            |
| **aula13** | 4 tipos de memória (curta, longa, episódica, contextual)           |
| **aula14** | Embeddings, busca semântica e reflexão evolutiva                   |
| **aula15** | Evals de memória — comparação com vs sem memória                   |

#### 📁 GodotFramework

Pipeline multi-agente que transforma uma frase em linguagem natural em um projeto **Godot 4** completo — cenas `.tscn`, scripts `.gd` e `project.godot` — usando uma sequência de agentes especializados.

- **Tecnologias:** Python, OpenAI / Ollama (codellama, qwen3:8b) / Mock, Godot 4 GDScript
- **Agentes:** Diretor (arquitetura JSON) → Cena (`.tscn`) → Código (`.gd`) → Patcher (regex Godot 3→4) → Validador (`@onready` vs nós reais) → Self-Healing (autocorreção)
- **Jogos gerados:**
  - `output/shoot_em_up_2d/` — shoot em up espacial gerado 100% pelo pipeline LLM (nave, inimigos, power-ups, leaderboard)
  - `output/truco_paulista/` — **Truco Mineiro** criado manualmente (manilha pela vira, layout circular de mesa, IA conservadora, escalada Normal → Truco → Seis → Nove → Doze)

#### 📁 TechLeadChatBot

Agente especialista em Tech Lead com memória de longo prazo por sprint, observabilidade integrada e rastreamento de execuções.

- **Tecnologias:** Python, FastAPI, LangGraph, Mem0, Langfuse (backend) · React + Vite (frontend)
- **Modelo:** OpenAI GPT-4o
- **Memória:** Mem0 armazena e recupera automaticamente contextos de sprints passadas por usuário (busca semântica)
- **Observabilidade:** Langfuse registra cada execução — prompts, respostas, latência e custo de tokens
- **Funcionalidades:** Chat especializado em planejamento, arquitetura e boas práticas de Tech Lead; contexto de sprint injetável; memória que evolui entre conversas

### Modulo 5 — IA para UX: Engenharia de Requisitos com Agentes

Foco na aplicação de IA no processo de **UX e engenharia de requisitos** — usando agentes do GitHub Copilot para transformar descrições de problemas de negócio em especificações técnicas completas e visualmente estruturadas.

#### 📁 AgenteUX

Agente para o **GitHub Copilot Chat** que, dada uma descrição de problema ou cenário de UX, executa autonomamente uma pipeline de especificação técnica completa.

| Passo                        | O que gera                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| 🎯 Escopo                    | Resumo do entendimento do problema e proposta da solução           |
| ⚙️ Requisitos Funcionais     | Lista de RFs com verbos de ação, agrupados por módulo              |
| 🔒 Requisitos Não-Funcionais | RNFs com métricas mensuráveis (performance, segurança, LGPD, etc.) |
| 📊 Diagrama Mermaid          | Fluxograma do funcionamento da solução                             |
| 💾 Arquivo `.md`             | Salva toda a especificação em um arquivo `especificacao-<tema>.md` |
| 🖼️ Imagem do diagrama        | Gera e embute a imagem estática do diagrama via `mermaid.ink`      |

- **Tecnologias:** GitHub Copilot Chat, VS Code, Mermaid
- **Funcionalidades:** Geração automática de RFs e RNFs, diagramas de fluxo, exportação de especificação em Markdown

---

## Como Executar os Projetos

Navegue até a pasta do projeto desejado e siga as instruções específicas no README de cada projeto.

---

_Repositório desenvolvido como parte do programa de Pós-Graduação em IA Aplicada_
