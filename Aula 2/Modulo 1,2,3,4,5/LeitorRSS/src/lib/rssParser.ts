/**
 * Busca e parseia um feed RSS/Atom a partir de uma URL.
 * Retorna lista de artigos com título, link, descrição e data.
 */

export interface ParsedArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export interface ParsedFeed {
  feedTitle: string;
  articles: ParsedArticle[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["'][^>]*/?>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

export async function fetchAndParseRss(url: string): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LeitorRSS/1.0",
      Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar feed: HTTP ${response.status}`);
  }

  const xml = await response.text();

  // Detecta se é Atom ou RSS
  const isAtom = /<feed[\s>]/i.test(xml);

  if (isAtom) {
    return parseAtom(xml);
  }
  return parseRss(xml);
}

function parseRss(xml: string): ParsedFeed {
  const feedTitle = extractTag(xml, "title");

  const articles: ParsedArticle[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = decodeHtmlEntities(stripHtml(extractTag(itemXml, "title")));
    const link = decodeHtmlEntities(
      extractTag(itemXml, "link") || extractTag(itemXml, "guid")
    );
    const rawDesc =
      extractTag(itemXml, "description") ||
      extractTag(itemXml, "content:encoded") ||
      "";
    const description = decodeHtmlEntities(stripHtml(rawDesc)).slice(0, 500);
    const pubDate = extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date") || "";

    if (title && link) {
      articles.push({ title, link, description, pubDate });
    }
  }

  return { feedTitle: decodeHtmlEntities(stripHtml(feedTitle)), articles };
}

function parseAtom(xml: string): ParsedFeed {
  const feedTitle = extractTag(xml, "title");

  const articles: ParsedArticle[] = [];
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const title = decodeHtmlEntities(stripHtml(extractTag(entryXml, "title")));
    const link =
      decodeHtmlEntities(extractAttr(entryXml, "link", "href")) ||
      decodeHtmlEntities(extractTag(entryXml, "link"));
    const rawDesc =
      extractTag(entryXml, "summary") ||
      extractTag(entryXml, "content") ||
      "";
    const description = decodeHtmlEntities(stripHtml(rawDesc)).slice(0, 500);
    const pubDate =
      extractTag(entryXml, "published") ||
      extractTag(entryXml, "updated") ||
      "";

    if (title && link) {
      articles.push({ title, link, description, pubDate });
    }
  }

  return { feedTitle: decodeHtmlEntities(stripHtml(feedTitle)), articles };
}
