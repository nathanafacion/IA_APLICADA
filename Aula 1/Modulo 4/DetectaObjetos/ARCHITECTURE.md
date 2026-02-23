# Detector de Objetos em Vídeo

Aplicação de detecção de objetos em tempo real usando COCO-SSD e TensorFlow.js com Web Workers.

## 🏗️ Arquitetura do Projeto

```
app/
  ├── page.tsx              # Página principal (orquestrador)
  ├── layout.tsx            # Layout da aplicação
  └── globals.css           # Estilos globais

components/
  ├── Header/
  │   ├── Header.tsx
  │   └── index.ts
  ├── StatsPanel/
  │   ├── StatsPanel.tsx
  │   ├── StatsPanel.types.ts
  │   └── index.ts
  ├── ErrorMessage/
  │   ├── ErrorMessage.tsx
  │   ├── ErrorMessage.types.ts
  │   └── index.ts
  ├── ControlPanel/
  │   ├── ControlPanel.tsx
  │   ├── ControlPanel.types.ts
  │   └── index.ts
  ├── VideoPlayer/
  │   ├── VideoPlayer.tsx
  │   ├── VideoPlayer.types.ts
  │   └── index.ts
  ├── DetectionCanvas/
  │   ├── DetectionCanvas.tsx
  │   └── index.ts
  ├── VideoPlayerWithCanvas/
  │   ├── VideoPlayerWithCanvas.tsx
  │   ├── VideoPlayerWithCanvas.types.ts
  │   └── index.ts
  ├── ObjectInventory/
  │   ├── ObjectInventory.tsx
  │   ├── ObjectInventory.types.ts
  │   └── index.ts
  ├── CurrentDetections/
  │   ├── CurrentDetections.tsx
  │   ├── CurrentDetections.types.ts
  │   └── index.ts
  └── Instructions/
      ├── Instructions.tsx
      └── index.ts

hooks/
  ├── useObjectDetector.ts       # Gerencia Web Worker e detecções
  ├── useObjectDetector.types.ts # Tipos do hook useObjectDetector
  ├── useVideoProcessor.ts       # Gerencia processamento de frames
  └── useVideoProcessor.types.ts # Tipos do hook useVideoProcessor

types/
  └── detection.ts          # Tipos TypeScript globais

public/
  └── detector-cocossd.worker.js  # Web Worker para COCO-SSD
```

## 📦 Componentes

### Componentes de UI

- **Header**: Cabeçalho da aplicação
- **StatsPanel**: Exibe estatísticas (modelo, FPS, tempo de inferência)
- **ErrorMessage**: Exibe mensagens de erro
- **ControlPanel**: Botões para carregar vídeo e controlar processamento
- **ObjectInventory**: Lista de objetos únicos detectados
- **CurrentDetections**: Lista de detecções no frame atual
- **Instructions**: Instruções de uso

### Componentes de Vídeo

- **VideoPlayer**: Player de vídeo com controles
- **DetectionCanvas**: Canvas para desenhar bounding boxes
- **VideoPlayerWithCanvas**: Composição de VideoPlayer + Canvas

## 🎣 Hooks Personalizados

### `useObjectDetector`

Gerencia o Web Worker de detecção de objetos.

**Retorna:**

- `isModelLoaded`: Indica se o modelo está carregado
- `detectedObjects`: Set de objetos únicos detectados
- `currentDetections`: Array de detecções no frame atual
- `inferenceTime`: Tempo de inferência em ms
- `error`: Mensagem de erro, se houver
- `detectObjects`: Função para enviar frame para detecção

### `useVideoProcessor`

Gerencia o processamento de frames do vídeo.

**Props:**

- `videoRef`: Ref do elemento video
- `canvasRef`: Ref do elemento canvas
- `isModelLoaded`: Se o modelo está carregado
- `currentDetections`: Detecções atuais
- `onDetect`: Callback para detectar objetos

**Retorna:**

- `isProcessing`: Se está processando
- `isProcessingFrame`: Se está processando frame atual
- `fps`: Frames por segundo
- `processFrame`: Função para processar frame
- `setIsProcessing`: Setter de isProcessing
- `setIsProcessingFrame`: Setter de isProcessingFrame

## 🚀 Como Usar

1. Instale as dependências:

```bash
yarn install
```

2. Inicie o servidor de desenvolvimento:

```bash
yarn dev
```

3. Abra [http://localhost:3000](http://localhost:3000)

4. Aguarde o modelo carregar e faça upload de um vídeo

## 🎯 Benefícios da Arquitetura

### Separação de Responsabilidades

- Cada componente tem uma única responsabilidade
- Hooks encapsulam lógica complexa
- Facilita manutenção e testes
- **Tipos isolados**: Cada componente/hook tem seu arquivo `.types.ts` dedicado

### Reutilização

- Componentes podem ser reutilizados em outras partes da aplicação
- Hooks podem ser compartilhados entre componentes
- Tipos podem ser importados e reutilizados conforme necessário

### Manutenibilidade

- Código organizado e fácil de navegar
- Mudanças em um componente não afetam outros
- Cada arquivo tem um propósito claro
- **Tipos centralizados**: Fácil localizar e modificar interfaces

### Testabilidade

- Componentes e hooks podem ser testados isoladamente
- Lógica separada da apresentação
- Tipos facilitam testes com TypeScript

### Type Safety

- Cada componente tem suas próprias definições de tipos em `*.types.ts`
- Facilita identificação de erros em tempo de desenvolvimento
- Autocomplete melhorado em IDEs
- Documentação implícita através dos tipos

## 🔧 Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **TailwindCSS**: Estilização
- **TensorFlow.js**: Machine Learning no navegador
- **COCO-SSD**: Modelo de detecção de objetos
- **Web Workers**: Processamento em segundo plano

## 📝 Notas Técnicas

- Processamento otimizado com throttling (2 FPS)
- Web Worker para não bloquear a thread principal
- Gerenciamento adequado de memória (cleanup de blob URLs)
- TypeScript para type safety
