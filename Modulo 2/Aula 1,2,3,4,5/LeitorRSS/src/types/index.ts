// ============================================================
// RSS Feed Types
// ============================================================

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  lastFetch: string;
}

export interface RssArticle {
  id: string;
  feedId: string;
  feedName: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  read: boolean;
}

// ============================================================
// Chat Types
// ============================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface GuardrailResult {
  safe: boolean;
  reason?: string;
}

// ============================================================
// Commands
// ============================================================

export interface RssCommand {
  action: "add_feed" | "remove_feed" | "list_feeds" | "summarize" | "recommend" | "none";
  url?: string;
  name?: string;
  category?: string;
  articleId?: string;
  query?: string;
}
