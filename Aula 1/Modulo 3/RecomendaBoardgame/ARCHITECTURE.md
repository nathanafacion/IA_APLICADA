# 📐 Arquitetura do Projeto - RecomendaBoardgame

Este documento descreve a arquitetura do projeto baseada em **Clean Architecture** com separação clara de responsabilidades.

## 🏗️ Estrutura de Pastas

```
RecomendaBoardgame/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de recomendações
│   ├── treinar/page.tsx    # Página de treinamento
│   └── globals.css         # Estilos globais
├── components/             # Componentes de UI (Puros/Dumb)
│   ├── Autocomplete/       # Campo de busca com autocomplete
│   ├── SelectedGameCard/   # Card do jogo selecionado
│   ├── RecommendationCard/ # Card de recomendação individual
│   ├── RecommendationsList/# Lista de recomendações
│   ├── RecommendationsContainer/ # Smart Component (orquestrador)
│   ├── ErrorMessage/       # Mensagem de erro
│   └── LoadingSpinner/     # Componente de loading
├── hooks/                  # Hooks customizados reutilizáveis
│   ├── useModel.ts         # Gerenciamento do modelo TensorFlow
│   ├── useGamesData.ts     # Carregamento de dados de jogos
│   └── useRecommendations.ts # Geração de recomendações
├── services/               # Lógica de serviços externos
│   ├── modelService.ts     # Serviço de modelo TensorFlow
│   └── similarityService.ts # Cálculo de similaridade
├── types/                  # Definições TypeScript globais
│   └── game.ts             # Tipos relacionados a jogos
├── utils/                  # Funções utilitárias e helpers
│   └── gameUtils.ts        # Utilitários para manipulação de jogos
├── lib/                    # Código legado (será removido)
│   └── tensorflow.ts       # Funções antigas do TensorFlow
├── public/
│   ├── data/
│   │   └── raw_data.json   # Dados processados (5.952 jogos)
│   └── trainWorker.js      # Web Worker de treinamento
├── scripts/
│   └── convertData.js      # Script de conversão CSV → JSON
└── dados/
    └── raw_data.csv        # Dados originais
```

## 📦 Camadas da Arquitetura

### 1. **Presentation Layer** (`app/` e `components/`)

Responsável pela interface do usuário e interação.

#### **Pages (app/)**

- `page.tsx` - Página principal de recomendações
- `treinar/page.tsx` - Página de treinamento do modelo

#### **Components (components/)**

**Componentes Puros (Dumb Components):**

- Recebem dados via props
- Não possuem lógica de negócio
- Não fazem chamadas a APIs ou serviços
- Facilmente testáveis

Exemplos:

- `SelectedGameCard` - Exibe detalhes do jogo selecionado
- `RecommendationCard` - Exibe um card de recomendação
- `RecommendationsList` - Lista de cards de recomendações
- `ErrorMessage` - Mensagem de erro formatada
- `LoadingSpinner` - Indicador de carregamento

**Smart Components (Container Components):**

- Gerenciam estado e lógica
- Orquestram componentes puros
- Fazem chamadas a hooks e services

Exemplos:

- `RecommendationsContainer` - Orquestra toda a lógica de recomendações

### 2. **Business Logic Layer** (`hooks/`)

Contém a lógica de negócio reutilizável através de custom hooks.

**Hooks Customizados:**

#### `useModel()`

```typescript
{
  model: tf.Sequential | null,
  isLoading: boolean,
  error: string | null,
  modelLoaded: boolean
}
```

- Inicializa TensorFlow.js
- Carrega modelo do IndexedDB
- Gerencia estado do modelo

#### `useGamesData()`

```typescript
{
  games: Game[],
  isLoading: boolean,
  error: string | null
}
```

- Carrega dados de jogos do JSON
- Gerencia cache de dados
- Trata erros de carregamento

#### `useRecommendations()`

```typescript
{
  recommendations: GameWithSimilarity[],
  isLoading: boolean,
  error: string | null,
  generateRecommendations: (game, model, allGames) => Promise<void>
}
```

- Gera recomendações baseadas em similaridade
- Usa o modelo para fazer predições
- Calcula jogos similares

### 3. **Service Layer** (`services/`)

Encapsula integrações com serviços externos e bibliotecas.

#### `modelService.ts`

Gerenciamento do modelo TensorFlow.js:

- `initializeTensorFlow()` - Inicializa TF com WebGL
- `createModel()` - Cria arquitetura do autoencoder
- `modelExists()` - Verifica existência no IndexedDB
- `loadModel()` - Carrega modelo salvo
- `saveModel()` - Persiste modelo
- `getPredictions()` - Obtém predições do modelo

#### `similarityService.ts`

Cálculos de similaridade:

- `calculateCosineSimilarity()` - Similaridade de cosseno
- `calculateEuclideanDistance()` - Distância euclidiana
- `findSimilarGames()` - Encontra jogos similares

### 4. **Utilities Layer** (`utils/`)

Funções auxiliares reutilizáveis.

#### `gameUtils.ts`

Utilitários para manipulação de dados de jogos:

- `formatNumber()` - Formata números
- `getFirstName()` - Extrai primeiro nome
- `parseYear()` - Converte ano para inteiro
- `formatComplexity()` - Formata complexidade
- `getPlayersInfo()` - Info de jogadores
- `getDurationInfo()` - Info de duração
- `getMinAge()` - Idade mínima
- `getRatingsCount()` - Número de avaliações

### 5. **Types Layer** (`types/`)

Definições TypeScript centralizadas.

#### `game.ts`

```typescript
interface Game {
  id: number;
  nome_do_jogo: string;
  description: string;
  designer: string;
  year: string;
  category: string;
  mechanism: string;
  average_rating: string;
  complexity_rating: string;
  features: number[];
  raw_features?: number[];
}

interface GameWithSimilarity extends Game {
  similarity: number;
}

interface TrainingProgress { ... }
interface TrainingStatus { ... }
interface WorkerMessage { ... }
```

## 🔄 Fluxo de Dados

### Página de Recomendações

```
1. User Interaction
   └─> Autocomplete Component

2. Component Event
   └─> RecommendationsContainer
       ├─> useModel() - carrega modelo
       ├─> useGamesData() - carrega dados
       └─> useRecommendations() - gera recomendações

3. Hooks chamam Services
   ├─> modelService.getPredictions()
   └─> similarityService.findSimilarGames()

4. Data Processing
   └─> gameUtils (formatação)

5. Render
   ├─> SelectedGameCard (jogo selecionado)
   └─> RecommendationsList
       └─> RecommendationCard (cada recomendação)
```

## 🎯 Princípios Aplicados

### 1. **Separation of Concerns**

Cada camada tem responsabilidade única e bem definida.

### 2. **Dependency Inversion**

Camadas superiores dependem de abstrações (hooks, services), não de implementações.

### 3. **Single Responsibility**

Cada módulo/componente tem uma única razão para mudar.

### 4. **DRY (Don't Repeat Yourself)**

Lógica compartilhada em hooks, services e utils.

### 5. **Testability**

- Componentes puros fáceis de testar
- Hooks isolados testáveis
- Services mockáveis

## 📝 Boas Práticas

### Components

✅ **DO:**

- Criar componentes puros sempre que possível
- Usar TypeScript para props
- Manter componentes pequenos e focados
- Documentar props complexas

❌ **DON'T:**

- Colocar lógica de negócio em componentes puros
- Fazer fetch de dados diretamente em componentes
- Criar componentes muito grandes (>200 linhas)

### Hooks

✅ **DO:**

- Usar hooks para lógica reutilizável
- Retornar objetos com estados e funções
- Tratar erros internamente
- Documentar parâmetros e retorno

❌ **DON'T:**

- Criar hooks muito genéricos
- Misturar múltiplas responsabilidades
- Retornar muitos valores (>5)

### Services

✅ **DO:**

- Criar funções puras sempre que possível
- Lançar erros claros e específicos
- Documentar parâmetros complexos
- Retornar tipos consistentes

❌ **DON'T:**

- Acessar estado React diretamente
- Fazer side effects não documentados
- Misturar lógica de diferentes domínios

## 🚀 Benefícios desta Arquitetura

1. **Manutenibilidade** - Código organizado e fácil de encontrar
2. **Testabilidade** - Camadas independentes e mockáveis
3. **Escalabilidade** - Fácil adicionar novas features
4. **Reusabilidade** - Hooks e components compartilháveis
5. **Legibilidade** - Estrutura clara e padronizada
6. **Performance** - Separação permite otimizações direcionadas

## 📚 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/)
