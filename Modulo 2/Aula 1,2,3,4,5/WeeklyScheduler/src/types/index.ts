export type DiaDaSemana =
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado"
  | "Domingo";

export interface Evento {
  id: string;
  titulo: string;
  responsavel?: string;
  dia: DiaDaSemana;
  inicio: string; // formato "HH:MM"
  fim: string;    // formato "HH:MM"
  local?: string;
  cor?: string;
}

export interface AgendaSemanal {
  eventos: Evento[];
}

export interface ConflictInfo {
  tipo: "sobreposicao_horario" | "responsavel_duplo" | "local_duplo";
  eventoExistente: Evento;
  novoEvento: Omit<Evento, "id">;
  mensagem: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AgendaAction {
  action: "add" | "remove" | "update" | "query";
  evento?: Omit<Evento, "id">;
  eventoId?: string;
  query?: string;
}

export interface GuardrailResult {
  safe: boolean;
  reason?: string;
}
