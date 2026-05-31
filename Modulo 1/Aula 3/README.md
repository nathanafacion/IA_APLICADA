# 📚 Módulo 3 - Sistemas de Recomendação

Este módulo aborda **Sistemas de Recomendação** utilizando técnicas de Machine Learning e TensorFlow.js no navegador.

## 🎯 Objetivo do Módulo

Aprender a construir sistemas de recomendação inteligentes que utilizam aprendizado de máquina para sugerir itens similares com base em características e preferências dos usuários.

## 📂 Conteúdo

### 🎲 RecomendaBoardgame

Sistema completo de recomendação de jogos de tabuleiro (board games) que demonstra:

**Tecnologias Utilizadas:**
- **Next.js 14** - Framework React com App Router
- **TensorFlow.js** - Machine Learning no navegador
- **Tailwind CSS** - Estilização moderna
- **Web Workers** - Treinamento assíncrono sem travar a UI
- **IndexedDB** - Persistência local do modelo treinado

**Funcionalidades Principais:**
- ✨ Interface intuitiva com busca por autocomplete
- 🧠 Modelo de ML treinado no navegador
- 🔍 Recomendações baseadas em **similaridade de cosseno**
- 📊 Análise de características dos jogos (complexidade, duração, número de jogadores, etc.)
- 💾 Modelo persistido localmente para uso offline
- 🚀 Aceleração por hardware com WebGL

**Conceitos Aprendidos:**
- Como treinar modelos de ML no navegador
- Implementação de sistemas de recomendação
- Cálculo de similaridade entre vetores (embeddings)
- Normalização e preparação de dados
- Arquitetura de aplicações com ML
- Uso de Web Workers para processamento pesado
- Persistência de modelos treinados

## 🚀 Como Começar

Acesse o projeto **RecomendaBoardgame** para instruções detalhadas de instalação e uso:

```bash
cd RecomendaBoardgame
npm install
npm run prepare-data
npm run dev
```

Consulte os seguintes documentos dentro do projeto:
- `README.md` - Guia completo de uso
- `ARCHITECTURE.md` - Arquitetura e estrutura do código
- `QUICK_START.md` - Início rápido

## 📖 Recursos Adicionais

**Conceitos-chave abordados:**
- Sistemas de Recomendação baseados em conteúdo (Content-Based Filtering)
- Embeddings e representação vetorial
- Métricas de similaridade (cosseno)
- TensorFlow.js no navegador
- Otimização de performance em aplicações ML

**Arquitetura:**
- Clean Architecture
- Separação de responsabilidades (UI, Hooks, Services)
- TypeScript para type safety
- Componentes reutilizáveis e modulares
