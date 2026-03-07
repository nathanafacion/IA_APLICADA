import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/services/neo4j";
import { generateEmbedding } from "@/services/embeddings";
import { generateRagResponse } from "@/services/llm";
import type { CarResult } from "@/features/cars/types";

export type { CarResult };

interface Neo4jCarNode {
  node: {
    properties: Omit<CarResult, "score">;
  };
  score: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query?.trim();
    const topK: number = body.topK ?? 5;

    if (!query) {
      return NextResponse.json({ error: "Query não pode estar vazia" }, { status: 400 });
    }

    // 1. Gerar embedding da busca do usuário
    const queryEmbedding = await generateEmbedding(query);

    // 2. Busca vetorial por similaridade no Neo4j
    const results = await runQuery<Neo4jCarNode>(
      `
      CALL db.index.vector.queryNodes('car_embeddings', $topK, $queryEmbedding)
      YIELD node, score
      RETURN node, score
      ORDER BY score DESC
      `,
      {
        topK,
        queryEmbedding,
      }
    );

    // 3. Formatar resultado
    const cars: CarResult[] = results.map((r) => ({
      id: r.node.properties.id,
      marca: r.node.properties.marca,
      modelo: r.node.properties.modelo,
      ano: r.node.properties.ano,
      cor: r.node.properties.cor,
      tipo: r.node.properties.tipo,
      combustivel: r.node.properties.combustivel,
      cambio: r.node.properties.cambio,
      motor: r.node.properties.motor,
      potencia: r.node.properties.potencia,
      quilometragem: r.node.properties.quilometragem,
      preco: r.node.properties.preco,
      portas: r.node.properties.portas,
      descricao: r.node.properties.descricao,
      score: typeof r.score === "number" ? r.score : 0,
    }));

    // 4. Geração da resposta RAG via LLM (falha silenciosa — não bloqueia os cards)
    let aiResponse: string | null = null;
    if (cars.length > 0) {
      try {
        aiResponse = await generateRagResponse(query, cars);
      } catch (err) {
        console.error("Erro na geração RAG:", err);
      }
    }

    return NextResponse.json({ results: cars, aiResponse, query, totalFound: cars.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro na busca:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
