"use client";

import { useCallback, useRef } from "react";
import { useScheduler } from "./hooks/useScheduler";
import { useChat } from "./hooks/useChat";
import WeeklyCalendar from "./components/WeeklyCalendar";
import ChatPanel from "./components/ChatPanel";
import ConflictModal from "./components/ConflictModal";
import type { Evento } from "@/types";

async function exportarPDF(calendarEl: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(calendarEl, {
    backgroundColor: "#0f1117",
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save("agenda-semanal.pdf");
}

export default function HomePage() {
  const calendarRef = useRef<HTMLDivElement>(null);

  const {
    agenda,
    conflitoPendente,
    adicionarEvento,
    forcarAdicionar,
    removerEvento,
    removerEventoPorQuery,
    descartarConflito,
  } = useScheduler();

  const handleEventoDetectado = useCallback(
    (evento: Omit<Evento, "id">) => {
      adicionarEvento(evento);
    },
    [adicionarEvento]
  );

  const { messages, isLoading, sendMessage } = useChat({
    onEventoDetectado: handleEventoDetectado,
    onRemoverQuery: removerEventoPorQuery,
  });

  return (
    <main className="app-layout">
      <header className="app-header">
        <h1>Agenda Semanal</h1>
        <span className="app-subtitle">Gerenciamento inteligente de agenda</span>
        <button
          className="btn-exportar-pdf"
          onClick={() => calendarRef.current && exportarPDF(calendarRef.current)}
        >
          Exportar PDF
        </button>
      </header>

      <div className="app-body">
        <section className="calendar-section">
          <div ref={calendarRef}>
            <WeeklyCalendar agenda={agenda} onRemoverEvento={removerEvento} />
          </div>
        </section>
        <aside className="chat-section">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        </aside>
      </div>

      {conflitoPendente && (
        <ConflictModal
          conflitos={conflitoPendente.conflitos}
          eventoPendente={conflitoPendente.evento}
          onConfirmar={() => forcarAdicionar(conflitoPendente.evento)}
          onCancelar={descartarConflito}
        />
      )}
    </main>
  );
}
