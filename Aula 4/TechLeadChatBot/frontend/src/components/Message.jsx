import ReactMarkdown from "react-markdown";
import "./Message.css";

export default function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`message ${isUser ? "message--user" : "message--agent"}`}>
      <span className="message__avatar">{isUser ? "🧑‍💻" : "🤖"}</span>
      <div className="message__bubble">
        {isUser ? (
          <p>{content}</p>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
