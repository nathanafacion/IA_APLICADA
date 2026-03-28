import type { ChatMessage } from "@/types";
import { stripAndNormalizeContent } from "../helpers";

interface ChatBubbleProps {
  message: ChatMessage;
}

function renderBoldLines(text: string) {
  return (
    <>
      {text.split("\n").map((line, lineIdx, arr) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={lineIdx}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
            {lineIdx < arr.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const text = stripAndNormalizeContent(message.content);
  const time =
    message.timestamp.getTime() === 0
      ? ""
      : message.timestamp.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

  return (
    <div className={`chat-bubble ${message.role}`}>
      <div className="bubble-content">{renderBoldLines(text)}</div>
      <div className="bubble-time">{time}</div>
    </div>
  );
}
