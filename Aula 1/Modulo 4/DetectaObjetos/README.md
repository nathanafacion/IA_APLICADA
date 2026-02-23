# 🎥 Detector de Objetos em Vídeo

Uma aplicação web moderna e performática para detecção de objetos em vídeos em tempo real, utilizando **COCO-SSD**, **TensorFlow.js** e **Web Workers**.

![Demo](./demo.gif)

## 📹 Demonstração em Vídeo

[🎬 Assista ao vídeo de demonstração aqui](COLOQUE_O_LINK_DO_VIDEO_AQUI)

<!-- Ou se você tiver o vídeo localmente, use:
<video width="100%" controls>
  <source src="./demo.mp4" type="video/mp4">
  Seu navegador não suporta vídeos HTML5.
</video>
-->

## 🌟 Características

- ✅ **Detecção em Tempo Real**: Processa vídeos com detecção de objetos frame a frame
- ✅ **80 Classes de Objetos**: Detecta pessoas, carros, animais, objetos do cotidiano e muito mais (dataset COCO)
- ✅ **Performance Otimizada**: Web Workers para processamento assíncrono sem travar a UI
- ✅ **Throttling Inteligente**: Processa 2 FPS para manter o navegador responsivo
- ✅ **Inventário de Objetos**: Rastreia todos os objetos únicos detectados no vídeo
- ✅ **Detecções Atuais**: Mostra objetos detectados no frame atual com score de confiança
- ✅ **Interface Moderna**: UI responsiva com Tailwind CSS e gradientes
- ✅ **TypeScript**: Type safety completo em toda a aplicação
- ✅ **Arquitetura Limpa**: Componentes modulares e reutilizáveis

## 🚀 Tecnologias Utilizadas

| Tecnologia        | Propósito                                  |
| ----------------- | ------------------------------------------ |
| **Next.js 14**    | Framework React com App Router             |
| **TypeScript**    | Tipagem estática e type safety             |
| **TensorFlow.js** | Machine Learning no navegador              |
| **COCO-SSD**      | Modelo pré-treinado de detecção de objetos |
| **Web Workers**   | Processamento em background                |
| **Tailwind CSS**  | Estilização moderna e responsiva           |
| **React Hooks**   | Gerenciamento de estado e lógica           |

## 📂 Estrutura do Projeto

```
DetectaObjetos/
├── app/
│   ├── page.tsx              # 🎯 Página principal (orquestrador)
│   ├── layout.tsx            # 📐 Layout da aplicação
│   └── globals.css           # 🎨 Estilos globais
│
├── components/               # 🧩 Componentes reutilizáveis
│   ├── Header/
│   ├── StatsPanel/
│   ├── ErrorMessage/
│   ├── ControlPanel/
│   ├── VideoPlayer/
│   ├── DetectionCanvas/
│   ├── VideoPlayerWithCanvas/
│   ├── ObjectInventory/
│   ├── CurrentDetections/
│   └── Instructions/
│       ├── *.tsx             # Implementação do componente
│       ├── *.types.ts        # Definições de tipos
│       └── index.ts          # Exportador
│
├── hooks/                    # 🎣 Hooks personalizados
│   ├── useObjectDetector.ts       # Gerencia Web Worker e detecções
│   ├── useObjectDetector.types.ts
│   ├── useVideoProcessor.ts       # Gerencia processamento de frames
│   └── useVideoProcessor.types.ts
│
├── types/                    # 📝 Tipos TypeScript globais
│   └── detection.ts
│
├── public/                   # 📦 Arquivos públicos
│   └── detector-cocossd.worker.js  # Web Worker
│
└── ARCHITECTURE.md           # 📖 Documentação da arquitetura
```

## 🎨 Arquitetura e Padrões

### Padrão de Componentização

Cada componente segue a estrutura:

```
ComponentName/
  ├── ComponentName.tsx        # Implementação
  ├── ComponentName.types.ts   # Tipos e interfaces
  └── index.ts                 # Exportador (facilita imports)
```

### Hooks Personalizados

#### `useObjectDetector`

Gerencia todo o ciclo de vida do Web Worker de detecção:

- Inicialização do modelo COCO-SSD
- Envio de frames para detecção
- Recebimento de resultados
- Gerenciamento de inventário de objetos

#### `useVideoProcessor`

Gerencia o processamento de frames do vídeo:

- Desenho de bounding boxes no canvas
- Throttling para performance
- Cálculo de FPS
- Controle do loop de animação

### Web Workers

O processamento de detecção roda em um Web Worker separado para:

- ✅ Não bloquear a thread principal
- ✅ Manter a UI responsiva
- ✅ Processar frames em paralelo

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 18+
- Yarn ou npm

### Passo a Passo

1. **Clone o repositório**

```bash
cd "Aula 1/Modulo 4/DetectaObjetos"
```

2. **Instale as dependências**

```bash
yarn install
# ou
npm install
```

3. **Inicie o servidor de desenvolvimento**

```bash
yarn dev
# ou
npm run dev
```

4. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no navegador

### Como Usar

1. ⏳ **Aguarde o modelo carregar** - Indicador verde aparecerá quando pronto
2. 📁 **Clique em "Carregar Vídeo"** - Selecione um arquivo MP4 ou WebM
3. ▶️ **Clique em "Processar"** - Inicia a detecção em tempo real
4. 👀 **Observe as detecções** - Bounding boxes aparecem sobre os objetos
5. 📦 **Acompanhe o inventário** - Painel lateral mostra todos os objetos únicos detectados

## 🎯 O Que Foi Implementado

### 1. Refatoração Completa da Arquitetura ♻️

- **Antes**: 1 arquivo monolítico de ~380 linhas
- **Depois**: 10+ componentes modulares + 2 hooks personalizados
- **Resultado**: Código mais limpo, manutenível e testável

### 2. Separação de Tipos 📝

Criamos arquivos `.types.ts` separados para:

- Todos os componentes
- Todos os hooks
- Melhor organização e reutilização de tipos

### 3. Otimização de Performance 🚀

- **Throttling**: Processa apenas 2 FPS em vez de 30-60 FPS
- **Controle de fila**: Só envia novo frame quando anterior foi processado
- **Limpeza de memória**: Revoga blob URLs adequadamente
- **Web Workers**: Processa ML sem travar a UI

### 4. Componentes Criados 🧩

| Componente              | Responsabilidade                           |
| ----------------------- | ------------------------------------------ |
| `Header`                | Título e descrição da aplicação            |
| `StatsPanel`            | Status do modelo, FPS, tempo de inferência |
| `ErrorMessage`          | Exibição de erros                          |
| `ControlPanel`          | Botões de upload e controle                |
| `VideoPlayer`           | Player de vídeo HTML5                      |
| `DetectionCanvas`       | Canvas para bounding boxes                 |
| `VideoPlayerWithCanvas` | Composição de player + canvas              |
| `ObjectInventory`       | Lista de objetos únicos detectados         |
| `CurrentDetections`     | Objetos no frame atual                     |
| `Instructions`          | Guia de uso                                |

### 5. Hooks Personalizados 🎣

- **useObjectDetector**: Encapsula toda lógica de detecção
- **useVideoProcessor**: Encapsula processamento de frames

### 6. Limpeza de Código 🧹

- Removidos arquivos não utilizados (YOLO, modelos antigos)
- Organização clara de pastas
- Imports limpos e organizados

## 🎓 Conceitos Aplicados

### Clean Architecture

- **Separação de responsabilidades**: Cada arquivo tem um propósito único
- **Injeção de dependências**: Props e callbacks bem definidos
- **Composição**: Componentes pequenos compondo funcionalidades maiores

### React Best Practices

- **Hooks personalizados**: Lógica reutilizável extraída
- **Componentes puros**: Sem efeitos colaterais desnecessários
- **Refs adequadamente**: Para elementos DOM nativos
- **useCallback**: Para funções que dependem de estado

### TypeScript

- **Type safety**: Tipos para todas as props e retornos
- **Interfaces separadas**: Arquivos `.types.ts` dedicados
- **Documentação implícita**: Tipos servem como documentação

### Performance

- **Web Workers**: Processamento assíncrono
- **Throttling**: Controle de taxa de processamento
- **Cleanup adequado**: useEffect com funções de limpeza
- **Gerenciamento de memória**: Revogação de blob URLs

## 📊 Métricas

- **Linhas de código reduzidas**: ~380 → ~170 no componente principal
- **Componentes criados**: 10
- **Hooks personalizados**: 2
- **Arquivos de tipos**: 9
- **Performance**: Vídeos de 30s processados sem travamentos

## 🐛 Troubleshooting

### O modelo não carrega

- Verifique sua conexão com a internet (CDN do TensorFlow.js)
- Abra o console do navegador para ver erros

### Vídeo não aparece

- Certifique-se de usar formato MP4 ou WebM
- Verifique permissões de arquivo

### Navegador trava

- Ajuste o `PROCESS_INTERVAL` em `useVideoProcessor.ts`
- Reduza a resolução do vídeo

## 📚 Recursos e Referências

- [TensorFlow.js](https://www.tensorflow.org/js)
- [COCO-SSD Model](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
- [Next.js Documentation](https://nextjs.org/docs)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

## 🤝 Contribuindo

Este é um projeto educacional. Sinta-se livre para:

- Fazer fork
- Experimentar
- Melhorar
- Aprender

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👨‍💻 Autor

Desenvolvido como parte do curso de IA Aplicada

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
