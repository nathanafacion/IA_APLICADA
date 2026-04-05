"use client";

import React from "react";
import { stripAndNormalizeContent, parseBoldMarkdown } from "../helpers";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const cleaned = stripAndNormalizeContent(message.content);
  const segments = parseBoldMarkdown(cleaned);

  const time =
    message.timestamp.getTime() === 0
      ? ""
      : message.timestamp.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

  return (
    <div className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"}`}>
      <div className="chat-bubble__content">
        {segments.map((seg, i) => {
          if (seg.type === "strong") return <strong key={i}>{seg.content}</strong>;
          if (seg.type === "em") return <em key={i}>{seg.content}</em>;
          return <span key={i}>{seg.content}</span>;
        })}
      </div>
      {time && <span className="chat-bubble__time">{time}</span>}
    </div>
  );
}
