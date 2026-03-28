import { DIAS } from "../constants";

export default function CalendarDayHeaders() {
  return (
    <>
      <div className="time-label corner" />
      {DIAS.map((dia) => (
        <div key={dia} className="day-header">
          {dia}
        </div>
      ))}
    </>
  );
}
