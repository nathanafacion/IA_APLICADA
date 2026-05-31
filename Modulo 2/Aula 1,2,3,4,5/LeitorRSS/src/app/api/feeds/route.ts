/**
 * /api/feeds
 * GET    - lista todos os feeds RSS cadastrados
 * POST   - adiciona um novo feed RSS
 * DELETE - remove um feed RSS por id (?id=X)
 */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getAllFeeds, addFeed, deleteFeed, getFeedByUrl } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const feeds = getAllFeeds();
    return NextResponse.json({ feeds });
  } catch (error: unknown) {
    console.error("Feeds GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar feeds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, url, category } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
    }

    // Valida URL
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Protocolo inválido" }, { status: 400 });
    }

    // Previne SSRF
    const blockedPatterns = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i;
    if (blockedPatterns.test(parsed.hostname)) {
      return NextResponse.json({ error: "URL interna não permitida" }, { status: 400 });
    }

    // Verifica duplicata
    const existing = getFeedByUrl(url);
    if (existing) {
      return NextResponse.json({ error: "Feed já cadastrado", feed: existing }, { status: 409 });
    }

    const id = uuidv4();
    const feedName = name || parsed.hostname.replace("www.", "");
    const feedCategory = category || "Geral";

    addFeed(id, feedName, url, feedCategory);

    return NextResponse.json({
      success: true,
      feed: { id, name: feedName, url, category: feedCategory, lastFetch: "" },
    });
  } catch (error: unknown) {
    console.error("Feeds POST error:", error);
    return NextResponse.json({ error: "Erro ao adicionar feed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }
    deleteFeed(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Feeds DELETE error:", error);
    return NextResponse.json({ error: "Erro ao remover feed" }, { status: 500 });
  }
}
