"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Evento, AgendaSemanal, ConflictInfo } from "@/types";

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function detectarConflitos(
  existentes: Evento[],
  novoEvento: Omit<Evento, "id">
): ConflictInfo[] {
  const conflitos: ConflictInfo[] = [];
  const novoInicio = horaParaMinutos(novoEvento.inicio);
  const novoFim = horaParaMinutos(novoEvento.fim);

  for (const ev of existentes) {
    if (ev.dia !== novoEvento.dia) continue;
    const start = horaParaMinutos(ev.inicio);
    const end = horaParaMinutos(ev.fim);
    const sobrepoe = novoInicio < end && novoFim > start;

    if (sobrepoe) {
      conflitos.push({
        tipo: "sobreposicao_horario",
        eventoExistente: ev,
        novoEvento,
        mensagem: `Conflito com "${ev.titulo}" (${ev.inicio}–${ev.fim}) na ${ev.dia}`,
      });
    } else if (novoEvento.responsavel && ev.responsavel === novoEvento.responsavel && sobrepoe) {
      conflitos.push({
        tipo: "responsavel_duplo",
        eventoExistente: ev,
        novoEvento,
        mensagem: `${ev.responsavel} já tem "${ev.titulo}" no mesmo horário`,
      });
    } else if (novoEvento.local && ev.local === novoEvento.local && sobrepoe) {
      conflitos.push({
        tipo: "local_duplo",
        eventoExistente: ev,
        novoEvento,
        mensagem: `O local "${ev.local}" já está ocupado por "${ev.titulo}"`,
      });
    }
  }
  return conflitos;
}

export function useScheduler() {
  const [agenda, setAgenda] = useState<AgendaSemanal>({ eventos: [] });
  const [conflitoPendente, setConflitoPendente] = useState<{
    conflitos: ConflictInfo[];
    evento: Omit<Evento, "id">;
  } | null>(null);

  const adicionarEvento = useCallback(
    (novoEvento: Omit<Evento, "id">): ConflictInfo[] => {
      const conflitos = detectarConflitos(agenda.eventos, novoEvento);
      if (conflitos.length > 0) {
        setConflitoPendente({ conflitos, evento: novoEvento });
        return conflitos;
      }
      const evento: Evento = { ...novoEvento, id: uuidv4() };
      setAgenda((prev) => ({ eventos: [...prev.eventos, evento] }));
      return [];
    },
    [agenda.eventos]
  );

  const forcarAdicionar = useCallback((novoEvento: Omit<Evento, "id">) => {
    const evento: Evento = { ...novoEvento, id: uuidv4() };
    setAgenda((prev) => ({ eventos: [...prev.eventos, evento] }));
    setConflitoPendente(null);
  }, []);

  const removerEvento = useCallback((id: string) => {
    setAgenda((prev) => ({
      eventos: prev.eventos.filter((e) => e.id !== id),
    }));
  }, []);

  const removerEventoPorQuery = useCallback((query: string) => {
    const q = query.toLowerCase();
    setAgenda((prev) => ({
      eventos: prev.eventos.filter((e) => !e.titulo.toLowerCase().includes(q)),
    }));
  }, []);

  const descartarConflito = useCallback(() => {
    setConflitoPendente(null);
  }, []);

  return {
    agenda,
    conflitoPendente,
    adicionarEvento,
    forcarAdicionar,
    removerEvento,
    removerEventoPorQuery,
    descartarConflito,
  };
}
