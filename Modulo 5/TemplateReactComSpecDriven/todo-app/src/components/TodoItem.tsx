'use client';

import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Marcar "${todo.text}" como ${todo.completed ? 'pendente' : 'concluída'}`}
        className="h-4 w-4 cursor-pointer accent-blue-600"
      />
      <span
        className={`flex-1 text-sm truncate ${
          todo.completed
            ? 'text-gray-400 line-through dark:text-gray-500'
            : 'text-gray-800 dark:text-gray-200'
        }`}
        title={todo.text}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Deletar "${todo.text}"`}
        className="ml-auto text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </li>
  );
}
