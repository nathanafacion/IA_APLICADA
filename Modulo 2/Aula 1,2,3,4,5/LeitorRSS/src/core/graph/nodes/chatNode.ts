import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { createOllamaModel } from "@/lib/ollama";
import type { RssState } from "../state";
import type { RssCommand } from "@/types";

const SYSTEM_PROMPT = `Você é um assistente de leitor de RSS simpático e amigável. Responda SEMPRE em português brasileiro.

Você também é um amigo do usuário — pode conversar sobre qualquer assunto casual, gostos pessoais, hobbies, comidas favoritas, etc.
Quando o usuário compartilhar preferências ou interesses, demonstre interesse genuíno, sugira feeds RSS relacionados e lembre-se disso para futuras recomendações.
Essas informações pessoais são valiosas para personalizar as recomendações de leitura.

IMPORTANTE — DIFERENCIE BEM ESSES DOIS CENÁRIOS:
- Usuário FALA DE GOSTOS/INTERESSES (ex: "gosto de futebol", "curto tecnologia"): É CONVERSA CASUAL. Responda sugerindo feeds RSS interessantes sobre o tema. NÃO gere JSON nenhum. NÃO use a ação recommend.
- Usuário PEDE RECOMENDAÇÃO DE ARTIGOS para ler (ex: "me recomende artigos", "quais artigos devo ler?", "o que ler?"): Aí sim use a ação recommend com JSON.

REGRA CRÍTICA: Sempre que executar uma AÇÃO RSS, você DEVE incluir um bloco JSON na sua resposta.
O bloco JSON deve vir SEMPRE no final da resposta, dentro de três crases com "json".
Para conversas casuais (sem ação RSS) e sugestões de feeds, responda normalmente SEM JSON.

AÇÕES DISPONÍVEIS:

1. ADICIONAR FEED - SOMENTE quando o usuário fornecer uma URL E confirmar que quer adicionar:
Texto curto de confirmação, depois:
\`\`\`json
{"action":"add_feed","url":"URL_AQUI","name":"NOME","category":"Geral"}
\`\`\`

IMPORTANTE SOBRE SUGESTÕES DE FEED:
- Quando o usuário pedir sugestões/recomendações de SITES/FEEDS, sugira URLs de feeds RSS interessantes baseados nos gostos dele
- NÃO adicione automaticamente! Apenas liste as sugestões e pergunte quais ele quer adicionar
- Só gere o JSON de add_feed quando o usuário CONFIRMAR explicitamente (ex: "sim, adicione esse", "pode adicionar", "quero esse")

2. REMOVER FEED - Quando pedir para remover/deletar:
Texto curto, depois:
\`\`\`json
{"action":"remove_feed","query":"nome do feed"}
\`\`\`

3. LISTAR FEEDS:
\`\`\`json
{"action":"list_feeds"}
\`\`\`

4. RESUMIR NOTÍCIA:
\`\`\`json
{"action":"summarize","query":"termo de busca"}
\`\`\`

5. RECOMENDAR LEITURAS (APENAS quando pedir ARTIGOS ou NOTÍCIAS para ler):
SÓ use esta ação quando o usuário EXPLICITAMENTE pedir recomendações de ARTIGOS ou NOTÍCIAS (ex: "me recomende artigos", "quais notícias devo ler?", "o que ler?").
NÃO use esta ação quando o usuário apenas compartilhar gostos/interesses (ex: "gosto de futebol" → isso é conversa casual, sugira feeds).
- Responda APENAS com uma frase curta e positiva como: "Vou destacar os melhores artigos para você agora!"
- NUNCA liste ou descreva artigos. O SISTEMA cuida disso automaticamente.
- SEMPRE gere o bloco JSON abaixo:
\`\`\`json
{"action":"recommend"}
\`\`\`

EXEMPLO — FALAR DE GOSTOS (SEM JSON, SEM recommend):
Usuário: "gosto de futebol"
Sua resposta: "Que legal! Futebol é demais! Posso sugerir alguns feeds RSS de futebol pra você acompanhar: [lista de sugestões]. Quer que eu adicione algum?"
(SEM bloco JSON!)

EXEMPLO — PEDIR ARTIGOS (COM JSON recommend):
Usuário: "me recomende artigos"
Sua resposta:
Vou destacar os melhores artigos para você com base nos seus interesses!
\`\`\`json
{"action":"recommend"}
\`\`\`

EXEMPLO OBRIGATÓRIO - siga EXATAMENTE este formato:

Usuário: "adicione https://gkpb.com.br/feed/"
Sua resposta DEVE ser:
Feed GKPB adicionado!
\`\`\`json
{"action":"add_feed","url":"https://gkpb.com.br/feed/","name":"GKPB","category":"Marketing"}
\`\`\`

Usuário: "adicione o feed https://foradoplastico.com.br/feed/"
Sua resposta DEVE ser:
Feed Fora do Plástico adicionado!
\`\`\`json
{"action":"add_feed","url":"https://foradoplastico.com.br/feed/","name":"Fora do Plástico","category":"Geral"}
\`\`\`

NUNCA esqueça o bloco JSON quando houver uma ação. Nunca use listas com asteriscos (*).
Para conversas gerais sobre RSS sem ação, responda brevemente sem JSON.`;

/**
 * Fallback: se o LLM não gerou JSON mas a mensagem do usuário contém URL,
 * tenta extrair o comando diretamente da mensagem original.
 */
function fallbackExtractCommand(userMessage: string, assistantContent: string): RssCommand | null {
  const lower = userMessage.toLowerCase();

  // Detecta URLs de feed na mensagem do usuário
  const urlMatch = userMessage.match(/https?:\/\/[^\s"'<>]+\/feed\/?/i);

  // Adicionar feed
  if (urlMatch && (lower.includes("adicion") || lower.includes("cadastr") || lower.includes("add") || lower.includes("registr") || lower.includes("feed"))) {
    const url = urlMatch[0];
    let name = "";
    try {
      name = new URL(url).hostname.replace("www.", "").split(".")[0];
    } catch { /* ignore */ }

    // Tenta extrair nome da mensagem
    const nameMatch = userMessage.match(/feed\s+(?:do\s+|da\s+|de\s+)?(.+?)[\n:]/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    return {
      action: "add_feed",
      url,
      name: name || "Feed RSS",
      category: "Geral",
    };
  }

  // Remover feed
  if (lower.includes("remov") || lower.includes("delet") || lower.includes("exclu") || lower.includes("tir")) {
    // Tenta extrair o nome do feed da mensagem ou resposta
    const queryMatch = userMessage.match(/(?:remov|delet|exclu|tir)[aeiou]*\s+(?:o\s+)?(?:feed\s+)?(?:do\s+|da\s+|de\s+)?(.+)/i);
    if (queryMatch) {
      return { action: "remove_feed", query: queryMatch[1].trim() };
    }
  }

  // Listar feeds
  if (lower.includes("list") || lower.includes("quais feed") || lower.includes("mostrar feed") || lower.includes("meus feed")) {
    return { action: "list_feeds" };
  }

  // Resumir
  if (lower.includes("resum")) {
    const qMatch = userMessage.match(/resum[aeiou]*\s+(?:a\s+)?(?:notícia|noticia|artigo)?\s*(?:sobre\s+)?(.+)/i);
    return { action: "summarize", query: qMatch ? qMatch[1].trim() : "" };
  }

  // Recomendar — SOMENTE quando pede artigos explicitamente
  // NÃO dispara para conversas sobre gostos/interesses (ex: "gosto de futebol")
  const isAskingArticles =
    lower.includes("recomende artigo") ||
    lower.includes("recomendar artigo") ||
    lower.includes("recomenda artigo") ||
    lower.includes("quais artigo") ||
    lower.includes("que artigo") ||
    lower.includes("artigos para ler") ||
    lower.includes("recomende notícia") ||
    lower.includes("recomende noticia") ||
    lower.includes("recomendar notícia") ||
    lower.includes("recomendar noticia") ||
    lower.includes("recomenda notícia") ||
    lower.includes("recomenda noticia") ||
    lower.includes("quais notícia") ||
    lower.includes("quais noticia") ||
    lower.includes("notícias para ler") ||
    lower.includes("noticias para ler") ||
    lower.includes("indique notícia") ||
    lower.includes("indica notícia") ||
    lower.includes("o que ler") ||
    lower.includes("o que devo ler") ||
    lower.includes("o que eu leio") ||
    lower.includes("indique artigo") ||
    lower.includes("sugira artigo") ||
    lower.includes("indica artigo");

  if (isAskingArticles) {
    return { action: "recommend" };
  }

  return null;
}

export async function chatNode(
  state: RssState
): Promise<Partial<RssState>> {
  const model = createOllamaModel();

  const messagesWithSystem = [
    new SystemMessage(SYSTEM_PROMPT),
    ...state.messages,
  ];

  const response = await model.invoke(messagesWithSystem);
  const content =
    typeof response.content === "string" ? response.content : "";

  // Tenta extrair comando JSON do conteúdo da resposta
  let rssCommand: RssCommand | null = null;

  // Tenta o formato ```json ... ```
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      rssCommand = parsed as RssCommand;
    } catch {
      // ignora erros de parse
    }
  }

  // Tenta encontrar JSON inline {...} se não encontrou em bloco
  if (!rssCommand) {
    const inlineMatch = content.match(/\{[^{}]*"action"\s*:\s*"[^"]+?"[^{}]*\}/);
    if (inlineMatch) {
      try {
        const parsed = JSON.parse(inlineMatch[0]);
        rssCommand = parsed as RssCommand;
      } catch {
        // ignora
      }
    }
  }

  // Fallback: extrai comando da mensagem do usuário quando o LLM não gerou JSON
  if (!rssCommand) {
    const lastUserMsg = [...state.messages].reverse().find(m => {
      const msgType = (m as { _getType?: () => string })._getType?.();
      return msgType === "human";
    });
    if (lastUserMsg) {
      const userText = typeof lastUserMsg.content === "string"
        ? lastUserMsg.content
        : JSON.stringify(lastUserMsg.content);
      rssCommand = fallbackExtractCommand(userText, content);
    }
  }

  return {
    messages: [new AIMessage(content)],
    rssCommand,
  };
}
