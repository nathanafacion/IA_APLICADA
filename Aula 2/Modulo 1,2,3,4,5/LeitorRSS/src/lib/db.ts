import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "rss.db");

// Garante que a pasta data/ existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Singleton para evitar múltiplas conexões em dev (hot-reload)
const globalAny = globalThis as unknown as { __rssDb?: Database.Database };

function getDb(): Database.Database {
  if (!globalAny.__rssDb) {
    globalAny.__rssDb = new Database(DB_PATH);
    globalAny.__rssDb.pragma("journal_mode = WAL");
    migrate(globalAny.__rssDb);
  }
  return globalAny.__rssDb;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rss_feeds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT '',
      lastFetch TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS rss_articles (
      id TEXT PRIMARY KEY,
      feedId TEXT NOT NULL,
      feedName TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      pubDate TEXT NOT NULL DEFAULT '',
      read INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (feedId) REFERENCES rss_feeds(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_summary (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      summary TEXT NOT NULL DEFAULT '',
      lastMessageId INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL DEFAULT ''
    );
  `);
}

// ============================================================
// RSS Feeds CRUD
// ============================================================

export function getAllFeeds() {
  return getDb().prepare("SELECT * FROM rss_feeds ORDER BY name").all() as Array<{
    id: string;
    name: string;
    url: string;
    category: string;
    lastFetch: string;
  }>;
}

export function getFeedById(id: string) {
  return getDb().prepare("SELECT * FROM rss_feeds WHERE id = ?").get(id) as {
    id: string;
    name: string;
    url: string;
    category: string;
    lastFetch: string;
  } | undefined;
}

export function getFeedByUrl(url: string) {
  return getDb().prepare("SELECT * FROM rss_feeds WHERE url = ?").get(url) as {
    id: string;
    name: string;
    url: string;
    category: string;
    lastFetch: string;
  } | undefined;
}

export function addFeed(id: string, name: string, url: string, category: string) {
  getDb()
    .prepare("INSERT INTO rss_feeds (id, name, url, category, lastFetch) VALUES (?, ?, ?, ?, ?)")
    .run(id, name, url, category, new Date().toISOString());
}

export function deleteFeed(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM rss_articles WHERE feedId = ?").run(id);
  db.prepare("DELETE FROM rss_feeds WHERE id = ?").run(id);
}

export function updateFeedLastFetch(id: string) {
  getDb()
    .prepare("UPDATE rss_feeds SET lastFetch = ? WHERE id = ?")
    .run(new Date().toISOString(), id);
}

// ============================================================
// RSS Articles
// ============================================================

export function getAllArticles() {
  return getDb()
    .prepare("SELECT * FROM rss_articles ORDER BY pubDate DESC")
    .all() as Array<{
    id: string;
    feedId: string;
    feedName: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    read: number;
  }>;
}

export function getArticlesByFeed(feedId: string) {
  return getDb()
    .prepare("SELECT * FROM rss_articles WHERE feedId = ? ORDER BY pubDate DESC")
    .all(feedId) as Array<{
    id: string;
    feedId: string;
    feedName: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    read: number;
  }>;
}

export function getArticleById(id: string) {
  return getDb().prepare("SELECT * FROM rss_articles WHERE id = ?").get(id) as {
    id: string;
    feedId: string;
    feedName: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    read: number;
  } | undefined;
}

export function addArticle(
  id: string,
  feedId: string,
  feedName: string,
  title: string,
  link: string,
  description: string,
  pubDate: string
) {
  // Usa INSERT OR IGNORE para evitar duplicatas via link
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO rss_articles (id, feedId, feedName, title, link, description, pubDate, read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(id, feedId, feedName, title, link, description, pubDate);
}

export function markArticleRead(id: string) {
  getDb().prepare("UPDATE rss_articles SET read = 1 WHERE id = ?").run(id);
}

export function articleExistsByLink(link: string): boolean {
  const row = getDb().prepare("SELECT id FROM rss_articles WHERE link = ?").get(link);
  return !!row;
}

/**
 * Busca artigos não lidos cujo título ou descrição contenham alguma das palavras-chave.
 * Usa LIKE com cada keyword para filtrar no SQLite.
 */
export function searchArticlesByKeywords(keywords: string[]): Array<{
  id: string;
  feedId: string;
  feedName: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  read: number;
}> {
  if (keywords.length === 0) return [];

  const conditions = keywords.map(
    () => "(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)"
  );
  const sql = `SELECT * FROM rss_articles WHERE read = 0 AND (${conditions.join(" OR ")}) ORDER BY pubDate DESC LIMIT 50`;

  const params: string[] = [];
  for (const kw of keywords) {
    const term = `%${kw.toLowerCase()}%`;
    params.push(term, term);
  }

  return getDb().prepare(sql).all(...params) as Array<{
    id: string;
    feedId: string;
    feedName: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    read: number;
  }>;
}

// ============================================================
// Chat History
// ============================================================

export function getChatHistory(limit = 50) {
  return getDb()
    .prepare("SELECT * FROM chat_history ORDER BY id DESC LIMIT ?")
    .all(limit) as Array<{
    id: number;
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export function addChatMessage(role: string, content: string) {
  getDb()
    .prepare("INSERT INTO chat_history (role, content, timestamp) VALUES (?, ?, ?)")
    .run(role, content, new Date().toISOString());
}

export function clearChatHistory() {
  getDb().prepare("DELETE FROM chat_history").run();
}

// ============================================================
// User Summary (resumo de interesses)
// ============================================================

export function getUserSummary(): { summary: string; lastMessageId: number } | null {
  const row = getDb().prepare("SELECT summary, lastMessageId FROM user_summary WHERE id = 1").get() as {
    summary: string;
    lastMessageId: number;
  } | undefined;
  return row ?? null;
}

export function upsertUserSummary(summary: string, lastMessageId: number) {
  getDb()
    .prepare(
      `INSERT INTO user_summary (id, summary, lastMessageId, updatedAt) VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET summary = excluded.summary, lastMessageId = excluded.lastMessageId, updatedAt = excluded.updatedAt`
    )
    .run(summary, lastMessageId, new Date().toISOString());
}

export function getChatMessagesSinceId(sinceId: number) {
  return getDb()
    .prepare("SELECT * FROM chat_history WHERE id > ? ORDER BY id ASC")
    .all(sinceId) as Array<{
    id: number;
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export function getLatestChatMessageId(): number {
  const row = getDb().prepare("SELECT MAX(id) as maxId FROM chat_history").get() as { maxId: number | null };
  return row?.maxId ?? 0;
}
