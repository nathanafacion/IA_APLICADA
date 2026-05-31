/**
 * Remove blocos de código ```json ... ``` da resposta do LLM,
 * colapsando espaços e quebras de linha extras.
 */
export function stripAndNormalizeContent(content: string): string {
  return content
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseBoldMarkdown(
  text: string
): Array<{ type: "text" | "strong" | "em"; content: string }> {
  const segments: Array<{ type: "text" | "strong" | "em"; content: string }> = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "strong", content: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: "em", content: match[2] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}
