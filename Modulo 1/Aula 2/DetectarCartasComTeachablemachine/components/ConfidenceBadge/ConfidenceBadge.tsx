interface ConfidenceBadgeProps {
  confianca: number;
}

/**
 * Componente puro para exibir o índice de confiança
 */
export function ConfidenceBadge({ confianca }: ConfidenceBadgeProps) {
  return (
    <div className="text-center mt-6">
      <div className="bg-black/30 rounded-lg px-6 py-3 inline-block">
        <span className="text-white font-bold">
          Confiança: {confianca.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
