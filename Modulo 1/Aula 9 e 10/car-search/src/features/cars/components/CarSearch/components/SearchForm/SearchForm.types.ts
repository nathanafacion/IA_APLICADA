import type { SearchStatus } from "../../CarSearch.types";

export interface SearchFormProps {
  query: string;
  status: SearchStatus;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}
