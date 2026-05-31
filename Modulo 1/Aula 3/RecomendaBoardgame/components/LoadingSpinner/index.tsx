// Componente de Loading
export default function LoadingSpinner({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
}
