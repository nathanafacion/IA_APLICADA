import { useState, useRef, useEffect } from "react";
import Message from "./components/Message";
import SprintPanel from "./components/SprintPanel";
import { sendMessage } from "./api/chat";
import "./App.css";

const DEFAULT_USER_ID = "techlead-user-1";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "Olá! Sou seu **Tech Lead especialista**. Posso ajudar com planejamento de sprints, revisão técnica, boas práticas e muito mais.\n\nUse o botão **📋 Contexto da Sprint** para me contar sobre a sprint atual antes de perguntar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sprintContext, setSprintContext] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage({
        userId: DEFAULT_USER_ID,
        message: text,
        sprintContext,
      });
      setMessages((prev) => [...prev, { role: "agent", content: data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: `❌ Erro: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="sidebar__icon">⚡</span>
          <h1 className="sidebar__title">TechLead<br />ChatBot</h1>
        </div>
        <nav className="sidebar__nav">
          <span className="sidebar__nav-item sidebar__nav-item--active">💬 Chat</span>
        </nav>
        <div className="sidebar__footer">
          <span className="sidebar__badge">🧠 Mem0 + LangGraph</span>
          <span className="sidebar__badge">📊 Langfuse</span>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="main__header">
          <h2 className="main__header-title">Tech Lead Especialista</h2>
          <span className="main__header-subtitle">
            {sprintContext ? "✅ Contexto de sprint carregado" : "Nenhum contexto de sprint"}
          </span>
        </header>

        <section className="chat">
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="chat__typing">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={bottomRef} />
        </section>

        <footer className="input-area">
          <SprintPanel onContextChange={setSprintContext} />
          <div className="input-area__row">
            <textarea
              className="input-area__textarea"
              rows={2}
              placeholder="Pergunte sobre planejamento, arquitetura, boas práticas… (Enter para enviar)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="input-area__send btn btn--primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
