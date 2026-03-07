import { NextResponse } from "next/server";
import { runQuery } from "@/services/neo4j";
import { generateEmbeddingsBatch, EMBEDDING_DIMENSIONS } from "@/services/embeddings";
import { carsDataset } from "@/lib/cars-data";

// Divide array em chunks para processar em lotes
function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function POST() {
  try {
    // 1. Criar índice vetorial no Neo4j (se não existir)
    await runQuery(`
      CREATE VECTOR INDEX car_embeddings IF NOT EXISTS
      FOR (c:Car) ON (c.embedding)
      OPTIONS {
        indexConfig: {
          \`vector.dimensions\`: ${EMBEDDING_DIMENSIONS},
          \`vector.similarity_function\`: 'cosine'
        }
      }
    `);

    // 2. Limpar dados existentes
    await runQuery(`MATCH (c:Car) DETACH DELETE c`);

    // 3. Processar em lotes de 20 para não sobrecarregar a API de embeddings
    const batches = chunk(carsDataset, 20);
    let totalInserted = 0;

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      console.log(
        `🔄 Processando lote ${batchIdx + 1}/${batches.length} (${batch.length} carros)...`
      );

      // Gerar embeddings para o lote
      const texts = batch.map((car) => car.descricao);
      const embeddings = await generateEmbeddingsBatch(texts);

      // Inserir no Neo4j
      for (let i = 0; i < batch.length; i++) {
        const car = batch[i];
        const embedding = embeddings[i];

        await runQuery(
          `
          CREATE (c:Car {
            id: $id,
            marca: $marca,
            modelo: $modelo,
            ano: $ano,
            cor: $cor,
            tipo: $tipo,
            combustivel: $combustivel,
            cambio: $cambio,
            motor: $motor,
            potencia: $potencia,
            quilometragem: $quilometragem,
            preco: $preco,
            portas: $portas,
            descricao: $descricao,
            embedding: $embedding
          })
          `,
          {
            id: car.id,
            marca: car.marca,
            modelo: car.modelo,
            ano: car.ano,
            cor: car.cor,
            tipo: car.tipo,
            combustivel: car.combustivel,
            cambio: car.cambio,
            motor: car.motor,
            potencia: car.potencia,
            quilometragem: car.quilometragem,
            preco: car.preco,
            portas: car.portas,
            descricao: car.descricao,
            embedding,
          }
        );
        totalInserted++;
      }
    }

    // 4. Contar carros inseridos
    const countResult = await runQuery<{ total: { low: number; high: number } }>(
      `MATCH (c:Car) RETURN count(c) AS total`
    );
    const total = countResult[0]?.total?.low ?? countResult[0]?.total ?? totalInserted;

    return NextResponse.json({
      success: true,
      message: `✅ Seed concluído! ${total} carros inseridos com embeddings vetoriais.`,
      total,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro no seed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await runQuery<{ total: { low: number } }>(
      `MATCH (c:Car) RETURN count(c) AS total`
    );
    const total = result[0]?.total?.low ?? 0;
    return NextResponse.json({ total, seeded: total > 0 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
