# 🚀 Guia Rápido de Início

## ✅ Setup Completo!

O projeto foi configurado com sucesso. Agora você pode:

### 1. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 2. Fluxo de Uso

#### Primeiro Uso:

1. **Treinar o Modelo**
   - Vá para http://localhost:3000/treinar
   - O treinamento inicia automaticamente
   - Aguarde aproximadamente 2-5 minutos
   - O modelo será salvo no IndexedDB

2. **Obter Recomendações**
   - Volte para http://localhost:3000
   - Digite o nome de um jogo (ex: "Catan", "Pandemic")
   - Selecione um jogo da lista
   - Veja as 4 recomendações mais similares!

#### Usos Subsequentes:

- O modelo já estará treinado
- Vá direto para a página principal e busque jogos
- Se quiser retreinar, vá em `/treinar` e clique em "Treinar Novamente"

## 📊 Dados

- ✅ 5.952 jogos de tabuleiro carregados
- ✅ 11 features normalizadas por jogo
- ✅ JSON gerado em `public/data/raw_data.json`

## 🧠 Modelo

**Arquitetura do Autoencoder:**

- Camada 1: 128 unidades (ReLU)
- Camada 2: 64 unidades (ReLU)
- Camada 3: 11 unidades (Sigmoid)

**Treinamento:**

- 50 épocas
- Batch size: 32
- Validação: 20%
- Otimizador: Adam (lr=0.001)
- Loss: Mean Squared Error
- Backend: WebGL

## 🎯 Features Utilizadas

1. Número mínimo de jogadores
2. Número máximo de jogadores
3. Tempo mínimo de jogo
4. Tempo máximo de jogo
5. Tempo médio de jogo
6. Idade mínima
7. Complexidade (1-5)
8. Número de avaliações (log scale)
9. Número de comentários (log scale)
10. Ano de publicação
11. Avaliação média

## 🐛 Solução de Problemas

### Modelo não encontrado

```bash
# Vá para /treinar e aguarde o treinamento
```

### Erro ao carregar dados

```bash
# Execute novamente:
npm run prepare-data
```

### Limpar modelo e retreinar

```bash
# Abra o Console do navegador (F12) e execute:
indexedDB.deleteDatabase('tensorflowjs');
# Depois vá para /treinar
```

## 📦 Scripts Disponíveis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run start         # Servidor de produção
npm run prepare-data  # Converter CSV → JSON
```

## 🎨 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- TensorFlow.js 4.17
- Tailwind CSS 3.4
- Web Workers

## ⚡ Performance

- Modelo salvo localmente no navegador
- Treinamento em background (não trava UI)
- Predições em tempo real
- Aceleração GPU via WebGL
