"use client";

import React from "react";
import type { RssFeed } from "@/types";

interface FeedListProps {
  feeds: RssFeed[];
  selectedFeedId: string | null;
  onSelectFeed: (feedId: string | null) => void;
  onRemoveFeed: (feedId: string) => void;
  onSyncFeed: (feedId: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  unreadCount: number;
}

export default function FeedList({
  feeds,
  selectedFeedId,
  onSelectFeed,
  onRemoveFeed,
  onSyncFeed,
  onSyncAll,
  isSyncing,
  unreadCount,
}: FeedListProps) {
  return (
    <div className="feed-list">
      <header className="feed-list__header">
        <h2 className="feed-list__title">📡 Meus Feeds</h2>
        <span className="feed-list__count">
          {feeds.length} feed(s) · {unreadCount} não lido(s)
        </span>
      </header>

      <div className="feed-list__actions">
        <button
          className={`feed-list__sync-all ${isSyncing ? "feed-list__sync-all--loading" : ""}`}
          onClick={onSyncAll}
          disabled={isSyncing || feeds.length === 0}
        >
          {isSyncing ? "Sincronizando..." : "↻ Sincronizar Todos"}
        </button>
      </div>

      <div className="feed-list__items">
        {/* Aba "Todas as novidades" */}
        <button
          className={`feed-card ${selectedFeedId === null ? "feed-card--active" : ""}`}
          onClick={() => onSelectFeed(null)}
        >
          <div className="feed-card__icon">🌐</div>
          <div className="feed-card__info">
            <span className="feed-card__name">Todas as Novidades</span>
            <span className="feed-card__url">Todos os feeds combinados</span>
          </div>
        </button>

        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`feed-card ${selectedFeedId === feed.id ? "feed-card--active" : ""}`}
          >
            <button
              className="feed-card__main"
              onClick={() => onSelectFeed(feed.id)}
            >
              <div className="feed-card__icon">📰</div>
              <div className="feed-card__info">
                <span className="feed-card__name">{feed.name}</span>
                <span className="feed-card__category">{feed.category}</span>
                <span className="feed-card__url">
                  {new URL(feed.url).hostname.replace("www.", "")}
                </span>
              </div>
            </button>
            <div className="feed-card__actions">
              <button
                className="feed-card__btn feed-card__btn--sync"
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncFeed(feed.id);
                }}
                disabled={isSyncing}
                title="Sincronizar"
              >
                ↻
              </button>
              <button
                className="feed-card__btn feed-card__btn--remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFeed(feed.id);
                }}
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {feeds.length === 0 && (
          <div className="feed-list__empty">
            <p>Nenhum feed cadastrado.</p>
            <p>Use o chat para adicionar feeds RSS!</p>
          </div>
        )}
      </div>
    </div>
  );
}
