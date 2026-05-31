# Módulo 4 - Detecção de Objetos em Tempo Real

## 📚 Sobre

Este módulo foca em técnicas avançadas de Computer Vision, explorando detecção de objetos em tempo real utilizando modelos pré-treinados e processamento de vídeo no navegador.

## 📂 Projetos

### [DetectaObjetos](DetectaObjetos/)

Sistema completo de detecção de objetos em tempo real utilizando TensorFlow.js e o modelo COCO-SSD, processando vídeos diretamente no navegador.

#### 🎯 Características Principais

- **Detecção em Tempo Real:** Processa vídeos a 2 FPS (500ms de intervalo) para performance otimizada
- **80 Classes de Objetos:** Detecta pessoas, animais, veículos, móveis, eletrônicos e muito mais
- **Processamento Assíncrono:** Web Workers isolam o processamento de ML sem travar a UI
- **Interface Responsiva:** Design moderno com Tailwind CSS e componentes React
- **Arquitetura Modular:** Código organizado em componentes e hooks reutilizáveis
- **TypeScript:** Tipagem forte com arquivos `.types.ts` separados

#### 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Machine Learning:** TensorFlow.js 4.17.0, COCO-SSD 2.2.3
- **UI:** React 18, Tailwind CSS
- **Performance:** Web Workers, requestAnimationFrame, ImageBitmap API
- **Canvas API:** Renderização de labels de detecção

#### 📊 Funcionalidades

1. **Upload de Vídeo:** Suporte para arquivos MP4, WebM, OGV
2. **Detecção Inteligente:** Identifica objetos com score de confiança
3. **Estatísticas em Tempo Real:**
   - Total de objetos detectados
   - FPS de processamento
   - Objetos únicos identificados
4. **Inventário de Objetos:** Lista completa com contadores por classe
5. **Detecções Atuais:** Painel com objetos visíveis no frame atual
6. **Controles de Vídeo:** Play, pause, reset integrados

#### 🏗️ Arquitetura

O projeto segue uma arquitetura componentizada com separação de responsabilidades:

```
DetectaObjetos/
├── app/
│   └── page.tsx              # Orquestrador principal
├── components/               # Componentes UI modulares
│   ├── Header/
│   ├── StatsPanel/
│   ├── VideoPlayerWithCanvas/
│   ├── ObjectInventory/
│   ├── CurrentDetections/
│   └── Instructions/
├── hooks/                    # Lógica de negócio
│   ├── useObjectDetector.ts  # Gerencia Web Worker
│   └── useVideoProcessor.ts  # Processa frames e desenha
├── public/
│   └── detector-cocossd.worker.js  # Worker isolado
└── types/
    └── detection.ts          # Tipos compartilhados
```

#### 🚀 Melhorias Implementadas

**Performance:**

- Throttling de processamento (500ms entre frames)
- Controle de frame único com flag `isProcessingFrame`
- Cleanup automático de memória do TensorFlow
- Uso de `requestAnimationFrame` para renderização suave

**Experiência do Usuário:**

- Labels de detecção com fundo semi-transparente
- Score de confiança em porcentagem
- Interface limpa sem caixas de bounding box
- Feedback visual durante carregamento do modelo

**Qualidade do Código:**

- Tipagem estrita com TypeScript
- Componentes com responsabilidade única
- Hooks customizados para lógica reutilizável
- Documentação inline e arquivos README

#### 📖 Como Usar

```bash
# Navegar até o projeto
cd "Aula 1/Modulo 4/DetectaObjetos"

# Instalar dependências
yarn install

# Executar em modo desenvolvimento
yarn dev

# Acessar no navegador
http://localhost:3000
```

## 🎓 Conceitos Aprendidos

- **Computer Vision:** Detecção de objetos com modelos pré-treinados
- **TensorFlow.js:** Execução de modelos de ML no navegador
- **COCO-SSD:** Modelo popular para detecção de objetos
- **Web Workers:** Processamento assíncrono sem bloquear a UI
- **Canvas API:** Manipulação de pixels e desenho em tempo real
- **Performance Web:** Otimização de aplicações intensivas em processamento
- **Arquitetura de Software:** Separação de concerns e modularização
- **TypeScript Avançado:** Tipagem de hooks, componentes e workers

## 📈 Desafios Superados

1. **Freezing do Navegador:** Resolvido com throttling e Web Workers
2. **Blob URLs:** Gerenciamento correto do ciclo de vida das URLs
3. **Alinhamento de Bounding Boxes:** Cálculo preciso de escala entre vídeo e canvas
4. **Memória:** Limpeza adequada de tensores do TensorFlow.js

---

Desenvolvido como parte do curso de IA Aplicada - Módulo 4
