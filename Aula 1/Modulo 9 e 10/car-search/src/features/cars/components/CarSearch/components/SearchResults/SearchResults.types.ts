import type { CarResult } from "@/features/cars/types";

export interface SearchResultsProps {
  results: CarResult[];
  query: string;
}
