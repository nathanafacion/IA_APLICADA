"use client";

import { useCallback, useState, useRef } from "react";
import { useFeeds } from "./hooks/useFeeds";
import { useChat } from "./hooks/useChat";
import FeedList from "./components/FeedList";
import ArticleFeed from "./components/ArticleFeed";
import ChatPanel from "./components/ChatPanel";
import type { RssCommand } from "@/types";

export default function HomePage() {
  const {
    feeds,
    filteredArticles,
    selectedFeedId,
    setSelectedFeedId,
    isSyncing,
    addFeed,
    removeFeed,
    removeFeedByQuery,
    syncFeed,
    syncAllFeeds,
    markAsRead,
    unreadCount,
  } = useFeeds();

  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);

  // Ref para acessar pushAssistantMessage dentro de handleCommand sem dependência circular
  const pushMsgRef = useRef<(content: string) => void>(() => {});

  const handleCommand = useCallback(
    async (command: RssCommand) => {
      switch (command.action) {
        case "add_feed":
          if (command.url) {
            await addFeed(command.url, command.name, command.category);
          }
          break;
        case "remove_feed":
          if (command.query) {
            await removeFeedByQuery(command.query);
          }
          break;
        case "list_feeds":
          break;
        case "summarize":
          break;
        case "recommend":
          try {
            const res = await fetch("/api/recommend");
            if (!res.ok) {
              console.error("Recommend API retornou status:", res.status);
              pushMsgRef.current("Ocorreu um erro ao buscar recomendações. Tente novamente.");
              break;
            }
            const data = await res.json();
            console.log("[Recommend] Resposta:", data);
            if (Array.isArray(data.recommendedIds) && data.recommendedIds.length > 0) {
              setRecommendedIds(data.recommendedIds);
              const artigos = Array.isArray(data.recommendedArticles)
                ? data.recommendedArticles
                : [];
              const lista = artigos
                .map((a: { title: string }, i: number) => `${i + 1}. ${a.title}`)
                .join("\n");
              pushMsgRef.current(
                `Pronto! Destaquei ${data.recommendedIds.length} artigos recomendados para você. As bordas dos cards ficaram roxas e a tag "Leia" apareceu:\n\n${lista}\n\nBoa leitura!`
              );
            } else {
              pushMsgRef.current("Não encontrei artigos não lidos para recomendar. Sincronize seus feeds primeiro!");
            }
          } catch (e) {
            console.error("Erro ao buscar recomendações:", e);
            pushMsgRef.current("Ocorreu um erro ao buscar recomendações. Tente novamente.");
          }
          break;
      }
    },
    [addFeed, removeFeedByQuery]
  );

  const { messages, isLoading, sendMessage, pushAssistantMessage } = useChat({
    onCommand: handleCommand,
  });

  // Mantém ref atualizada
  pushMsgRef.current = pushAssistantMessage;

  // Nome do feed selecionado para o header
  const selectedFeedName = selectedFeedId
    ? feeds.find((f) => f.id === selectedFeedId)?.name ?? null
    : null;

  return (
    <main className="app-layout">
      <header className="app-header">
        <h1>📰 Leitor RSS</h1>
        <span className="app-subtitle">Leitor inteligente de feeds RSS com IA</span>
      </header>

      <div className="app-body">
        <aside className="feed-sidebar">
          <FeedList
            feeds={feeds}
            selectedFeedId={selectedFeedId}
            onSelectFeed={setSelectedFeedId}
            onRemoveFeed={removeFeed}
            onSyncFeed={(id) => syncFeed(id)}
            onSyncAll={syncAllFeeds}
            isSyncing={isSyncing}
            unreadCount={unreadCount}
          />
        </aside>

        <section className="article-section">
          <ArticleFeed
            articles={filteredArticles}
            selectedFeedName={selectedFeedName}
            onMarkRead={markAsRead}
            recommendedIds={recommendedIds}
          />
        </section>

        <aside className="chat-sidebar">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        </aside>
      </div>
    </main>
  );
}
