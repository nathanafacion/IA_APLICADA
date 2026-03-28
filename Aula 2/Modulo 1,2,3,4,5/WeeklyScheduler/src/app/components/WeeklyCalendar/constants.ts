import type { DiaDaSemana } from "@/types";

export const DIAS: DiaDaSemana[] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export const HORAS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00–20:00

export const CORES = [
  "#4F86C6",
  "#E07B54",
  "#5BB5A2",
  "#A97BB5",
  "#D4A843",
  "#E06C75",
  "#61AFEF",
];
