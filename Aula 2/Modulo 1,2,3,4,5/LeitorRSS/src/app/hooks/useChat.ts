"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, RssCommand } from "@/types";

const MENSAGEM_INICIAL: ChatMessage = {
  id: "initial",
  role: "assistant",
  content:
    "Olá! Sou seu assistente de RSS. Posso cadastrar e remover feeds, resumir notícias e recomendar leituras baseadas nos seus interesses. Experimente: \"Adicione o feed https://gkpb.com.br/feed/\"",
  timestamp: new Date(0),
};

interface UseChatOptions {
  onCommand?: (command: RssCommand) => void;
}

export function useChat({ onCommand }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([MENSAGEM_INICIAL]);
  const [isLoading, setIsLoading] = useState(false);

  // Ref para sempre ter a versão mais recente do callback
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

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

        // Executa comando via ref para garantir versão atualizada
        if (data.rssCommand && onCommandRef.current) {
          try {
            await onCommandRef.current(data.rssCommand);
          } catch (cmdErr) {
            console.error("Erro ao executar comando RSS:", cmdErr);
          }
        }
      } catch (err) {
        const errMsg: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Verifique se o Ollama está rodando e tente novamente.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        console.error("Chat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const pushAssistantMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, isLoading, sendMessage, pushAssistantMessage };
}
