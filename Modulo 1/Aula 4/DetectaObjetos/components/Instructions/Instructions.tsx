export function Instructions() {
  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-4">📖 Como usar</h3>
      <ol className="list-decimal list-inside space-y-2 text-gray-300">
        <li>Aguarde o modelo ser carregado (indicador verde no topo)</li>
        <li>Clique em "Carregar Vídeo" e selecione um arquivo MP4 ou WebM</li>
        <li>Clique em "Processar" para iniciar a detecção em tempo real</li>
        <li>Acompanhe as detecções no vídeo e no painel de inventário</li>
        <li>Use os controles do vídeo para pausar/avançar conforme necessário</li>
      </ol>
    </div>
  );
}
