export function stripAndNormalizeContent(raw: string): string {
  return raw
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
