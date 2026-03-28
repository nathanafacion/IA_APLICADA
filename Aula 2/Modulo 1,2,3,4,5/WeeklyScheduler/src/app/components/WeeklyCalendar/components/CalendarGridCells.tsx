import { DIAS, HORAS } from "../constants";

export default function CalendarGridCells() {
  return (
    <>
      {DIAS.map((dia, colIdx) =>
        HORAS.map((hora) => (
          <div
            key={`${dia}-${hora}`}
            className="grid-cell"
            style={{
              gridColumn: colIdx + 2,
              gridRow: (hora - 7) * 4 + 2,
              gridRowEnd: (hora - 7) * 4 + 6,
            }}
          />
        ))
      )}
    </>
  );
}
