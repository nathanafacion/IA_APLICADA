"use client";

import React from "react";
import type { RssArticle } from "@/types";
import ArticleCard from "./components/ArticleCard";

interface ArticleFeedProps {
  articles: RssArticle[];
  selectedFeedName: string | null;
  onMarkRead: (id: string) => void;
  recommendedIds?: string[];
}

export default function ArticleFeed({
  articles,
  selectedFeedName,
  onMarkRead,
  recommendedIds = [],
}: ArticleFeedProps) {
  const title = selectedFeedName || "Todas as Novidades";
  const recommendedSet = new Set(recommendedIds);

  return (
    <section className="article-feed">
      <header className="article-feed__header">
        <h2 className="article-feed__title">{title}</h2>
        <span className="article-feed__count">{articles.length} artigo(s)</span>
      </header>

      <div className="article-feed__list">
        {articles.length === 0 ? (
          <div className="article-feed__empty">
            <div className="article-feed__empty-icon">📡</div>
            <h3>Nenhuma novidade por aqui</h3>
            <p>
              Cadastre feeds RSS via chat e clique em &ldquo;Sincronizar&rdquo; para
              buscar as últimas notícias.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onMarkRead={onMarkRead}
              recommended={recommendedSet.has(article.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
