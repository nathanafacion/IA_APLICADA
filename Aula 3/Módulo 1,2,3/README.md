# Módulo 1, 2 e 3 — Projetos Práticos

## 📂 Projetos

### Content Trends Analyzer

Aplicação Next.js que analisa títulos e descrições de conteúdo usando dados do Google Trends, retornando um score de potencial viral (0-100), feedback, palavras-chave sugeridas e sugestões de títulos otimizados gerados por IA local (Ollama).

- **[content-trends-analyzer](content-trends-analyzer/)** - Analisador de tendências de conteúdo com score de potencial viral
  - Análise de potencial viral de títulos e descrições usando Google Trends
  - Score de 0 a 100 com feedback detalhado e palavras-chave em alta
  - Sugestões de títulos otimizados gerados via LLM local (Ollama)
  - Dashboard de tendências com termos em alta no Brasil
  - Gráficos interativos de interesse ao longo do tempo (Recharts)
  - UI moderna com Shadcn/UI, Tailwind CSS 4 e tema violet/rose
  - 85 testes unitários e de integração com Vitest
  - Arquitetura: Screaming Architecture organizada por features
  - Tecnologias: Next.js 16, React 19, TypeScript, Zustand, Recharts, Ollama, SearchApi
