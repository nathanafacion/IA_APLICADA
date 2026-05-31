import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import styles from '../styles/Train.module.css';

export default function Train() {
  const [trainingData, setTrainingData] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState('');
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(15); // Reduzido de 30 para 15 épocas
  const [isTraining, setIsTraining] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [tfReady, setTfReady] = useState(false);
  const maxImagesPerClass = 20; // Fixado em 20 imagens por classe
  const [imageSize] = useState(128); // Reduzido de 224 para economizar memória
  const folderInputRef = useRef(null);

  // Inicializar TensorFlow.js
  useEffect(() => {
    initTensorFlow();
  }, []);

  async function initTensorFlow() {
    try {
      // Forçar backend CPU para evitar erros de WebGL
      await tf.setBackend('cpu');
      await tf.ready();
      const backend = tf.getBackend();
      console.log('✅ TensorFlow.js backend:', backend);
      
      setTfReady(true);
      setTrainingStatus(`✅ TensorFlow.js pronto (Backend: ${backend})`);
    } catch (error) {
      console.error('❌ Erro ao inicializar TensorFlow:', error);
      setTrainingStatus('❌ Erro ao inicializar TensorFlow.js');
      alert('Erro ao inicializar TensorFlow.js. Tente recarregar a página.');
    }
  }

  // Carregar imagens do diretório
  async function handleFolderUpload(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      alert('Nenhum arquivo selecionado');
      return;
    }

    setTrainingStatus('📂 Carregando imagens...');
    
    // Organizar por pastas (classes)
    const classFolders = {};
    
    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const className = pathParts[pathParts.length - 2]; // Nome da pasta pai
      
      if (!classFolders[className]) {
        classFolders[className] = [];
      }
      classFolders[className].push(file);
    });

    const classes = Object.keys(classFolders).sort();
    setClassNames(classes);

    // Carregar e processar imagens COM LIMITE
    const data = [];
    let totalLoaded = 0;
    let skipped = 0;

    for (let classIdx = 0; classIdx < classes.length; classIdx++) {
      const className = classes[classIdx];
      const classFiles = classFolders[className];
      
      // Filtrar apenas imagens
      const imageFiles = classFiles.filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file.name)
      );
      
      // LIMITAR número de imagens por classe
      const filesToLoad = imageFiles.slice(0, maxImagesPerClass);
      skipped += Math.max(0, imageFiles.length - maxImagesPerClass);

      for (const file of filesToLoad) {
        try {
          // Carregar como array de pixels em vez de tensor para economizar memória
          const imageData = await loadImageAsArray(file);
          data.push({ imageData, label: classIdx });
          totalLoaded++;
          
          // Atualizar UI a cada 5 imagens para não travar
          if (totalLoaded % 5 === 0) {
            setTrainingStatus(`📸 Carregadas ${totalLoaded} imagens... (${className})`);
            // Dar tempo para UI responder
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error) {
          console.error(`Erro ao carregar ${file.name}:`, error);
        }
      }
    }

    setTrainingData(data);
    const msg = `✅ ${totalLoaded} imagens carregadas de ${classes.length} classes` +
                (skipped > 0 ? ` (${skipped} ignoradas - limite: ${maxImagesPerClass}/classe)` : '');
    setTrainingStatus(msg);
  }

  // Carregar uma imagem e converter para array (economiza memória)
  async function loadImageAsArray(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          try {
            // Usar tf.tidy para limpar automaticamente
            const arrayData = await tf.tidy(() => {
              // Converter para tensor
              const imageTensor = tf.browser.fromPixels(img);
              // Redimensionar para imageSize x imageSize (128x128 para economia de memória)
              const resized = tf.image.resizeBilinear(imageTensor, [imageSize, imageSize]);
              // Normalizar [0, 1]
              const normalized = resized.div(255.0);
              // Retornar como array para economizar memória
              return normalized.arraySync();
            });
            resolve(arrayData);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Criar modelo CNN (SIMPLIFICADO para velocidade - apenas 2 camadas)
  function createModel(numClasses) {
    const model = tf.sequential();

    // Primeira camada convolucional (menos filtros)
    model.add(tf.layers.conv2d({
      inputShape: [imageSize, imageSize, 3],
      filters: 16, // Reduzido de 32 para 16
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Segunda camada convolucional (menos filtros)
    model.add(tf.layers.conv2d({
      filters: 32, // Reduzido de 64 para 32
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Removida terceira camada convolucional para acelerar

    // Flatten
    model.add(tf.layers.flatten());

    // Camada densa menor
    model.add(tf.layers.dense({
      units: 64, // Reduzido de 128 para 64
      activation: 'relu'
    }));

    // Dropout
    model.add(tf.layers.dropout({ rate: 0.3 })); // Reduzido de 0.5 para 0.3

    // Camada de saída
    model.add(tf.layers.dense({
      units: numClasses,
      activation: 'softmax'
    }));

    // Compilar com learning rate maior para convergir mais rápido
    model.compile({
      optimizer: tf.train.adam(0.003), // Aumentado de 0.001 para 0.003
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Treinar modelo
  async function startTraining() {
    if (!tfReady) {
      alert('TensorFlow.js ainda não está pronto. Aguarde alguns segundos.');
      return;
    }

    if (trainingData.length === 0) {
      alert('Por favor, carregue as imagens primeiro');
      return;
    }

    setIsTraining(true);
    setTrainingStatus('🧠 Preparando dados...');

    try {
      // Converter arrays de volta para tensores (em batch para economizar memória)
      setTrainingStatus('🔄 Passo 1/5: Convertendo imagens para tensores...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const xs = tf.tidy(() => {
        const tensors = trainingData.map(d => tf.tensor3d(d.imageData));
        return tf.stack(tensors);
      });
      
      setTrainingStatus('🔄 Passo 2/5: Preparando labels...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const labels = trainingData.map(d => d.label);
      const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), classNames.length);

      setTrainingStatus('🔄 Passo 3/5: Criando arquitetura do modelo...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Criar modelo
      const model = createModel(classNames.length);
      
      setTrainingStatus('🔄 Passo 4/5: Preparando dados de treino e validação...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTrainingStatus('🚀 Passo 5/5: Iniciando treinamento...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Treinar com batchSize menor para não travar
      const totalBatches = Math.ceil(trainingData.length * 0.8 / 16);
      
      await model.fit(xs, ys, {
        batchSize: 16,
        epochs: totalEpochs,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochBegin: (epoch, logs) => {
            const epochNum = epoch + 1;
            console.log(`🚀 Época ${epochNum}/${totalEpochs} iniciando...`);
            setCurrentEpoch(epochNum);
            setTrainingStatus(`🚀 Época ${epochNum}/${totalEpochs} em andamento...`);
          },
          onEpochEnd: (epoch, logs) => {
            const epochNum = epoch + 1;
            const trainAcc = (logs.acc * 100).toFixed(2);
            const valAcc = (logs.val_acc * 100).toFixed(2);
            const loss = logs.loss.toFixed(4);
            
            console.log(`✅ Época ${epochNum}/${totalEpochs} - Acc: ${trainAcc}% - Val: ${valAcc}%`);
            
            setCurrentEpoch(epochNum);
            setAccuracy(trainAcc);
            setTrainingStatus(
              `✅ Época ${epochNum}/${totalEpochs} concluída! - ` +
              `Treino: ${trainAcc}% - ` +
              `Validação: ${valAcc}% - ` +
              `Loss: ${loss}`
            );
          }
        }
      });

      setTrainingStatus('💾 Salvando modelo treinado...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Salvar modelo
      await model.save('downloads://fruit-model');
      
      setTrainingStatus('📄 Gerando arquivo de classes...');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Salvar nomes das classes
      const classesBlob = new Blob([JSON.stringify(classNames, null, 2)], {
        type: 'application/json'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(classesBlob);
      link.download = 'classes.json';
      link.click();

      setTrainingStatus('✅ Treinamento concluído com sucesso! Arquivos baixados. 🎉');
      alert('✅ Treinamento concluído!\n\n' + 
            `Acurácia final: ${accuracy}%\n` +
            `Épocas: ${totalEpochs}\n` +
            `Classes: ${classNames.length}\n\n` +
            'Os arquivos do modelo foram baixados. Coloque-os na pasta public/model/');
      
      // Limpar tensores
      xs.dispose();
      ys.dispose();

    } catch (error) {
      console.error('Erro no treinamento:', error);
      setTrainingStatus(`❌ Erro: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>🧠 Treinamento do Modelo</h1>

        <div className={styles.section}>
          <h2>1️⃣ Carregar Dados de Treinamento</h2>
          <p>Selecione a pasta <code>Dados/train/train</code> que contém as subpastas com imagens de cada fruta.</p>
          
          <input
            type="file"
            ref={folderInputRef}
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderUpload}
            style={{ display: 'none' }}
          />
          
          <button
            className={styles.button}
            onClick={() => folderInputRef.current.click()}
            disabled={isTraining}
          >
            📁 Selecionar Pasta
          </button>

          {classNames.length > 0 && (
            <div className={styles.info}>
              <p>✅ {classNames.length} classes carregadas</p>
              <p>📊 {trainingData.length} imagens no total</p>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2>2️⃣ Configurar Treinamento</h2>
          
          <div className={styles.info} style={{ marginBottom: '1rem' }}>
            <p>📊 Fixado: 20 imagens por classe</p>
          </div>
          
          <label>
            Número de Épocas:
            <input
              type="number"
              value={totalEpochs}
              onChange={(e) => setTotalEpochs(Number(e.target.value))}
              min="1"
              max="200"
              disabled={isTraining}
              className={styles.input}
            />
            <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
              💡 Recomendado: 20-50 épocas
            </small>
          </label>
        </div>

        <div className={styles.section}>
          <h2>3️⃣ Iniciar Treinamento</h2>
          <button
            className={styles.buttonTrain}
            onClick={startTraining}
            disabled={isTraining || trainingData.length === 0}
          >
            {isTraining ? '⏳ Treinando...' : '🚀 Iniciar Treinamento'}
          </button>
        </div>

        {trainingStatus && (
          <div className={styles.status}>
            <h3>Status:</h3>
            <p>{trainingStatus}</p>
            {isTraining && (
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}
                  />
                </div>
                <p>{currentEpoch} / {totalEpochs} épocas</p>
                <p>Acurácia: {accuracy}%</p>
              </div>
            )}
          </div>
        )}

        <div className={styles.instructions}>
          <h3>📝 Instruções:</h3>
          <ol>
            <li>Clique em "Selecionar Pasta" e escolha <code>Dados/train/train</code></li>
            <li>Aguarde o carregamento de todas as imagens</li>
            <li>Configure o número de épocas (padrão: 50)</li>
            <li>Clique em "Iniciar Treinamento"</li>
            <li>Após concluir, os arquivos do modelo serão baixados automaticamente</li>
            <li>Coloque os arquivos baixados na pasta <code>public/model/</code></li>
          </ol>
        </div>
      </main>
    </div>
  );
}
