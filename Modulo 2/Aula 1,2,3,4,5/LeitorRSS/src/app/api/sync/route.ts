/**
 * /api/sync
 * POST - busca artigos RSS de um feed ou de todos os feeds
 * Body: { feedId?: string } — se vazio, sincroniza todos
 */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getAllFeeds, getFeedById, updateFeedLastFetch, addArticle, articleExistsByLink } from "@/lib/db";
import { fetchAndParseRss } from "@/lib/rssParser";

export const runtime = "nodejs";
export const maxDuration = 120;

async function syncSingleFeed(feed: { id: string; name: string; url: string; category: string }) {
  const parsed = await fetchAndParseRss(feed.url);
  let newCount = 0;

  for (const article of parsed.articles) {
    if (!articleExistsByLink(article.link)) {
      addArticle(
        uuidv4(),
        feed.id,
        feed.name,
        article.title,
        article.link,
        article.description,
        article.pubDate || new Date().toISOString()
      );
      newCount++;
    }
  }

  updateFeedLastFetch(feed.id);

  return {
    feedId: feed.id,
    feedName: feed.name,
    totalArticles: parsed.articles.length,
    newArticles: newCount,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { feedId } = body as { feedId?: string };

    if (feedId) {
      // Sincroniza um feed específico
      const feed = getFeedById(feedId);
      if (!feed) {
        return NextResponse.json({ error: "Feed não encontrado" }, { status: 404 });
      }

      const result = await syncSingleFeed(feed);
      return NextResponse.json({ results: [result] });
    }

    // Sincroniza todos os feeds
    const feeds = getAllFeeds();
    if (feeds.length === 0) {
      return NextResponse.json({ results: [], message: "Nenhum feed cadastrado" });
    }

    const results = [];
    for (const feed of feeds) {
      try {
        const result = await syncSingleFeed(feed);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao sincronizar feed ${feed.name}:`, error);
        results.push({
          feedId: feed.id,
          feedName: feed.name,
          totalArticles: 0,
          newArticles: 0,
          error: `Falha: ${error instanceof Error ? error.message : "erro desconhecido"}`,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: "Erro ao sincronizar feeds" }, { status: 500 });
  }
}
