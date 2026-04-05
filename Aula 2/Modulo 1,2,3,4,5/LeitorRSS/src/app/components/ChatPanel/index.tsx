"use client";

import React from "react";
import ChatMessageList from "./components/ChatMessageList";
import ChatInput from "./components/ChatInput";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, isLoading, onSend }: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <header className="chat-panel__header">
        <span className="chat-panel__header-icon">🤖</span>
        <div>
          <h2 className="chat-panel__title">RSS Assistant</h2>
          <p className="chat-panel__subtitle">Gerenciar feeds e notícias</p>
        </div>
        <span className={`chat-panel__status ${isLoading ? "chat-panel__status--thinking" : ""}`}>
          {isLoading ? "Pensando..." : "Online"}
        </span>
      </header>

      <ChatMessageList messages={messages} isLoading={isLoading} />

      <footer className="chat-panel__footer">
        <ChatInput onSend={onSend} disabled={isLoading} />
        <p className="chat-panel__hint">
          Diga: <em>&ldquo;Adicione https://gkpb.com.br/feed/&rdquo;</em> ou <em>&ldquo;Me recomende algo&rdquo;</em>
        </p>
      </footer>
    </div>
  );
}
