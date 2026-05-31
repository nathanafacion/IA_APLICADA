import { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [model, setModel] = useState(null);
  const [classNames, setClassNames] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const modelFilesRef = useRef(null);

  // Inicializar TensorFlow ao iniciar
  useEffect(() => {
    initTensorFlow();
  }, []);

  async function initTensorFlow() {
    try {
      // Forçar uso de CPU backend para evitar erros de WebGL
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js inicializado com backend:', tf.getBackend());
      
      // Tentar carregar modelo se existir na pasta public
      await tryLoadExistingModel();
    } catch (error) {
      console.error('❌ Erro ao inicializar TensorFlow:', error);
      alert('Erro ao inicializar TensorFlow.js. Tente recarregar a página.');
    }
  }

  async function tryLoadExistingModel() {
    try {
      setModelLoading(true);
      
      // Tentar carregar modelo da pasta public
      const loadedModel = await tf.loadLayersModel('/model/model.json');
      setModel(loadedModel);
      
      // Carregar nomes das classes
      const response = await fetch('/model/classes.json');
      const classes = await response.json();
      setClassNames(classes);
      
      console.log('✅ Modelo carregado da pasta public!');
      setModelLoaded(true);
      setModelLoading(false);
    } catch (error) {
      console.log('ℹ️ Nenhum modelo encontrado. Por favor, faça upload dos arquivos do modelo.');
      setModelLoading(false);
      setModelLoaded(false);
    }
  }

  async function handleModelUpload(e) {
    const files = Array.from(e.target.files);
    
    console.log('📁 Arquivos selecionados:', files.map(f => f.name));
    
    if (files.length === 0) {
      alert('Nenhum arquivo selecionado');
      return;
    }

    try {
      setModelLoading(true);
      
      // Encontrar model.json e classes.json - aceitar qualquer nome que termine com .json
      const modelJsonFile = files.find(f => f.name.endsWith('.json') && f.name !== 'classes.json');
      const classesJsonFile = files.find(f => f.name === 'classes.json');
      const weightsFiles = files.filter(f => f.name.includes('.bin') || f.name.includes('weights'));
      
      console.log('🔍 Arquivo modelo.json encontrado:', modelJsonFile?.name || 'NÃO');
      console.log('🔍 classes.json encontrado:', !!classesJsonFile);
      console.log('🔍 Arquivos .bin encontrados:', weightsFiles.map(f => f.name));
      
      if (!modelJsonFile) {
        alert('❌ Arquivo JSON do modelo não encontrado!\n\nPor favor, selecione o arquivo .json do modelo (ex: fruit-model.json ou model.json)');
        setModelLoading(false);
        return;
      }
      
      if (!classesJsonFile) {
        alert('❌ Arquivo classes.json não encontrado!\n\nPor favor, selecione o arquivo classes.json');
        setModelLoading(false);
        return;
      }
      
      if (weightsFiles.length === 0) {
        alert('❌ Arquivo de pesos (.bin) não encontrado!\n\nPor favor, selecione o arquivo .bin (ex: fruit-model.weights.bin)');
        setModelLoading(false);
        return;
      }

      console.log('📋 Carregando classes...');
      // Carregar classes.json
      const classesText = await classesJsonFile.text();
      const classes = JSON.parse(classesText);
      setClassNames(classes);
      console.log('✅ Classes carregadas:', classes.length);
      
      console.log('🧠 Carregando modelo TensorFlow...');
      console.log('Arquivos sendo passados:', [modelJsonFile.name, ...weightsFiles.map(f => f.name)]);
      
      // Carregar modelo usando tf.loadLayersModel com files
      const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([modelJsonFile, ...weightsFiles]));
      setModel(loadedModel);
      
      console.log('✅ Modelo carregado com sucesso via upload!');
      setModelLoaded(true);
      setModelLoading(false);
      alert(`✅ Modelo carregado com sucesso!\n\n📊 Classes detectadas: ${classes.length}\n${classes.join(', ')}`);
    } catch (error) {
      console.error('❌ Erro ao carregar modelo:', error);
      console.error('Detalhes do erro:', error.message);
      setModelLoading(false);
      alert(`❌ Erro ao carregar modelo:\n\n${error.message}\n\nCertifique-se de selecionar TODOS os arquivos baixados:\n- fruit-model.json (ou model.json)\n- fruit-model.weights.bin (arquivo .bin)\n- classes.json`);
    }
  }

  async function loadModel() {
    // Função legada - agora carregamento é via upload ou tryLoadExistingModel
    console.log('Use handleModelUpload para carregar modelo');
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Limpar predições anteriores
      setPredictions([]);
    }
  }

  async function preprocessImage(imageElement) {
    return tf.tidy(() => {
      // Converter imagem para tensor
      const tensor = tf.browser.fromPixels(imageElement);
      
      // Redimensionar para 128x128 (ajustado para economia de memória)
      const resized = tf.image.resizeBilinear(tensor, [128, 128]);
      
      // Normalizar [0, 1]
      const normalized = resized.div(255.0);
      
      // Adicionar dimensão do batch
      const batched = normalized.expandDims(0);
      
      return batched;
    });
  }

  async function predictImage() {
    if (!model || !selectedImage) {
      alert('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setLoading(true);
    setPredictions([]);

    try {
      // Criar elemento de imagem
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Preprocessar imagem
      const processedImage = await preprocessImage(img);

      // Fazer predição
      const prediction = await model.predict(processedImage);
      const probabilities = await prediction.data();

      // Criar array de resultados
      const results = classNames.map((name, index) => ({
        name,
        probability: probabilities[index] * 100
      }));

      // Ordenar por probabilidade (maior para menor)
      results.sort((a, b) => b.probability - a.probability);

      setPredictions(results);

      // Limpar tensores
      processedImage.dispose();
      prediction.dispose();

    } catch (error) {
      console.error('❌ Erro na predição:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          🍎 Sistema de Detecção de Frutas
        </h1>

        <p className={styles.description}>
          Faça upload de uma imagem de fruta para identificação usando IA
        </p>

        <div className={styles.navLinks}>
          <Link href="/train">
            <button className={styles.trainLink}>
              🧠 Treinar Novo Modelo
            </button>
          </Link>
          
          {!modelLoaded && !modelLoading && (
            <>
              <input
                type="file"
                multiple
                accept=".json,.bin"
                onChange={handleModelUpload}
                ref={modelFilesRef}
                style={{ display: 'none' }}
              />
              
              <button
                className={styles.trainLink}
                onClick={() => modelFilesRef.current.click()}
              >
                📁 Carregar Modelo
              </button>
            </>
          )}
        </div>
        
        {!modelLoaded && !modelLoading && (
          <div className={styles.modelInstructions}>
            <p style={{ fontSize: '0.9rem', color: 'white', marginTop: '1rem' }}>
              💡 Selecione os 3 arquivos: <strong>fruit-model.json</strong>, <strong>fruit-model.weights.bin</strong> e <strong>classes.json</strong>
            </p>
          </div>
        )}

        {modelLoading && (
          <div className={styles.loadingModel}>
            <p>⏳ Carregando modelo de IA...</p>
          </div>
        )}

        {modelLoaded && (
          <div className={styles.modelInfo}>
            <p>✅ Modelo carregado com sucesso!</p>
            <p>📊 Classes: {classNames.length}</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {classNames.join(', ')}
            </p>
          </div>
        )}

        {modelLoaded && (
          <>
            {/* Upload de Imagem */}
            <div className={styles.uploadSection}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              
              <button
                className={styles.uploadButton}
                onClick={() => fileInputRef.current.click()}
              >
                📁 Selecionar Imagem
              </button>

              {preview && (
                <button
                  className={styles.predictButton}
                  onClick={predictImage}
                  disabled={loading}
                >
                  {loading ? '⏳ Analisando...' : '🔍 Identificar Fruta'}
                </button>
              )}
            </div>

            {/* Preview da Imagem */}
            {preview && (
              <div className={styles.previewSection}>
                <h2>Preview da Imagem</h2>
                <img
                  src={preview}
                  alt="Preview"
                  className={styles.previewImage}
                />
              </div>
            )}

            {/* Resultados */}
            {predictions.length > 0 && (
              <div className={styles.resultsSection}>
                <h2>📊 Resultados da Análise</h2>
                
                <div className={styles.topResult}>
                  <h3>🏆 Identificação: {predictions[0].name}</h3>
                  <p className={styles.confidence}>
                    Confiança: {predictions[0].probability.toFixed(2)}%
                  </p>
                </div>

                <div className={styles.allResults}>
                  <h4>Todas as Probabilidades:</h4>
                  {predictions.slice(0, 10).map((result, index) => (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.resultLabel}>
                        <span className={styles.rank}>#{index + 1}</span>
                        <span>{result.name}</span>
                      </div>
                      <div className={styles.resultBar}>
                        <div
                          className={styles.resultBarFill}
                          style={{ width: `${result.probability}%` }}
                        />
                      </div>
                      <span className={styles.resultValue}>
                        {result.probability.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        Powered by TensorFlow.js + Next.js
      </footer>
    </div>
  );
}
