"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, Evento } from "@/types";

const MENSAGEM_INICIAL: ChatMessage = {
  id: "initial",
  role: "assistant",
  content:
    "Olá! Sou seu assistente de agenda semanal. Posso adicionar, remover ou consultar eventos. Por exemplo: \"Adiciona reunião de equipe na Segunda das 09:00 às 10:30 na Sala de Conferências\"",
  timestamp: new Date(0), // timestamp fixo evita mismatch SSR
};

interface UseChatOptions {
  onEventoDetectado?: (evento: Omit<Evento, "id">) => void;
  onRemoverQuery?: (query: string) => void;
}

export function useChat({ onEventoDetectado, onRemoverQuery }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([MENSAGEM_INICIAL]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, guardrailsEnabled: true }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (data.pendingEvento && onEventoDetectado) {
          onEventoDetectado(data.pendingEvento);
        }

        if (data.scheduleAction && onRemoverQuery) {
          try {
            const action = JSON.parse(data.scheduleAction);
            if (action.action === "remove" && action.query) {
              onRemoverQuery(action.query);
            }
          } catch {
            // JSON inválido, ignora
          }
        }
      } catch (err) {
        const errMsg: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        console.error("Chat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, onEventoDetectado, onRemoverQuery]
  );

  return { messages, isLoading, sendMessage };
}
