'use client';

import { useTodos } from '@/hooks/useTodos';
import TodoInput from '@/components/TodoInput';
import TodoList from '@/components/TodoList';
import TodoFilter from '@/components/TodoFilter';
import TodoCounter from '@/components/TodoCounter';

export default function Home() {
  const { filteredTodos, filter, pendingCount, addTodo, toggleTodo, deleteTodo, setFilter } =
    useTodos();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          📝 Todo App
        </h1>

        <div className="flex flex-col gap-6">
          <TodoInput onAdd={addTodo} />

          <div className="flex items-center justify-between">
            <TodoFilter current={filter} onChange={setFilter} />
            <TodoCounter count={pendingCount} />
          </div>

          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        </div>
      </main>
    </div>
  );
}
