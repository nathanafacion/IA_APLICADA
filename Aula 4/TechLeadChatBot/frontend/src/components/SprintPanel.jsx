import { useState } from "react";
import "./SprintPanel.css";

export default function SprintPanel({ onContextChange }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");

  function handleSave() {
    onContextChange(context);
    setOpen(false);
  }

  return (
    <div className="sprint-panel">
      <button className="sprint-panel__toggle" onClick={() => setOpen((o) => !o)}>
        📋 Contexto da Sprint
      </button>

      {open && (
        <div className="sprint-panel__drawer">
          <p className="sprint-panel__hint">
            Informe dados da sprint atual (velocidade, impedimentos, metas, time, tecnologias…).
            O agente usará esse contexto para planejar melhor.
          </p>
          <textarea
            className="sprint-panel__textarea"
            rows={8}
            placeholder={`Exemplo:\nSprint 5 | Time: 6 devs\nVelocidade média: 42 pts\nImpedimentos: dependência do time de infra\nMetas: migrar módulo de pagamento para microsserviços\nDívida técnica: testes E2E ainda sem cobertura`}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <div className="sprint-panel__actions">
            <button className="btn btn--secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn--primary" onClick={handleSave}>
              Salvar contexto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
