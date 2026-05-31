// Componente puro para exibir mensagens de erro
import Link from 'next/link';

interface ErrorMessageProps {
  message: string;
  includeTrainingLink?: boolean;
}

export default function ErrorMessage({ message, includeTrainingLink = false }: ErrorMessageProps) {
  return (
    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
      <p className="font-bold">⚠️ Erro</p>
      <p>{message}</p>
      {includeTrainingLink && message.includes('Modelo não encontrado') && (
        <Link
          href="/treinar"
          className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Ir para Página de Treinamento
        </Link>
      )}
    </div>
  );
}
