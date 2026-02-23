import { ErrorMessageProps } from './ErrorMessage.types';

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
      {error}
    </div>
  );
}
