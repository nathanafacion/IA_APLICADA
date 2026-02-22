import RecommendationsContainer from '@/components/RecommendationsContainer';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Sistema de Recomendação de Jogos
        </h1>
        <p className="text-xl text-gray-600">
          Encontre jogos de tabuleiro similares usando Machine Learning
        </p>
      </div>

      {/* Recommendations Container */}
      <RecommendationsContainer />
    </div>
  );
}
