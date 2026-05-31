/**
 * /api/articles
 * GET - lista artigos (opcional: ?feedId=X para filtrar por feed)
 */
import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, getArticlesByFeed, markArticleRead } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const feedId = req.nextUrl.searchParams.get("feedId");
    const articles = feedId ? getArticlesByFeed(feedId) : getAllArticles();

    return NextResponse.json({
      articles: articles.map((a) => ({
        ...a,
        read: !!a.read,
      })),
    });
  } catch (error: unknown) {
    console.error("Articles GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar artigos" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }
    markArticleRead(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Articles PATCH error:", error);
    return NextResponse.json({ error: "Erro ao atualizar artigo" }, { status: 500 });
  }
}
