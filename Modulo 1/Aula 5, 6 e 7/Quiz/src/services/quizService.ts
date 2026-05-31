import { QuizQuestion } from "./quizTypes";
import { generateExplanationAI } from "./quizAiHelpers";
import { ai } from "../../lib/genkit";
import { evaluateMathAnswer } from "./quizMathHelpers";

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: "fácil",
    medium: "médio",
    hard: "difícil",
  };
  return labels[difficulty] || difficulty;
}


export function evaluateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return evaluateMathAnswer(userAnswer, correctAnswer);
}

export async function generateQuestionsBatch(numQuestions: number, difficulty = "easy", topic = "math"): Promise<QuizQuestion[]> {
  const diffLabel = getDifficultyLabel(difficulty);
  const systemPrompt = `# 1. Persona (Papel)
Você é um professor de matemática experiente e didático, especialista em criar questões de estudo para alunos do ensino fundamental e médio. Você tem 15 anos de experiência ensinando matemática de forma clara e envolvente.

# 2. Contexto
Estamos desenvolvendo um aplicativo de quiz de matemática para ajudar estudantes a praticar e aprender. O aluno está estudando o tópico "${topic}" no nível de dificuldade "${diffLabel}". Precisamos de questões que sejam educativas e adequadas ao nível do estudante.

# 3. Tarefa (Instrução)
ATENÇÃO: O tema de cada questão deve ser estritamente sobre "${topic}". O campo "topic" do JSON DEVE ser exatamente "${topic}" (mesmo acento, mesmo texto). Não aceite variações.\nCrie um ARRAY com ${numQuestions} questões de matemática sobre "${topic}" com nível de dificuldade "${diffLabel}". Cada questão deve ser clara, objetiva e ter exatamente 4 alternativas de resposta, sendo apenas uma correta.\nA explicação de cada resposta deve ser detalhada, didática e ajudar o usuário a entender o porquê da resposta correta, mostrando o raciocínio passo a passo.\nEvite explicações superficiais.

# 4. Formato (Saída)
Retorne APENAS um array JSON válido, onde cada elemento tem a seguinte estrutura:
- "question": texto da pergunta (string)
- "choices": array com exatamente 4 alternativas (array de strings)
- "answer": a resposta correta, deve ser igual a uma das choices (string)
- "explanation": explicação didática e detalhada de por que essa é a resposta correta (string)

# 5. Restrições (Regras)
- NÃO inclua nenhum texto antes ou depois do JSON
- NÃO use markdown ou formatação especial
- Cada resposta correta DEVE estar entre as 4 alternativas
- Use notação matemática simples (números, +, -, *, /, ^, √)
- A explicação deve ter entre 2 e 4 frases e ser detalhada, mostrando o raciocínio.
- Todas as alternativas devem ser plausíveis (sem respostas obviamente erradas)
- As questões devem ser diferentes entre si

# 6. Exemplos (Few-Shot)
Exemplo de saída esperada para um array de 2 questões fáceis de tabuada:
[
{"question":"Quanto é 7 x 8?","choices":["54","56","64","48"],"answer":"56","explanation":"Para resolver 7 x 8, basta multiplicar: 7 vezes 8 é igual a 56. Multiplicações de tabuada são importantes para o cálculo mental. Se você errar, tente lembrar da ordem das tabuadas."},
{"question":"Quanto é 3 x 6?","choices":["18","12","24","16"],"answer":"18","explanation":"Multiplicando 3 por 6, temos 3 x 6 = 18. É importante praticar as tabuadas para ganhar agilidade."}
]
`;
  const userPrompt = `Crie um array com ${numQuestions} questões de matemática sobre "${topic}" com dificuldade "${diffLabel}". Retorne apenas o JSON.`;
  const response = await ai.generate({
    system: systemPrompt,
    prompt: userPrompt,
  });
  const out = response.text || "[]";
  let arr: any[] = [];
  // Tenta extrair o JSON mesmo que venha "sujinho"
  let clean = String(out).replace(/```json\n?|\n?```/g, "").trim();
  // Se não começar com [ tenta encontrar o primeiro [ e o último ]
  if (!clean.startsWith("[")) {
    const first = clean.indexOf("[");
    const last = clean.lastIndexOf("]");
    if (first !== -1 && last !== -1 && last > first) {
      clean = clean.substring(first, last + 1);
    }
  }
  try {
    arr = JSON.parse(clean);
  } catch (err) {
    // Log para depuração
    console.error("Erro ao fazer parse do JSON gerado pela IA:", err, "Resposta:", out);
    arr = [];
  }
  // Validação: só aceita questões válidas
  const valid = Array.isArray(arr)
    ? arr.filter(q =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.choices) &&
        q.choices.length === 4 &&
        new Set(q.choices).size === 4 &&
        q.choices.includes(q.answer)
      )
    : [];
  // Limita ao número pedido
  if (valid.length === 0) {
    throw new Error("Não foi possível gerar questões válidas. Resposta da IA: " + out);
  }
  return valid.slice(0, numQuestions);
}


// Wrapper para manter compatibilidade com API antiga
/**
 * Gera uma explicação para a resposta do usuário.
 * @param question Texto da questão
 * @param userAnswer Resposta do usuário
 * @param correctAnswer Resposta correta
 * @param correct Se o usuário acertou
 */
export async function generateExplanation(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  correct: boolean
): Promise<string> {
  // Prompt simples, pode ser customizado conforme necessidade
  const prompt = `Questão: ${question}\nResposta do usuário: ${userAnswer}\nResposta correta: ${correctAnswer}\nO usuário ${correct ? "acertou" : "errou"}. Explique de forma didática o porquê da resposta correta.`;
  return generateExplanationAI(prompt);
}
