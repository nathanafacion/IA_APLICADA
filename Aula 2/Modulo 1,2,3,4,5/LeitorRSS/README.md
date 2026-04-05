# 📰 Leitor RSS Inteligente com IA

Leitor de feeds RSS com assistente de IA integrado, construído com Next.js, LangGraph e Ollama. O assistente conversa com o usuário, gerencia feeds, resume notícias e faz recomendações personalizadas baseadas nos interesses do usuário.

## ✨ Funcionalidades

- **Gerenciamento de Feeds RSS** — Adicionar, remover e listar feeds via chat ou interface
- **Sincronização de Artigos** — Busca automática de novos artigos (RSS 2.0 e Atom)
- **Chat com IA** — Assistente inteligente usando LangGraph + Ollama
- **Guardrails de Segurança** — Proteção contra prompt injection e jailbreak
- **Resumo de Notícias** — Resumos gerados por IA de qualquer artigo
- **Recomendações Personalizadas** — 5 artigos sugeridos com base no histórico e interesses do usuário
- **Summary Automático** — A cada 10 mensagens, gera um resumo dos interesses do usuário
- **Sugestão de Feeds** — O assistente sugere novos feeds (só adiciona com confirmação do usuário)
- **Conversa Casual** — O assistente aceita conversa informal para conhecer melhor o usuário

## 🏗️ Arquitetura

```
LeitorRSS/
├── src/
│   ├── app/                    # Frontend React + API Routes
│   │   ├── page.tsx            # Página principal
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── globals.css         # Estilos globais
│   │   ├── api/
│   │   │   ├── articles/       # CRUD de artigos
│   │   │   ├── chat/           # Chat com IA + summary automático
│   │   │   ├── feeds/          # CRUD de feeds
│   │   │   ├── recommend/      # Recomendações personalizadas
│   │   │   ├── summarize/      # Resumo de artigos
│   │   │   └── sync/           # Sincronização de feeds
│   │   ├── components/
│   │   │   ├── ArticleFeed/    # Lista de artigos (com destaque de recomendados)
│   │   │   ├── ChatPanel/      # Painel de chat com IA
│   │   │   └── FeedList/       # Sidebar de feeds
│   │   └── hooks/
│   │       ├── useChat.ts      # Lógica do chat
│   │       └── useFeeds.ts     # Lógica de feeds e artigos
│   ├── core/
│   │   └── graph/              # LangGraph workflow
│   │       ├── graph.ts        # Grafo principal
│   │       ├── state.ts        # Estado do grafo
│   │       └── nodes/
│   │           ├── chatNode.ts           # Nó de resposta do LLM
│   │           ├── blockedNode.ts        # Nó de mensagem bloqueada
│   │           ├── guardrailsCheckNode.ts # Nó de verificação de segurança
│   │           └── edgeConditions.ts     # Condições de roteamento
│   ├── lib/
│   │   ├── db.ts               # SQLite (better-sqlite3)
│   │   ├── ollama.ts           # Configuração do Ollama
│   │   └── rssParser.ts        # Parser RSS/Atom customizado
│   └── types/
│       └── index.ts            # Tipos TypeScript
└── data/
    └── rss.db                  # Banco SQLite (gerado automaticamente)
```

## 🔄 Fluxo do LangGraph

```
START → guardrails_check → ┬─ chat ──→ END
                           └─ blocked → END
```

| Nó                 | Função                                                           |
| ------------------ | ---------------------------------------------------------------- |
| `guardrails_check` | Valida se a mensagem é segura (permite conversa casual)          |
| `chat`             | Gera resposta + extrai comandos JSON (add_feed, recommend, etc.) |
| `blocked`          | Retorna mensagem de bloqueio para tentativas maliciosas          |

## 📡 Endpoints da API

| Rota             | Método | Descrição                                     |
| ---------------- | ------ | --------------------------------------------- |
| `/api/feeds`     | GET    | Lista todos os feeds                          |
| `/api/feeds`     | POST   | Adiciona novo feed (valida URL, previne SSRF) |
| `/api/feeds`     | DELETE | Remove feed por ID                            |
| `/api/articles`  | GET    | Lista artigos (filtro opcional por feedId)    |
| `/api/articles`  | PATCH  | Marca artigo como lido                        |
| `/api/sync`      | POST   | Sincroniza artigos dos feeds                  |
| `/api/chat`      | POST   | Envia mensagem para o assistente de IA        |
| `/api/summarize` | POST   | Gera resumo de um artigo                      |
| `/api/recommend` | GET    | Retorna 5 artigos recomendados                |

## 🗄️ Banco de Dados (SQLite)

| Tabela         | Descrição                                                                   |
| -------------- | --------------------------------------------------------------------------- |
| `rss_feeds`    | Feeds cadastrados (id, name, url, category, lastFetch)                      |
| `rss_articles` | Artigos sincronizados (id, feedId, title, link, description, pubDate, read) |
| `chat_history` | Histórico de conversas (role, content, timestamp)                           |
| `user_summary` | Resumo de interesses do usuário (summary, lastMessageId)                    |

## 💬 Comandos do Chat

| Comando            | Exemplo                                     |
| ------------------ | ------------------------------------------- |
| Adicionar feed     | "Adicione o feed https://example.com/feed/" |
| Remover feed       | "Remova o feed GKPB"                        |
| Listar feeds       | "Quais são meus feeds?"                     |
| Resumir notícia    | "Resuma a notícia sobre IA"                 |
| Recomendar artigos | "Me recomende artigos para ler"             |
| Sugerir feeds      | "Sugira feeds sobre tecnologia"             |
| Conversa casual    | "Eu gosto de mangá e rock!"                 |

## 🎯 Sistema de Recomendações

1. **Conversa** — O usuário conversa normalmente, compartilhando gostos e preferências
2. **Summary** — A cada 10 mensagens, o sistema gera um resumo dos interesses do usuário
3. **Recomendação** — Quando solicitado, o LLM usa o summary + histórico + artigos disponíveis para selecionar 5 artigos
4. **Destaque visual** — Os cards recomendados ganham borda roxa e tag "Leia"
5. **Confirmação** — Uma mensagem no chat lista os artigos recomendados

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) instalado e rodando

### Instalar o modelo do Ollama

```bash
ollama pull llama3.2
```

### Instalar dependências e rodar

```bash
cd LeitorRSS
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Variáveis de Ambiente (opcionais)

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## 📦 Scripts

| Script          | Comando         |
| --------------- | --------------- |
| Desenvolvimento | `npm run dev`   |
| Build           | `npm run build` |
| Produção        | `npm start`     |
| Lint            | `npm run lint`  |

## 🛠️ Stack Tecnológica

- **Next.js 15** — Framework React full-stack
- **React 18** — Interface de usuário
- **TypeScript** — Tipagem estática
- **LangGraph** — Orquestração de fluxo de IA com grafos
- **LangChain** — Integração com LLMs
- **Ollama** — LLM local (llama3.2)
- **better-sqlite3** — Banco de dados SQLite embarcado
- **UUID** — Geração de identificadores únicos

## 🔒 Segurança

- **Guardrails** — Filtragem de mensagens antes de processar pelo LLM
- **Anti-SSRF** — Validação de URLs para prevenir Server-Side Request Forgery
- **Anti-Injection** — Detecção de tentativas de prompt injection e jailbreak
- **Conversa segura** — Conversa casual é permitida; apenas conteúdo genuinamente malicioso é bloqueado
