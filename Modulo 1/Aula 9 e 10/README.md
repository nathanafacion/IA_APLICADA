# 🚗 Módulo 9 e 10 — Busca RAG de Carros

Este módulo apresenta o projeto **car-search**, uma aplicação de RAG (Retrieval-Augmented Generation) para busca de carros por linguagem natural, utilizando Neo4j, embeddings e LLM via OpenRouter.

## Objetivo

Demonstrar o pipeline completo de RAG: o usuário digita uma consulta em português, a IA recupera os carros semanticamente mais próximos (Retrieval) e um LLM gera uma resposta contextualizada com base nesses dados reais (Generation).

## Pipeline RAG

```
Usuário digita query
        │
        ▼
[R] OpenRouter — text-embedding-3-small
        │  vetor de 1536 dimensões
        ▼
[R] Neo4j — busca vetorial (similaridade coseno)
        │  top-6 carros do banco
        ▼
[A] Prompt aumentado com contexto dos carros recuperados
        │
        ▼
[G] OpenRouter — gpt-4o-mini
        │  resposta em linguagem natural
        ▼
Interface Next.js — resposta IA + cards dos carros
```

| Etapa      | Sigla | Tecnologia         | O que faz                                                     |
| ---------- | ----- | ------------------ | ------------------------------------------------------------- |
| Retrieval  | **R** | Neo4j + embeddings | Busca vetorial — traz os carros reais mais similares          |
| Augmented  | **A** | Prompt engineering | Injeta os dados recuperados no contexto do LLM                |
| Generation | **G** | gpt-4o-mini        | Gera resposta natural baseada _somente_ nos dados recuperados |

> O LLM **não inventa carros** — ele só interpreta e comunica o que o Neo4j já buscou.

## Tecnologias

- Next.js
- React
- TypeScript
- Neo4j
- OpenRouter (embeddings e LLM)

## Como executar

Veja o arquivo [README do projeto car-search](Modulo%209%20e%2010/car-search/README.md) para instruções detalhadas.

---

Desenvolvido para o curso de IA Aplicada — Pós-Graduação UNIP.
