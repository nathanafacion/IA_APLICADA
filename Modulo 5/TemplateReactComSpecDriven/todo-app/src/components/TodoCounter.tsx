interface TodoCounterProps {
  count: number;
}

export default function TodoCounter({ count }: TodoCounterProps) {
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {count === 0
        ? 'Nenhuma tarefa pendente'
        : `${count} tarefa${count > 1 ? 's' : ''} pendente${count > 1 ? 's' : ''}`}
    </span>
  );
}
