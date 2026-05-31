"use client";

import type { ConflictInfo, Evento } from "@/types";

interface ConflictModalProps {
  conflitos: ConflictInfo[];
  eventoPendente: Omit<Evento, "id">;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConflictModal({
  conflitos,
  eventoPendente,
  onConfirmar,
  onCancelar,
}: ConflictModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Conflito de Agenda</h3>
        <p>
          O evento <strong>{eventoPendente.titulo}</strong> na{" "}
          <strong>{eventoPendente.dia}</strong> ({eventoPendente.inicio}–
          {eventoPendente.fim}) conflita com um evento existente:
        </p>
        <ul>
          {conflitos.map((c, i) => (
            <li key={i}>{c.mensagem}</li>
          ))}
        </ul>
        <p>Deseja adicionar mesmo assim?</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={onConfirmar}>
            Adicionar mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
}
