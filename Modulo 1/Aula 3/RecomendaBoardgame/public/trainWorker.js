// Training Web Worker
// IMPORTANTE: Este Worker roda em contexto isolado e NÃO pode importar módulos ES6/TypeScript
// Por isso, createModel() e outras funções precisam ser reimplementadas aqui
// 
// Separação de responsabilidades:
// - trainWorker.js: TREINAMENTO (roda em thread separada, não trava UI)
// - modelService.ts: INFERÊNCIA (carrega modelo e faz predições)
//
// Load TensorFlow.js from CDN
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');

console.log('Worker iniciado, TensorFlow.js carregado:', typeof tf !== 'undefined');

const MODEL_PATH = 'indexeddb://game-model';
const FEATURE_SIZE = 11;

// Listen for messages from the main thread
self.addEventListener('message', async (e) => {
  const { type, data } = e.data;
  
  console.log('Worker recebeu mensagem:', type);
  
  if (type === 'START_TRAINING') {
    await startTraining(data.games, data.epochs);
  }
});

// ============================================================================
// ARQUITETURA DO MODELO AUTOENCODER
// ============================================================================
// Cria a arquitetura do modelo (duplicado de modelService.ts por necessidade)
// Web Workers não conseguem importar módulos TypeScript
//
// O que é um Autoencoder?
// É uma rede neural que aprende a COMPRIMIR (encoder) e RECONSTRUIR (decoder) dados.
// Input: 11 features → Comprime para 64 → Reconstrói para 11 features
// Objetivo: Aprender REPRESENTAÇÕES importantes dos jogos
function createModel(inputSize = FEATURE_SIZE) {
  // -------------------------------------------------------------------------
  // Linha 1: Criar modelo sequencial
  // -------------------------------------------------------------------------
  // tf.sequential() = modelo com camadas empilhadas em SEQUÊNCIA
  // Alternativa seria tf.model() (mais complexo, permite ramificações)
  const model = tf.sequential();
  
  // =========================================================================
  // CAMADA 1: ENTRADA + ENCODER (Compressão)
  // =========================================================================
  model.add(tf.layers.dense({
    // units: 128
    // -------
    // Número de neurônios na camada
    // 128 neurônios > 11 features entrada = EXPANDE primeiro
    // Por quê? Permite capturar PADRÕES COMPLEXOS e INTERAÇÕES entre features
    //
    // Exemplo prático:
    // - Input: [min_players=2, max_players=4, complexity=3.5, ...]
    // - 128 neurônios podem aprender: "jogos com 2-4 players E complexidade alta"
    //                                  "jogos com rating alto E muitos comentários"
    units: 128,
    
    // activation: 'relu'
    // ------------------
    // ReLU = Rectified Linear Unit = max(0, x)
    // Se x < 0 → retorna 0
    // Se x ≥ 0 → retorna x
    //
    // Por quê ReLU?
    // ✅ Rápida de calcular (simples comparação)
    // ✅ Evita "vanishing gradient" (gradientes que desaparecem)
    // ✅ Funciona bem para camadas intermediárias
    // ✅ Introduz NÃO-LINEARIDADE (essencial para aprender padrões complexos)
    //
    // Exemplo:
    // Neurônio recebe: -2.5 → ReLU → 0 (desativa neurônio)
    // Neurônio recebe: 3.7  → ReLU → 3.7 (mantém sinal)
    activation: 'relu',
    
    // inputShape: [inputSize]
    // -----------------------
    // Define formato da ENTRADA: array com 11 números
    // [inputSize] = [11] = 1 amostra com 11 features
    // Só é necessário na PRIMEIRA camada
    inputShape: [inputSize],
    
    // kernelInitializer: 'heNormal'
    // -----------------------------
    // CRÍTICO! Define como inicializar os PESOS (weights) da rede
    //
    // O que são pesos?
    // - Cada neurônio tem conexões com neurônios anteriores
    // - Cada conexão tem um PESO (multiplicador)
    // - No início do treinamento, pesos são ALEATÓRIOS
    //
    // Por quê HeNormal (He Normal Initialization)?
    // ✅ Desenvolvido por Kaiming He (2015) especialmente para ReLU
    // ✅ Gera pesos com distribuição: mean=0, variance=2/n (n=neurônios entrada)
    // ✅ RESOLVE "exploding/vanishing gradients" em redes profundas
    // ✅ Permite que sinais fluam BEM pelas camadas
    //
    // Alternativas e quando NÃO funcionam:
    // ❌ 'zeros' → todos neurônios aprendem a mesma coisa (simetria)
    // ❌ 'ones' → gradientes explodem rapidamente
    // ❌ 'glorotNormal' → funciona bem com TANH/SIGMOID, MAS NÃO com ReLU
    //
    // Exemplo prático:
    // Sem HeNormal: pesos ruins → sinal some → modelo não aprende
    // Com HeNormal: pesos balanceados → sinal flui → modelo aprende rápido
    kernelInitializer: 'heNormal',
  }));
  
  // =========================================================================
  // CAMADA 2: CAMADA OCULTA (Bottleneck - Gargalo)
  // =========================================================================
  model.add(tf.layers.dense({
    // units: 64
    // ---------
    // COMPRIME de 128 → 64 neurônios
    // Esta é a camada BOTTLENECK (gargalo) do autoencoder
    //
    // Por quê comprimir?
    // ✅ Força o modelo a aprender apenas as FEATURES MAIS IMPORTANTES
    // ✅ Remove ruído e redundâncias
    // ✅ Cria uma "representação compacta" dos jogos
    //
    // Analogia:
    // É como resumir um livro de 300 páginas em 10 páginas
    // → Você mantém apenas o ESSENCIAL
    //
    // Para jogos de tabuleiro:
    // - 11 features originais (players, tempo, complexidade...)
    // - 64 features aprendidas (padrões como "jogos familiares rápidos")
    units: 64,
    
    // activation: 'relu'
    // ------------------
    // Mesma função de ativação, pelos mesmos motivos
    activation: 'relu',
    
    // kernelInitializer: 'heNormal'
    // -----------------------------
    // Mesma inicialização, pois ainda usamos ReLU
    kernelInitializer: 'heNormal',
  }));
  
  // =========================================================================
  // CAMADA 3: SAÍDA + DECODER (Reconstrução)
  // =========================================================================
  model.add(tf.layers.dense({
    // units: inputSize (11)
    // ---------------------
    // RECONSTRÓI de 64 → 11 features (mesmo tamanho da entrada)
    // Objetivo: reconstruir os dados originais
    //
    // Fluxo completo:
    // 11 features → 128 neurônios → 64 neurônios → 11 features
    //   (input)      (expande)       (comprime)     (reconstrói)
    units: inputSize,
    
    // activation: 'sigmoid'
    // ---------------------
    // Sigmoid(x) = 1 / (1 + e^(-x))
    // Retorna valores entre 0 e 1
    //
    // Por quê SIGMOID aqui e não ReLU?
    // ✅ Nossos dados foram NORMALIZADOS entre 0 e 1
    // ✅ Sigmoid garante que a saída também fique entre 0 e 1
    // ✅ Perfeito para RECONSTRUIR dados normalizados
    //
    // Exemplo:
    // Feature original: complexity = 0.7 (normalizada)
    // Sigmoid output: 0.68 (próximo do original!)
    //
    // Se usássemos ReLU:
    // ❌ Poderia gerar valores > 1 (quebraria normalização)
    activation: 'sigmoid',
    
    // NÃO usamos kernelInitializer aqui
    // TensorFlow usa 'glorotUniform' por padrão, que funciona bem com sigmoid
  }));
  
  // =========================================================================
  // COMPILAÇÃO DO MODELO
  // =========================================================================
  // Define COMO o modelo vai aprender
  model.compile({
    // optimizer: tf.train.adam(0.001)
    // -------------------------------
    // Adam = Adaptive Moment Estimation
    // Algoritmo de otimização que AJUSTA os pesos para MINIMIZAR o erro
    //
    // Como funciona?
    // - Calcula gradiente (direção que diminui o erro)
    // - Atualiza pesos nessa direção
    // - Learning rate = 0.001 (tamanho do "passo")
    //
    // Por quê Adam?
    // ✅ Ajusta learning rate AUTOMATICAMENTE para cada peso
    // ✅ Converge mais rápido que SGD (Stochastic Gradient Descent)
    // ✅ Funciona bem sem muito tuning
    //
    // Por quê 0.001?
    // ✅ Valor padrão que funciona bem na maioria dos casos
    // ✅ Não é muito grande (evita divergência)
    // ✅ Não é muito pequeno (aprende rápido)
    optimizer: tf.train.adam(0.001),
    
    // loss: 'meanSquaredError'
    // ------------------------
    // MSE = Mean Squared Error = Média dos erros ao quadrado
    // Formula: MSE = (1/n) * Σ(y_true - y_pred)²
    //
    // O que mede?
    // Diferença entre:
    // - y_true = features originais [0.5, 0.3, 0.8, ...]
    // - y_pred = features reconstruídas [0.48, 0.32, 0.79, ...]
    //
    // Por quê MSE para Autoencoder?
    // ✅ PENALIZA MAIS erros grandes (devido ao quadrado)
    // ✅ Diferenciável (permite calcular gradiente)
    // ✅ Funciona bem com dados CONTÍNUOS (nossos features são números)
    // ✅ Padrão da indústria para problemas de REGRESSÃO
    //
    // Exemplo:
    // Feature original: complexity = 0.70
    // Predição ruim:    complexity = 0.50 → erro = (0.70-0.50)² = 0.04
    // Predição boa:     complexity = 0.69 → erro = (0.70-0.69)² = 0.0001
    //
    // Alternativas NÃO usadas:
    // ❌ 'categoricalCrossentropy' → para CLASSIFICAÇÃO (não é nosso caso)
    // ❌ 'binaryCrossentropy' → para BINÁRIO (0 ou 1, não valores contínuos)
    loss: 'meanSquaredError',
    
    // metrics: ['mae']
    // ----------------
    // MAE = Mean Absolute Error = Média dos erros absolutos
    // Formula: MAE = (1/n) * Σ|y_true - y_pred|
    //
    // O que mede?
    // Erro MÉDIO em termos ABSOLUTOS (sem quadrado)
    //
    // Por quê MAE como MÉTRICA (não como loss)?
    // ✅ Mais INTERPRETÁVEL que MSE (mesma unidade dos dados)
    // ✅ NÃO penaliza tanto outliers (não tem quadrado)
    // ✅ Útil para MONITORAR o treinamento
    //
    // Diferença entre LOSS e METRIC:
    // - LOSS (MSE): usado para TREINAR (otimizar pesos)
    // - METRIC (MAE): usado para AVALIAR (entender performance)
    //
    // Exemplo prático:
    // MAE = 0.05 significa que, em média, erramos 0.05 em cada feature
    // Como features estão entre 0-1, isso é 5% de erro - BOM!
    //
    // Podemos ter múltiplas métricas: ['mae', 'mse', 'accuracy']
    // Aqui usamos apenas MAE por simplicidade
    metrics: ['mae'],
  });
  
  // -------------------------------------------------------------------------
  // Retorna o modelo configurado e pronto para treinar
  // -------------------------------------------------------------------------
  return model;
}

async function startTraining(games, epochs = 50) {
  try {
    postMessage({
      type: 'STATUS',
      message: 'Inicializando TensorFlow.js...',
    });
    
    // Initialize TensorFlow
    await tf.ready();
    await tf.setBackend('webgl');
    
    postMessage({
      type: 'STATUS',
      message: 'Preparando dados de treinamento...',
    });
    
    // Extract features from games
    const features = games.map(game => game.features);
    
    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(features); // Autoencoder: input = output
    
    postMessage({
      type: 'STATUS',
      message: `Iniciando treinamento com ${games.length} jogos...`,
    });
    
    // Create model
    const model = createModel();
    
    // Training callbacks
    const callbacks = {
      onEpochEnd: async (epoch, logs) => {
        postMessage({
          type: 'EPOCH_END',
          epoch: epoch + 1,
          totalEpochs: epochs,
          loss: logs.loss,
          mae: logs.mae,
        });
      },
      onTrainEnd: async () => {
        postMessage({
          type: 'STATUS',
          message: 'Salvando modelo...',
        });
      },
    };
    
    // Train the model
    await model.fit(xs, ys, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks,
    });
    
    // Save model to IndexedDB
    await model.save(MODEL_PATH);
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    postMessage({
      type: 'TRAINING_COMPLETE',
      message: 'Treinamento concluído com sucesso!',
    });
    
  } catch (error) {
    console.error('Erro no Worker:', error);
    postMessage({
      type: 'ERROR',
      message: error.message || 'Erro durante o treinamento',
      error: error.toString(),
    });
  }
}
