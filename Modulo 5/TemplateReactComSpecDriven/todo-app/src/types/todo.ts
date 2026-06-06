export type FilterStatus = 'all' | 'pending' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
