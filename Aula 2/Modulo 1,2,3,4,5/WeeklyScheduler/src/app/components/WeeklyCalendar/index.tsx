"use client";

import type { AgendaSemanal } from "@/types";
import CalendarDayHeaders from "./components/CalendarDayHeaders";
import CalendarTimeLabels from "./components/CalendarTimeLabels";
import CalendarGridCells from "./components/CalendarGridCells";
import EventSlot from "./components/EventSlot";

interface WeeklyCalendarProps {
  agenda: AgendaSemanal;
  onRemoverEvento: (id: string) => void;
}

export default function WeeklyCalendar({
  agenda = { eventos: [] },
  onRemoverEvento,
}: WeeklyCalendarProps) {
  return (
    <div className="weekly-calendar">
      <div className="calendar-grid">
        <CalendarDayHeaders />
        <CalendarTimeLabels />
        <CalendarGridCells />
        {agenda.eventos.map((ev, idx) => (
          <EventSlot key={ev.id} evento={ev} index={idx} onRemover={onRemoverEvento} />
        ))}
      </div>
    </div>
  );
}
