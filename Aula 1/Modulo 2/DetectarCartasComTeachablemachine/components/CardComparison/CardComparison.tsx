"use client";

import { useRef, useEffect } from "react";
import { getValorManilha } from "@/lib/trucoLogic";
import { useCardModel } from "@/hooks/useCardModel";
import { useCardDetection } from "@/hooks/useCardDetection";
import { useCardComparison } from "@/hooks/useCardComparison";
import { Card } from "@/components/Card";
import { CardAnalysis } from "@/components/CardAnalysis";
import { UploadedImage } from "@/components/UploadedImage";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { fileToDataURL } from "@/utils/fileUtils";

/**
 * Componente principal (Smart Component) que orquestra a detecção e comparação de cartas
 */
export default function CardComparison() {
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Hooks customizados para gerenciar estado
  const { modelo, carregando: carregandoModelo, erro: erroModelo } = useCardModel();
  const {
    cartaDetectada,
    confianca,
    imagemUpload,
    processando,
    erro: erroDeteccao,
    detectarCartaDaImagem,
    resetarDeteccao,
  } = useCardDetection(modelo);
  const {
    cartaReferencia,
    mensagem,
    gerarNovaCartaReferencia,
    compararComReferencia,
    setMensagem,
  } = useCardComparison();

  // Atualizar mensagem com base no estado do modelo
  useEffect(() => {
    if (carregandoModelo) {
      setMensagem("Carregando modelo...");
    } else if (erroModelo) {
      setMensagem(erroModelo);
    } else if (modelo) {
      setMensagem("Modelo carregado! Envie uma imagem de carta.");
    }
  }, [carregandoModelo, erroModelo, modelo, setMensagem]);

  // Atualizar mensagem com base em erros de detecção
  useEffect(() => {
    if (erroDeteccao) {
      setMensagem(erroDeteccao);
    }
  }, [erroDeteccao, setMensagem]);

  // Comparar carta detectada com a referência
  useEffect(() => {
    if (cartaDetectada) {
      compararComReferencia(cartaDetectada);
    }
  }, [cartaDetectada, compararComReferencia]);

  // Handler para upload de imagem
  const handleImagemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    try {
      const imagemUrl = await fileToDataURL(arquivo);
      await detectarCartaDaImagem(imagemUrl);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setMensagem("Erro ao processar arquivo!");
    }
  };

  // Handler para gerar nova carta tombada na mesa
  const handleNovaCartaReferencia = () => {
    gerarNovaCartaReferencia();
    resetarDeteccao();
  };


  return (
    <div className="min-h-screen bg-casino-green flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-yellow-400 text-center mb-2">
          Detector de Cartas de Truco
        </h1>
        <p className="text-white text-center mb-2">
          Use TensorFlow.js para identificar cartas e comparar com a referência
        </p>

        {/* Indicador de Manilha */}
        <div className="bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-center mb-6">
          ⭐ Manilha atual: {getValorManilha()}
          <span className="text-sm ml-2">(Paus &gt; Copas &gt; Espadas &gt; Ouros)</span>
        </div>

        {/* Status do Modelo */}
        {carregandoModelo && (
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center mb-6">
            Carregando modelo de IA...
          </div>
        )}

        {/* Mensagem */}
        {mensagem && !carregandoModelo && (
          <div className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg text-center mb-6">
            {mensagem}
          </div>
        )}

        {/* Área de Comparação */}
        <div className="bg-casino-felt rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex justify-around items-center gap-8">
            {/* Carta tombada na mesa */}
            <Card carta={cartaReferencia} titulo="Carta tombada na mesa" />

            {/* VS */}
            <div className="text-6xl font-bold text-yellow-400">VS</div>

            {/* Carta Detectada */}
            <Card carta={cartaDetectada} titulo="CARTA DETECTADA" />
          </div>

          {cartaDetectada && confianca > 0 && (
            <ConfidenceBadge confianca={confianca} />
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => inputFileRef.current?.click()}
            disabled={carregandoModelo || processando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed"
          >
            {processando ? "Processando..." : "📷 Enviar Imagem"}
          </button>

          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            onChange={handleImagemUpload}
            className="hidden"
          />

          <button
            onClick={handleNovaCartaReferencia}
            disabled={carregandoModelo}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            🔄 Nova Carta
          </button>
        </div>

        {/* Imagem Enviada */}
        {imagemUpload && <UploadedImage imagemUrl={imagemUpload} />}

        {/* Análise Detalhada */}
        {cartaDetectada && cartaReferencia && (
          <CardAnalysis carta={cartaDetectada} />
        )}
      </div>
    </div>
  );
}
