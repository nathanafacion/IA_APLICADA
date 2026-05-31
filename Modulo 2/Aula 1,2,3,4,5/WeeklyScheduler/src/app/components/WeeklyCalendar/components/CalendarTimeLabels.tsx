import { HORAS } from "../constants";

export default function CalendarTimeLabels() {
  return (
    <>
      {HORAS.map((hora) => (
        <div
          key={hora}
          className="time-label"
          style={{ gridRow: (hora - 7) * 4 + 2 }}
        >
          {String(hora).padStart(2, "0")}:00
        </div>
      ))}
    </>
  );
}
