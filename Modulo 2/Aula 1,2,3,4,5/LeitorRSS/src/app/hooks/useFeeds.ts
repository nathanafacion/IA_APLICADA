"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { RssFeed, RssArticle } from "@/types";

export function useFeeds() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Ref para evitar problemas de stale closure
  const feedsRef = useRef(feeds);
  feedsRef.current = feeds;

  // Funções de reload que buscam dados frescos do servidor
  const reloadFeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/feeds");
      const data = await res.json();
      if (Array.isArray(data.feeds)) setFeeds(data.feeds);
    } catch (e) {
      console.error("Erro ao recarregar feeds:", e);
    }
  }, []);

  const reloadArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      if (Array.isArray(data.articles)) setArticles(data.articles);
    } catch (e) {
      console.error("Erro ao recarregar artigos:", e);
    }
  }, []);

  // Carrega feeds e artigos na montagem
  useEffect(() => {
    reloadFeeds();
    reloadArticles();
  }, [reloadFeeds, reloadArticles]);

  const syncFeed = useCallback(async (feedId?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId }),
      });
      const data = await res.json();

      // Recarrega artigos e feeds após sync
      await reloadArticles();
      await reloadFeeds();

      return data.results;
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      return [];
    } finally {
      setIsSyncing(false);
    }
  }, [reloadArticles, reloadFeeds]);

  const addFeed = useCallback(
    async (url: string, name?: string, category?: string) => {
      try {
        const res = await fetch("/api/feeds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, name, category }),
        });
        const data = await res.json();

        if (data.feed) {
          // Atualiza estado local imediatamente
          setFeeds((prev) => {
            if (prev.some((f) => f.id === data.feed.id)) return prev;
            return [...prev, data.feed];
          });
          // Auto-sync do novo feed para buscar artigos
          await syncFeed(data.feed.id);
          return data.feed;
        }

        // Se 409 (já existe), recarrega do servidor
        if (data.error && res.status === 409) {
          await reloadFeeds();
          return data.feed ?? null;
        }

        return null;
      } catch (error) {
        console.error("Erro ao adicionar feed:", error);
        return null;
      }
    },
    [syncFeed, reloadFeeds]
  );

  const removeFeed = useCallback(async (id: string) => {
    try {
      await fetch(`/api/feeds?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setFeeds((prev) => prev.filter((f) => f.id !== id));
      setArticles((prev) => prev.filter((a) => a.feedId !== id));
    } catch (error) {
      console.error("Erro ao remover feed:", error);
    }
  }, []);

  const removeFeedByQuery = useCallback(
    async (query: string) => {
      const q = query.toLowerCase();
      const feed = feedsRef.current.find(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.url.toLowerCase().includes(q)
      );
      if (feed) {
        await removeFeed(feed.id);
        return feed.name;
      }
      return null;
    },
    [removeFeed]
  );

  const syncAllFeeds = useCallback(async () => {
    return syncFeed();
  }, [syncFeed]);

  const markAsRead = useCallback(async (articleId: string) => {
    try {
      await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: articleId }),
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, read: true } : a))
      );
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  }, []);

  // Artigos filtrados por feed selecionado
  const filteredArticles = selectedFeedId
    ? articles.filter((a) => a.feedId === selectedFeedId)
    : articles;

  const unreadCount = articles.filter((a) => !a.read).length;

  return {
    feeds,
    articles,
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
  };
}
