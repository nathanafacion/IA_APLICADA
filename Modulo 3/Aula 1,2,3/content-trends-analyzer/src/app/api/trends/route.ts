import { NextResponse } from "next/server";
import { fetchTrendingNow } from "@/features/trends/services/trendsService";

export async function GET() {
  const terms = await fetchTrendingNow();
  return NextResponse.json(terms);
}
