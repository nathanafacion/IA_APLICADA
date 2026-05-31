// Web Worker usando COCO-SSD (modelo pronto para uso)
let model = null;
let scriptsLoaded = false;

// Carrega os scripts necessários
try {
  importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
  importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
  scriptsLoaded = true;
  console.log('Scripts TensorFlow carregados com sucesso');
} catch (error) {
  console.error('Erro ao carregar scripts:', error);
  postMessage({ 
    type: 'error', 
    data: `Erro ao carregar bibliotecas: ${error.message}. Verifique a conexão com a internet.` 
  });
}

/**
 * Inicializa o modelo COCO-SSD
 */
async function loadModel() {
  if (!scriptsLoaded) {
    postMessage({ type: 'error', data: 'Scripts do TensorFlow não foram carregados' });
    return;
  }

  try {
    if (typeof tf === 'undefined' || typeof cocoSsd === 'undefined') {
      throw new Error('TensorFlow ou COCO-SSD não disponíveis');
    }

    await tf.ready();
    await tf.setBackend('webgl');
    
    console.log('Carregando modelo COCO-SSD...');
    model = await cocoSsd.load();
    console.log('Modelo carregado com sucesso!');
    
    postMessage({ type: 'ready' });
  } catch (error) {
    console.error('Erro ao carregar modelo:', error);
    postMessage({ type: 'error', data: `Erro ao carregar modelo: ${error.message}` });
  }
}

/**
 * Detecta objetos no frame
 */
async function detectObjects(imageBitmap) {
  if (!model) {
    postMessage({ type: 'error', data: 'Modelo não carregado' });
    return;
  }

  const startTime = performance.now();

  try {
    // COCO-SSD aceita diretamente ImageBitmap
    const predictions = await model.detect(imageBitmap);
    
    // Converte para o formato esperado
    const detections = predictions.map(p => ({
      bbox: p.bbox, // já está no formato [x, y, width, height]
      class: p.class,
      score: p.score
    }));

    const inferenceTime = performance.now() - startTime;

    // Limpa memória GPU do TensorFlow
    if (typeof tf !== 'undefined' && tf.engine) {
      const numTensors = tf.memory().numTensors;
      if (numTensors > 100) { // Se tiver muitos tensores acumulados
        console.warn('Limpando memória do TensorFlow:', numTensors, 'tensors');
        tf.engine().startScope();
        tf.engine().endScope();
      }
    }

    postMessage({
      type: 'result',
      data: {
        detections,
        inferenceTime
      }
    });

  } catch (error) {
    console.error('Erro na detecção:', error);
    postMessage({ type: 'error', data: `Erro na detecção: ${error.message}` });
  }
}

// Event listener
self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      await loadModel();
      break;
      
    case 'detect':
      await detectObjects(data.imageBitmap);
      break;
      
    default:
      console.warn('Tipo de mensagem desconhecido:', type);
  }
});
