"use client";

import type { ChatMessage } from "@/types";
import ChatMessageList from "./components/ChatMessageList";
import ChatInput from "./components/ChatInput";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, isLoading, onSend }: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Assistente de Agenda</h2>
      </div>
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
