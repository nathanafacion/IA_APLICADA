import { runQuery } from "@/services/neo4j";
import CarSearch from "@/features/cars/components/CarSearch/CarSearch";

async function getIsSeeded(): Promise<boolean> {
  try {
    const result = await runQuery<{ total: number }>(
      "MATCH (c:Car) RETURN count(c) AS total"
    );
    return Number(result[0]?.total ?? 0) > 0;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const isSeeded = await getIsSeeded();
  return <CarSearch initialSeeded={isSeeded} />;
}
