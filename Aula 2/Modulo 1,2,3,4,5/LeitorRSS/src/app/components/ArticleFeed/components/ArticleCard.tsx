"use client";

import React from "react";
import type { RssArticle } from "@/types";

interface ArticleCardProps {
  article: RssArticle;
  onMarkRead: (id: string) => void;
  recommended?: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getDomain(link: string): string {
  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function ArticleCard({ article, onMarkRead, recommended }: ArticleCardProps) {
  const handleClick = () => {
    if (!article.read) {
      onMarkRead(article.id);
    }
  };

  const cardClass = [
    "article-card",
    article.read ? "article-card--read" : "",
    recommended ? "article-card--recommended" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <div className="article-card__header">
        <span className="article-card__source">{article.feedName}</span>
        <span className="article-card__domain">{getDomain(article.link)}</span>
        {recommended && <span className="article-card__badge article-card__badge--recommended">Leia</span>}
        {!article.read && !recommended && <span className="article-card__badge">Novo</span>}
      </div>

      <h3 className="article-card__title">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {article.title}
        </a>
      </h3>

      {article.description && (
        <p className="article-card__desc">{article.description}</p>
      )}

      <footer className="article-card__footer">
        <span className="article-card__date">{formatDate(article.pubDate)}</span>
        <a
          className="article-card__link"
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          Ler notícia →
        </a>
      </footer>
    </div>
  );
}
