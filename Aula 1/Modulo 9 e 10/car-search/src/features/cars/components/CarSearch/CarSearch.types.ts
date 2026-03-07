import type { CarResult } from "@/features/cars/types";

export type SearchStatus = "idle" | "loading" | "done" | "error";

export interface CarSearchProps {
  initialSeeded: boolean;
}

export interface UseCarSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  status: SearchStatus;
  results: CarResult[];
  aiResponse: string | null;
  errorMsg: string;
  seeded: boolean;
  seeding: boolean;
  seedMsg: string;
  handleSearch: (e?: React.FormEvent) => Promise<void>;
  handleSeed: () => Promise<void>;
}
