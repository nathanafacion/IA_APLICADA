# 🎲 RecomendaBoardgame

Sistema de recomendação de jogos de tabuleiro usando **Next.js** e **TensorFlow.js**.

![Screenshot do Sistema](screencapture.png)

## 📋 Características

- ✨ Interface moderna com **Next.js 14** (App Router)
- 🧠 Machine Learning com **TensorFlow.js**
- 🎨 Estilização com **Tailwind CSS**
- 🔄 Treinamento em **Web Worker** (não trava a UI)
- 💾 Persistência de modelo no **IndexedDB**
- 🚀 Aceleração por hardware com **WebGL**
- 🔍 Sistema de autocomplete inteligente
- 📊 Recomendações baseadas em similaridade de cosseno

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Preparar os Dados

O script de preparação de dados converte o CSV em JSON e normaliza as features:

```bash
npm run prepare-data
```

Este comando:

- Lê o arquivo `dados/raw_data.csv`
- Extrai e normaliza features numéricas
- Gera `public/data/raw_data.json`

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 4. Treinar o Modelo

1. Navegue para `/treinar`
2. O treinamento inicia automaticamente se o modelo não existir
3. Acompanhe o progresso em tempo real (épocas, loss, MAE)
4. O modelo é salvo automaticamente no IndexedDB

### 5. Obter Recomendações

1. Volte para a página inicial (`/`)
2. Digite o nome de um jogo no campo de busca
3. Selecione um jogo nas sugestões
4. Veja os 4 jogos mais similares!

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com separação clara de responsabilidades. Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para documentação detalhada.

### Camadas

- **types/** - Definições TypeScript centralizadas
- **services/** - Lógica de negócio e integrações externas
- **hooks/** - Hooks React customizados reutilizáveis
- **utils/** - Funções utilitárias
- **components/** - Componentes de UI (puros e smart)
- **app/** - Páginas Next.js

### Modelo de Machine Learning

**Autoencoder Neural Network:**

Um autoencoder é uma rede neural que aprende a **comprimir** e **reconstruir** dados, capturando apenas as características mais importantes.

```
INPUT (11 features)
    ↓
[128 neurônios - ReLU - HeNormal] ← EXPANDE para capturar padrões
    ↓
[64 neurônios - ReLU - HeNormal]  ← COMPRIME (bottleneck)
    ↓
[11 neurônios - Sigmoid]          ← RECONSTRÓI (0 a 1)
    ↓
OUTPUT (11 features reconstruídas)
```

#### Arquitetura Detalhada

**Camada 1 - Encoder (Entrada):**

- **128 neurônios** - Expande a entrada para capturar padrões complexos e interações entre features
- **ReLU activation** - `max(0, x)` - Introduz não-linearidade, rápida e evita vanishing gradients
- **HeNormal initialization** - Inicialização inteligente dos pesos desenvolvida para ReLU, evita gradientes explosivos/desaparecidos

**Camada 2 - Bottleneck (Oculta):**

- **64 neurônios** - Comprime a informação, forçando o modelo a aprender apenas features essenciais
- **ReLU activation** - Mesma função de ativação para manter consistência
- **HeNormal initialization** - Mantém o fluxo de gradientes na rede profunda

**Camada 3 - Decoder (Saída):**

- **11 neurônios** - Reconstrói as features originais
- **Sigmoid activation** - Garante saída entre 0 e 1, ideal para dados normalizados
- **GlorotUniform initialization** (padrão) - Funciona bem com sigmoid

#### Configuração de Treinamento

**Otimizador:** Adam (learning rate = 0.001)

- Ajusta automaticamente a taxa de aprendizado para cada peso
- Converge mais rápido que SGD tradicional

**Loss Function:** Mean Squared Error (MSE)

- **Fórmula:** `MSE = (1/n) * Σ(y_true - y_pred)²`
- **Por quê:** Penaliza mais erros grandes (devido ao quadrado), ideal para reconstrução de dados contínuos
- **Usado para:** Otimizar os pesos durante o treinamento

**Métrica:** Mean Absolute Error (MAE)

- **Fórmula:** `MAE = (1/n) * Σ|y_true - y_pred|`
- **Por quê:** Mais interpretável que MSE (mesma unidade dos dados)
- **Usado para:** Monitorar e avaliar a performance do modelo
- **Exemplo:** MAE = 0.05 significa erro médio de 5% por feature

**Features utilizadas:**

1. Número mínimo de jogadores
2. Número máximo de jogadores
3. Tempo mínimo de jogo
4. Tempo máximo de jogo
5. Tempo médio de jogo
6. Idade mínima
7. Complexidade
8. Número de avaliações (escala logarítmica)
9. Número de comentários (escala logarítmica)
10. Ano de publicação
11. Avaliação média

### Cálculo de Similaridade

Utiliza **Similaridade de Cosseno** entre os vetores de features preditos pelo modelo para encontrar jogos similares.

## 📁 Estrutura do Projeto

```
RecomendaBoardgame/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Layout principal
│   ├── page.tsx                    # Página de recomendações
│   ├── treinar/page.tsx            # Página de treinamento
│   └── globals.css                 # Estilos globais
├── components/                      # Componentes de UI
│   ├── Autocomplete/               # Autocomplete com busca
│   ├── SelectedGameCard/           # Card do jogo selecionado
│   ├── RecommendationCard/         # Card de recomendação
│   ├── RecommendationsList/        # Lista de recomendações
│   ├── RecommendationsContainer/   # Container orquestrador (smart)
│   ├── ErrorMessage/               # Mensagem de erro
│   └── LoadingSpinner/             # Indicador de loading
├── hooks/                          # Custom Hooks
│   ├── useModel.ts                 # Gerenciamento do modelo
│   ├── useGamesData.ts             # Carregamento de dados
│   └── useRecommendations.ts       # Geração de recomendações
├── services/                       # Serviços de negócio
│   ├── modelService.ts             # Serviço TensorFlow.js
│   └── similarityService.ts        # Cálculos de similaridade
├── types/                          # Definições TypeScript
│   └── game.ts                     # Tipos de jogos
├── utils/                          # Funções utilitárias
│   └── gameUtils.ts                # Utilitários de jogos
├── public/
│   ├── data/raw_data.json          # Dados processados (gerado)
│   └── trainWorker.js              # Web Worker de treinamento
├── scripts/
│   └── convertData.js              # Script CSV → JSON
├── dados/
│   └── raw_data.csv                # Dados originais
├── ARCHITECTURE.md                 # Documentação da arquitetura
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TensorFlow.js** - Machine Learning no navegador
- **Tailwind CSS** - Estilização
- **Web Workers** - Processamento assíncrono

## 📊 Processo de Treinamento

1. **Carregamento:** Dados são carregados do JSON
2. **Preparação:** Features extraídas e convertidas em tensors
3. **Treinamento:** Autoencoder aprende representações (50 épocas)
4. **Validação:** 20% dos dados reservados para validação
5. **Persistência:** Modelo salvo no IndexedDB

## 🎯 Como Funciona a Recomendação

1. Usuário seleciona um jogo
2. Modelo carrega as features do jogo
3. Modelo gera predições para todos os jogos
4. Calcula similaridade de cosseno entre o jogo selecionado e todos os outros
5. Retorna os 4 jogos mais similares (excluindo o selecionado)

## ⚡ Performance

- **Backend WebGL:** Aceleração por GPU
- **Web Worker:** Treinamento não bloqueia a UI
- **IndexedDB:** Persistência local do modelo
- **Lazy Loading:** TensorFlow.js carregado de forma assíncrona

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção (inclui preparação de dados)
- `npm run start` - Inicia servidor de produção
- `npm run prepare-data` - Converte CSV para JSON

## 🐛 Troubleshooting

### Modelo não encontrado

- Vá para `/treinar` e aguarde o treinamento completar

### Dados não carregam

- Execute `npm run prepare-data` manualmente
- Verifique se `public/data/raw_data.json` existe

### Erros de TensorFlow

- Limpe o cache do navegador
- Verifique se o navegador suporta WebGL

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido com

Este projeto foi desenvolvido seguindo as especificações do arquivo `gereSistema.md`, implementando todas as funcionalidades requisitadas.
