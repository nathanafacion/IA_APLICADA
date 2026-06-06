'use client';

import { FilterStatus } from '@/types/todo';

interface TodoFilterProps {
  current: FilterStatus;
  onChange: (filter: FilterStatus) => void;
}

const OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Concluídas', value: 'completed' },
];

export default function TodoFilter({ current, onChange }: TodoFilterProps) {
  return (
    <nav aria-label="Filtrar tarefas" className="flex gap-1">
      {OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-pressed={current === value}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
