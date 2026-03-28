import type { Evento } from "@/types";
import { DIAS, CORES } from "../constants";
import { horaParaLinha, duracaoParaSpan } from "../helpers";

interface EventSlotProps {
  evento: Evento;
  index: number;
  onRemover: (id: string) => void;
}

export default function EventSlot({ evento, index, onRemover }: EventSlotProps) {
  const colIdx = DIAS.indexOf(evento.dia);
  if (colIdx === -1) return null;

  const linhaInicio = horaParaLinha(evento.inicio);
  const span = duracaoParaSpan(evento.inicio, evento.fim);
  const cor = evento.cor || CORES[index % CORES.length];

  return (
    <div
      className="class-slot"
      style={{
        gridColumn: colIdx + 2,
        gridRow: `${linhaInicio} / span ${span}`,
        backgroundColor: cor,
      }}
    >
      <div className="slot-subject">{evento.titulo}</div>
      {evento.responsavel && <div className="slot-info">{evento.responsavel}</div>}
      {evento.local && <div className="slot-info">{evento.local}</div>}
      <div className="slot-time">
        {evento.inicio}–{evento.fim}
      </div>
      <button
        className="slot-remove"
        onClick={() => onRemover(evento.id)}
        title="Remover evento"
      >
        ×
      </button>
    </div>
  );
}
